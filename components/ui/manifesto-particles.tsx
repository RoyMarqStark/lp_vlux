'use client';

import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';

/* ============================================================
   Particle parameters (validated in Blender prototype)
   250 pts  ·  25×10 grid  ·  #22D3EE / #67E8F9
   ============================================================ */
const N    = 250;
const COLS = 25;
const ROWS = 10;

/* Mulberry32 — deterministic seeded RNG so SSR and client agree */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPositions() {
  const rand    = seededRng(42);
  const chaos   = new Float32Array(N * 2);
  const order   = new Float32Array(N * 2);
  const accent  = new Float32Array(N);   // 0=main cyan, 1=light cyan

  for (let i = 0; i < N; i++) {
    chaos[i * 2]     = (rand() * 2 - 1) * 0.95;   // X ∈ [-0.95, 0.95]
    chaos[i * 2 + 1] = (rand() * 2 - 1) * 0.88;   // Y ∈ [-0.88, 0.88]
    accent[i]        = rand() < 0.10 ? 1.0 : 0.0; // 10% lighter
  }

  // Grid centered in NDC
  const xHalf = 0.88;
  const yHalf = 0.72;
  const xStep = (xHalf * 2) / (COLS - 1);
  const yStep = (yHalf * 2) / (ROWS - 1);

  for (let i = 0; i < N; i++) {
    const col        = i % COLS;
    const row        = Math.floor(i / COLS);
    order[i * 2]     = -xHalf + col * xStep;
    order[i * 2 + 1] = -yHalf + row * yStep;
  }

  return { chaos, order, accent };
}

/* ============================================================
   Shaders
   ============================================================ */
const VERT = `
  precision mediump float;
  attribute vec2  a_chaos;
  attribute vec2  a_order;
  attribute float a_accent;
  uniform   float u_progress;
  uniform   float u_pointSize;
  uniform   float u_fadeOpacity;
  varying   float v_accent;
  varying   float v_opacity;

  void main() {
    float t = smoothstep(0.0, 1.0, u_progress);
    vec2  pos = mix(a_chaos, a_order, t);
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = u_pointSize;
    v_accent  = a_accent;
    v_opacity = u_fadeOpacity;
  }
`;

const FRAG = `
  precision mediump float;
  uniform vec3  u_color_main;
  uniform vec3  u_color_accent;
  varying float v_accent;
  varying float v_opacity;

  void main() {
    vec2  coord = gl_PointCoord - vec2(0.5);
    float d     = length(coord);
    if (d > 0.5) discard;
    float a = (1.0 - smoothstep(0.25, 0.5, d)) * v_opacity;
    vec3  col = mix(u_color_main, u_color_accent, v_accent);
    gl_FragColor = vec4(col, a);
  }
`;

/* Hex string "22D3EE" → [r,g,b] 0-1 */
function hex3(h: string): [number, number, number] {
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

/* ============================================================
   Props
   ============================================================ */
export interface ManifestoParticlesProps {
  /** scrollYProgress MotionValue from the manifesto section.
   *  Subscribed via .on('change') — never triggers a React re-render. */
  scrollProgress: MotionValue<number>;
}

/* ============================================================
   Component
   ============================================================
 * Raw-WebGL particle system (no Three.js dependency).
 * Follows the same patterns as NeuralNoise:
 *   IntersectionObserver pause · ResizeObserver · DPR cap 1.5 · full cleanup.
 *
 * Scroll mapping (manifesto section):
 *   0.00 → 0.12  fade in
 *   0.12 → 0.70  chaos → order lerp
 *   0.70 → 0.92  hold order
 *   0.92 → 1.00  fade out
 *
 * prefers-reduced-motion: skips straight to order state, RAF stopped.
 */
export function ManifestoParticles({ scrollProgress }: ManifestoParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctxOpts: WebGLContextAttributes = { alpha: true, premultipliedAlpha: false };
    const gl = (
      canvas.getContext('webgl', ctxOpts) ??
      canvas.getContext('experimental-webgl', ctxOpts)
    ) as WebGLRenderingContext | null;
    if (!gl) return;

    /* ── Compile & link ──────────────────────────────────────────── */
    const compile = (src: string, type: number): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('[ManifestoParticles] Shader:', gl.getShaderInfoLog(sh));
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
      console.warn('[ManifestoParticles] Link:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    /* ── Particle data → GPU buffers ─────────────────────────────── */
    const { chaos, order, accent } = buildPositions();

    const mkBuf = (data: Float32Array) => {
      const b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    };

    const bufChaos  = mkBuf(chaos);
    const bufOrder  = mkBuf(order);
    const bufAccent = mkBuf(accent);

    const locChaos  = gl.getAttribLocation(prog, 'a_chaos');
    const locOrder  = gl.getAttribLocation(prog, 'a_order');
    const locAccent = gl.getAttribLocation(prog, 'a_accent');

    /* Bind all attribute buffers once — they don't change per-frame */
    const bindAttr = (buf: WebGLBuffer, loc: number, size: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    bindAttr(bufChaos,  locChaos,  2);
    bindAttr(bufOrder,  locOrder,  2);
    bindAttr(bufAccent, locAccent, 1);

    const uProgress    = gl.getUniformLocation(prog, 'u_progress');
    const uPointSize   = gl.getUniformLocation(prog, 'u_pointSize');
    const uFadeOpacity = gl.getUniformLocation(prog, 'u_fadeOpacity');
    const uColorMain   = gl.getUniformLocation(prog, 'u_color_main');
    const uColorAccent = gl.getUniformLocation(prog, 'u_color_accent');

    const [mr, mg, mb] = hex3('22D3EE');
    const [ar, ag, ab] = hex3('67E8F9');
    gl.uniform3f(uColorMain,   mr, mg, mb);
    gl.uniform3f(uColorAccent, ar, ag, ab);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    /* ── Resize ──────────────────────────────────────────────────── */
    const MAX_DPR = 1.5;
    let ptSize = 4;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr     = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const { width, height } = parent.getBoundingClientRect();
      const w = Math.max(1, Math.round(width  * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      // Scale point size with canvas height — ~4px at 600px, 6px at 900px
      ptSize = Math.max(2, Math.round(h / 140));
      gl.uniform1f(uPointSize, ptSize);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    /* ── Pause when offscreen ────────────────────────────────────── */
    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => { visible = e?.isIntersecting ?? false; },
      { threshold: 0 },
    );
    io.observe(canvas);

    /* ── Scroll → particle state ─────────────────────────────────── */
    const getState = (raw: number) => {
      if (reduced) return { progress: 1.0, opacity: 0.50 };
      const opacity =
        raw < 0.12 ? raw / 0.12
        : raw > 0.92 ? 1 - (raw - 0.92) / 0.08
        : 1.0;
      const progress =
        raw < 0.12 ? 0.0
        : raw > 0.70 ? 1.0
        : (raw - 0.12) / (0.70 - 0.12);
      return { progress, opacity: Math.max(0, Math.min(1, opacity)) * 0.50 };
    };

    /* Start fully faded out; jump to order if reduced motion */
    let curProgress = reduced ? 1.0 : 0.0;
    let curOpacity  = reduced ? 0.50 : 0.0;
    let tgtProgress = curProgress;
    let tgtOpacity  = curOpacity;

    const unsub = scrollProgress.on('change', (val: number) => {
      const s = getState(val);
      tgtProgress = s.progress;
      tgtOpacity  = s.opacity;
    });

    /* ── Render loop ─────────────────────────────────────────────── */
    const render = () => {
      if (visible) {
        if (!reduced) {
          curProgress += (tgtProgress - curProgress) * 0.06;
          curOpacity  += (tgtOpacity  - curOpacity)  * 0.06;
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uProgress,    curProgress);
        gl.uniform1f(uFadeOpacity, curOpacity);
        gl.drawArrays(gl.POINTS, 0, N);
      }
      if (!reduced) rafRef.current = requestAnimationFrame(render);
    };

    if (reduced) {
      // One-shot draw for reduced-motion
      gl.uniform1f(uProgress,    1.0);
      gl.uniform1f(uFadeOpacity, 0.50);
      gl.drawArrays(gl.POINTS, 0, N);
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    /* ── Cleanup ─────────────────────────────────────────────────── */
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      unsub();
      ro.disconnect();
      io.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(bufChaos);
      gl.deleteBuffer(bufOrder);
      gl.deleteBuffer(bufAccent);
    };
  }, [scrollProgress]);

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
