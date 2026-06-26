'use client';

import { useEffect, useRef } from 'react';

/* ============================================================
   Particle parameters (validated in Blender prototype)
   500 pts · 3 depth layers · #22D3EE · cursor magnetic field
   ============================================================ */
const NEAR_COUNT = 125;
const MID_COUNT  = 250;
const FAR_COUNT  = 125;
const N          = NEAR_COUNT + MID_COUNT + FAR_COUNT;   // 500

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

/* Build static 3D positions for all particles.
   XY  : field-space coords in [-1.05, 1.05] — perspective maps these
         to fill the full viewport (near layer reaches edges, far pulls in).
   Z   : depth value [0.20, 1.00]
          1.0 = near (large, bright, reacts most to cursor)
          0.2 = far  (small, dim,   reacts least)
   phase: random per-particle for independent idle drift.            */
function buildParticles() {
  const rand = seededRng(7);

  const pos   = new Float32Array(N * 3);   // x, y, z
  const phase = new Float32Array(N);

  let i = 0;

  const fillLayer = (count: number, zMin: number, zSpan: number) => {
    for (let k = 0; k < count; k++, i++) {
      pos[i * 3]     = (rand() * 2 - 1) * 1.05;
      pos[i * 3 + 1] = (rand() * 2 - 1) * 1.05;
      pos[i * 3 + 2] = zMin + rand() * zSpan;
      phase[i]       = rand() * Math.PI * 2;
    }
  };

  fillLayer(NEAR_COUNT, 0.70, 0.30);  // Z ∈ [0.70, 1.00]
  fillLayer(MID_COUNT,  0.40, 0.30);  // Z ∈ [0.40, 0.70]
  fillLayer(FAR_COUNT,  0.20, 0.20);  // Z ∈ [0.20, 0.40]

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
  uniform vec2  u_cursor;          /* smoothed cursor in NDC [-1,1] */
  uniform float u_aspect;          /* canvas w/h (for circular falloff) */
  uniform float u_ptBase;          /* base point size in px */
  uniform float u_cursor_strength; /* 0 on mobile/reduced, 1 on desktop */

  varying float v_depth;
  varying float v_glow;            /* 0..1 proximity to cursor */

  void main() {
    float z = a_pos.z;  /* [0.2, 1.0] */

    /* Idle drift — gentle Lissajous per particle */
    vec2 drift = vec2(
      sin(u_time * 0.18 + a_phase)         * 0.020,
      cos(u_time * 0.23 + a_phase * 1.618) * 0.020
    );

    vec2 pos2d = a_pos.xy + drift;

    /* Perspective (pinhole eye at z=2.0): near layers fill the frame,
       far layers pull toward center → real depth. */
    float eye_z = 2.0;
    float proj  = eye_z / (eye_z + 1.0 - z);
    vec2  ndc   = pos2d * proj;

    /* ── Magnetic field: per-particle attraction toward the cursor ──
       delta points from particle to cursor. Falloff is gaussian in
       aspect-corrected screen space so the influence is a circle, not
       an ellipse. Near layers (high z) are pulled harder. */
    vec2  delta       = u_cursor - ndc;
    vec2  deltaScreen = vec2(delta.x * u_aspect, delta.y);
    float dist        = length(deltaScreen);
    float R           = 0.60;
    float falloff     = exp(-(dist * dist) / (R * R));
    float pull        = falloff * 0.34 * (0.40 + z * 0.80) * u_cursor_strength;
    ndc += delta * pull;

    gl_Position  = vec4(ndc, 0.0, 1.0);

    /* Size: depth + perspective; grows when close to the cursor */
    gl_PointSize = u_ptBase * (0.45 + z * 0.85) * proj
                 * (1.0 + falloff * 1.10 * u_cursor_strength);

    v_depth = z;
    v_glow  = falloff * u_cursor_strength;
  }
`;

const FRAG = `
  precision mediump float;

  varying float v_depth;
  varying float v_glow;

  void main() {
    vec2  coord = gl_PointCoord - vec2(0.5);
    float d     = length(coord);
    if (d > 0.5) discard;

    /* Soft disc with a brighter core */
    float disc = 1.0 - smoothstep(0.10, 0.50, d);

    /* Depth-based opacity — much more visible than before.
       Near brighter, far dimmer. Marquee text (z-10) stays dominant. */
    float baseAlpha = disc * (0.32 + v_depth * 0.42);   /* [0.32, 0.74] */

    /* Brighten sharply near the cursor */
    float alpha = baseAlpha * (1.0 + v_glow * 1.6);

    /* Color heats from brand cyan toward a near-white cyan at the cursor */
    vec3 base = vec3(0.133, 0.827, 0.933);   /* #22D3EE */
    vec3 hot  = vec3(0.78, 0.98, 1.00);
    vec3 col  = mix(base, hot, v_glow);

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ============================================================
   Component
   ============================================================
 * Raw-WebGL 3D cursor magnetic field.
 * Follows the NeuralNoise / ManifestoParticles pattern exactly:
 *   IntersectionObserver pause · ResizeObserver · DPR cap 1.5
 *   pointermove tracking with lerp smoothing
 *   prefers-reduced-motion: static render, no RAF
 *   Full GPU cleanup on unmount.
 *
 * Cursor behaviour: each particle is attracted toward the cursor with a
 * gaussian falloff (a "magnet"). Near-cursor particles gather, grow and
 * glow brighter. Mobile (hover:none) keeps only the idle drift.
 */
export function IntegrationField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

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

    gl.uniform1f(uCursorStrength, isTouch ? 0.0 : 1.0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);   /* additive — particles glow on overlap */
    gl.clearColor(0, 0, 0, 0);

    /* ── Resize ──────────────────────────────────────────────── */
    const MAX_DPR = 1.5;
    let ptBase = 6;

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
      ptBase = Math.max(4, Math.round(h / 70));
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

    /* ── Cursor tracking (desktop only) ──────────────────────────
       Start off-screen (2,2) so there's no initial gather at center.
       Snap on first move to avoid a sweep, then lerp for spring-feel.
       Release back off-screen when the pointer leaves the window.   */
    const OFF = 2.0;
    const cursor = { x: OFF, y: OFF, tx: OFF, ty: OFF, seen: false };

    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      cursor.tx =  ((e.clientX - r.left) / r.width)  * 2 - 1;
      cursor.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);  /* Y flipped */
      if (!cursor.seen) { cursor.x = cursor.tx; cursor.y = cursor.ty; cursor.seen = true; }
    };
    const onPointerLeave = () => { cursor.tx = OFF; cursor.ty = OFF; };

    if (!isTouch) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('mouseleave', onPointerLeave);
    }

    /* ── Render loop ─────────────────────────────────────────── */
    const render = () => {
      if (visible) {
        if (!reduced && !isTouch) {
          cursor.x += (cursor.tx - cursor.x) * 0.08;
          cursor.y += (cursor.ty - cursor.y) * 0.08;
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime,   reduced ? 0 : performance.now() * 0.001);
        gl.uniform2f(uCursor, cursor.x, cursor.y);
        gl.drawArrays(gl.POINTS, 0, N);
      }
      if (!reduced) rafRef.current = requestAnimationFrame(render);
    };

    if (reduced) {
      gl.uniform1f(uTime,   0);
      gl.uniform2f(uCursor, OFF, OFF);
      gl.drawArrays(gl.POINTS, 0, N);
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    /* ── Cleanup ─────────────────────────────────────────────── */
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (!isTouch) {
        window.removeEventListener('pointermove', onPointerMove);
        document.documentElement.removeEventListener('mouseleave', onPointerLeave);
      }
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
