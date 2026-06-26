'use client';

import { useEffect, useRef } from 'react';

/* ============================================================
   Particle parameters (validated in Blender prototype)
   180 pts · 3 depth layers · #22D3EE · cursor parallax
   ============================================================ */
const NEAR_COUNT = 45;
const MID_COUNT  = 90;
const FAR_COUNT  = 45;
const N          = NEAR_COUNT + MID_COUNT + FAR_COUNT;   // 180

/* Mulberry32 — seeded RNG for deterministic SSR/client parity */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Build static 3D positions for all 180 particles.
   XY  : NDC-like screen plane  [-1.1, 1.1] × [-1.0, 1.0]
   Z   : depth value, mapped to [0.2, 1.0]
          1.0 = near (large, bright, moves most with cursor)
          0.2 = far  (small, dim,   moves least)
   phase: random per-particle for independent idle drift.         */
function buildParticles() {
  const rand = seededRng(7);

  const pos   = new Float32Array(N * 3);   // x, y, z
  const phase = new Float32Array(N);

  let i = 0;

  // Near layer — Z ∈ [0.70, 1.00]
  for (let k = 0; k < NEAR_COUNT; k++, i++) {
    pos[i * 3]     = (rand() * 2 - 1) * 1.10;
    pos[i * 3 + 1] = (rand() * 2 - 1) * 0.95;
    pos[i * 3 + 2] = 0.70 + rand() * 0.30;
    phase[i]       = rand() * Math.PI * 2;
  }

  // Mid layer — Z ∈ [0.40, 0.70]
  for (let k = 0; k < MID_COUNT; k++, i++) {
    pos[i * 3]     = (rand() * 2 - 1) * 1.10;
    pos[i * 3 + 1] = (rand() * 2 - 1) * 0.95;
    pos[i * 3 + 2] = 0.40 + rand() * 0.30;
    phase[i]       = rand() * Math.PI * 2;
  }

  // Far layer — Z ∈ [0.20, 0.40]
  for (let k = 0; k < FAR_COUNT; k++, i++) {
    pos[i * 3]     = (rand() * 2 - 1) * 1.10;
    pos[i * 3 + 1] = (rand() * 2 - 1) * 0.95;
    pos[i * 3 + 2] = 0.20 + rand() * 0.20;
    phase[i]       = rand() * Math.PI * 2;
  }

  return { pos, phase };
}

/* ============================================================
   Shaders
   ============================================================ */
const VERT = `
  precision mediump float;

  attribute vec3  a_pos;    /* xy = rest position, z = depth [0.2,1.0] */
  attribute float a_phase;  /* per-particle idle drift phase */

  uniform float u_time;
  uniform vec2  u_cursor;   /* smoothed cursor in NDC [-1,1], (0,0) = center */
  uniform float u_aspect;   /* canvas w/h */
  uniform float u_ptBase;   /* base point size in px */
  uniform float u_cursor_strength; /* 0 on mobile/reduced, 1 on desktop */

  varying float v_depth;

  void main() {
    float z = a_pos.z;  /* [0.2, 1.0] */

    /* Idle drift — gentle Lissajous per particle */
    vec2 drift = vec2(
      sin(u_time * 0.18 + a_phase)         * 0.028,
      cos(u_time * 0.23 + a_phase * 1.618) * 0.028
    );

    /* Cursor parallax — near layers shift most, far least */
    vec2 parallax = u_cursor * z * 0.18 * u_cursor_strength;

    vec2 pos2d = a_pos.xy + drift + parallax;

    /* Simple perspective (pinhole at eye_z = 2.0 in front of z=0 plane) */
    float eye_z = 2.0;
    float proj  = eye_z / (eye_z + 1.0 - z);
    vec2  screen = pos2d * proj;

    gl_Position  = vec4(screen.x / u_aspect, screen.y, 0.0, 1.0);
    /* Point size: depth + perspective scale; near=bigger, far=smaller */
    gl_PointSize = u_ptBase * (0.45 + z * 0.85) * proj;
    v_depth = z;
  }
`;

const FRAG = `
  precision mediump float;

  varying float v_depth;

  void main() {
    vec2  coord = gl_PointCoord - vec2(0.5);
    float d     = length(coord);
    if (d > 0.5) discard;

    /* Soft disc with gaussian-ish falloff */
    float disc  = 1.0 - smoothstep(0.20, 0.50, d);

    /* Depth-based opacity: near brighter, far dimmer.
       Total alpha purposely low so the marquee text stays dominant. */
    float alpha = disc * (0.12 + v_depth * 0.25);  /* [0.12, 0.37] */

    /* #22D3EE → linear (0.133, 0.827, 0.933) */
    gl_FragColor = vec4(0.133, 0.827, 0.933, alpha);
  }
`;

/* ============================================================
   Component
   ============================================================
 * Raw-WebGL 3D cursor parallax field.
 * Follows the NeuralNoise / ManifestoParticles pattern exactly:
 *   IntersectionObserver pause · ResizeObserver · DPR cap 1.5
 *   pointermove tracking with lerp smoothing
 *   prefers-reduced-motion: static render, no RAF
 *   Full GPU cleanup on unmount.
 *
 * Mobile (hover: none media query): cursor parallax disabled,
 * only idle drift runs.
 */
export function IntegrationField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch  = window.matchMedia('(hover: none)').matches;

    const ctxOpts: WebGLContextAttributes = { alpha: true, premultipliedAlpha: false };
    const gl = (
      canvas.getContext('webgl', ctxOpts) ??
      canvas.getContext('experimental-webgl', ctxOpts)
    ) as WebGLRenderingContext | null;
    if (!gl) return;

    /* ── Compile & link ──────────────────────────────────────── */
    const compile = (src: string, type: number): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('[IntegrationField] Shader:', gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(VERT, gl.VERTEX_SHADER);
    const fs = compile(FRAG, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[IntegrationField] Link:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    /* ── Particle data → GPU buffers ─────────────────────────── */
    const { pos, phase } = buildParticles();

    const mkBuf = (data: Float32Array) => {
      const b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    };

    const bufPos   = mkBuf(pos);
    const bufPhase = mkBuf(phase);

    const locPos   = gl.getAttribLocation(prog, 'a_pos');
    const locPhase = gl.getAttribLocation(prog, 'a_phase');

    /* Bind attributes once — buffers are static */
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufPhase);
    gl.enableVertexAttribArray(locPhase);
    gl.vertexAttribPointer(locPhase, 1, gl.FLOAT, false, 0, 0);

    const uTime           = gl.getUniformLocation(prog, 'u_time');
    const uCursor         = gl.getUniformLocation(prog, 'u_cursor');
    const uAspect         = gl.getUniformLocation(prog, 'u_aspect');
    const uPtBase         = gl.getUniformLocation(prog, 'u_ptBase');
    const uCursorStrength = gl.getUniformLocation(prog, 'u_cursor_strength');

    /* Cursor parallax off on touch/mobile */
    gl.uniform1f(uCursorStrength, isTouch ? 0.0 : 1.0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);   /* additive blend — particles glow on overlap */
    gl.clearColor(0, 0, 0, 0);

    /* ── Resize ──────────────────────────────────────────────── */
    const MAX_DPR = 1.5;
    let ptBase = 5;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const { width, height } = parent.getBoundingClientRect();
      const w = Math.max(1, Math.round(width  * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform1f(uAspect, w / h);
      /* Base point size scales with canvas height */
      ptBase = Math.max(3, Math.round(h / 80));
      gl.uniform1f(uPtBase, ptBase);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    /* ── Pause offscreen ─────────────────────────────────────── */
    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => { visible = e?.isIntersecting ?? false; },
      { threshold: 0 },
    );
    io.observe(canvas);

    /* ── Cursor tracking (desktop only) ─────────────────────── */
    const cursor = { x: 0, y: 0, tx: 0, ty: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      /* Convert to NDC [-1, 1] centered */
      cursor.tx = ((e.clientX - r.left) / r.width  * 2 - 1);
      cursor.ty = -((e.clientY - r.top)  / r.height * 2 - 1);  /* Y flipped */
    };

    if (!isTouch) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    /* ── Render loop ─────────────────────────────────────────── */
    const render = () => {
      if (visible) {
        if (!reduced && !isTouch) {
          /* Lerp cursor for spring-feel */
          cursor.x += (cursor.tx - cursor.x) * 0.07;
          cursor.y += (cursor.ty - cursor.y) * 0.07;
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime,   reduced ? 0 : performance.now() * 0.001);
        gl.uniform2f(uCursor, cursor.x, cursor.y);
        gl.drawArrays(gl.POINTS, 0, N);
      }
      if (!reduced) rafRef.current = requestAnimationFrame(render);
    };

    if (reduced) {
      /* One-shot static draw for reduced-motion */
      gl.uniform1f(uTime,   0);
      gl.uniform2f(uCursor, 0, 0);
      gl.drawArrays(gl.POINTS, 0, N);
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    /* ── Cleanup ─────────────────────────────────────────────── */
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (!isTouch) window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
      io.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(bufPos);
      gl.deleteBuffer(bufPhase);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
