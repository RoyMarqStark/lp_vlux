'use client';

import { useEffect, useRef } from 'react';

/* ============================================================
   Shader sources
   ============================================================ */
const VERTEX_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  attribute vec2 a_position;
  void main() {
    vUv = 0.5 * (a_position + 1.0);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_ratio;
  uniform vec2  u_pointer_position;
  uniform vec3  u_color;
  uniform float u_speed;

  vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
  }

  float neuro_shape(vec2 uv, float t, float p) {
    vec2 sine_acc = vec2(0.0);
    vec2 res = vec2(0.0);
    float scale = 8.0;
    for (int j = 0; j < 15; j++) {
      uv = rotate(uv, 1.0);
      sine_acc = rotate(sine_acc, 1.0);
      vec2 layer = uv * scale + float(j) + sine_acc - t;
      sine_acc += sin(layer) + 2.4 * p;
      res += (0.5 + 0.5 * cos(layer)) / scale;
      scale *= 1.2;
    }
    return res.x + res.y;
  }

  void main() {
    vec2 uv = 0.5 * vUv;
    uv.x *= u_ratio;
    vec2 pointer = vUv - u_pointer_position;
    pointer.x *= u_ratio;
    float p = clamp(length(pointer), 0.0, 1.0);
    p = 0.5 * pow(1.0 - p, 2.0);
    float t = u_speed * u_time;
    vec3 col = vec3(0.0);
    float noise = neuro_shape(uv, t, p);
    noise = 1.2 * pow(noise, 3.0);
    noise += pow(noise, 10.0);
    noise = max(0.0, noise - 0.5);
    noise *= (1.0 - length(vUv - 0.5));
    col = u_color * noise;
    gl_FragColor = vec4(col, noise);
  }
`;

/* ============================================================
   Props
   ============================================================ */
export interface NeuralNoiseProps {
  /**
   * RGB color in normalized 0–1 space.
   * Default = VLUX cyan-core (#22D3EE) → [0.133, 0.827, 0.933].
   */
  color?: readonly [number, number, number];
  /** CSS opacity applied to the canvas (0–1). */
  opacity?: number;
  /** Animation speed multiplier. Lower = slower. */
  speed?: number;
  /**
   * Maximum device pixel ratio cap (perf).
   * Default 1.25 — decorative effect doesn't need full retina.
   */
  maxDpr?: number;
  /** Extra className for the canvas element. */
  className?: string;
}

/* ============================================================
   Component
   ============================================================
 * WebGL "neural noise" background effect.
 *
 * - Scopes itself to its nearest positioned parent (`inset: 0`).
 * - Respects `prefers-reduced-motion` — renders nothing if user opted out.
 * - Pauses when offscreen via IntersectionObserver (saves battery).
 * - Resizes via ResizeObserver against parent (not window).
 * - Tuned defaults for subtle VLUX brand cyan glow.
 *
 * Usage:
 * ```tsx
 * <section className="relative overflow-hidden">
 *   <div className="absolute inset-0 z-0"><NeuralNoise /></div>
 *   <div className="relative z-10">{content}</div>
 * </section>
 * ```
 */
export function NeuralNoise({
  color = [0.133, 0.827, 0.933],
  opacity = 0.4,
  speed = 0.0007,
  maxDpr = 1.25,
  className,
}: NeuralNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced motion: render nothing, save battery and respect user preference.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctxOptions: WebGLContextAttributes = { alpha: true, premultipliedAlpha: false };
    const gl = (canvas.getContext('webgl', ctxOptions) ||
      canvas.getContext('experimental-webgl', ctxOptions)) as WebGLRenderingContext | null;
    if (!gl) {
      console.warn('NeuralNoise: WebGL not supported, skipping.');
      return;
    }

    // ---------- Shader helpers ----------
    const compile = (src: string, type: number): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('NeuralNoise shader error:', gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(VERTEX_SHADER, gl.VERTEX_SHADER);
    const fs = compile(FRAGMENT_SHADER, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('NeuralNoise program error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // ---------- Collect uniform locations ----------
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < uniformCount; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }

    // ---------- Geometry: fullscreen triangle strip ----------
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // ---------- Initial uniform values ----------
    if (uniforms.u_color) gl.uniform3f(uniforms.u_color, color[0], color[1], color[2]);
    if (uniforms.u_speed) gl.uniform1f(uniforms.u_speed, speed);

    // ---------- Resize to parent rect ----------
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const { width, height } = parent.getBoundingClientRect();
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (uniforms.u_ratio) gl.uniform1f(uniforms.u_ratio, w / h);
      gl.viewport(0, 0, w, h);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    // ---------- Pointer interaction (relative to canvas) ----------
    const pointer = { x: 0, y: 0, tX: 0, tY: 0 };
    const updatePointer = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      pointer.tX = cx - r.left;
      pointer.tY = cy - r.top;
    };
    const onMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.targetTouches[0];
      if (t) updatePointer(t.clientX, t.clientY);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });

    // ---------- Pause when offscreen ----------
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry?.isIntersecting ?? false; },
      { threshold: 0 },
    );
    io.observe(canvas);

    // ---------- Render loop ----------
    const render = () => {
      if (visible) {
        pointer.x += (pointer.tX - pointer.x) * 0.2;
        pointer.y += (pointer.tY - pointer.y) * 0.2;
        const r = canvas.getBoundingClientRect();
        const px = r.width > 0 ? pointer.x / r.width : 0;
        const py = r.height > 0 ? 1 - pointer.y / r.height : 0;
        if (uniforms.u_time) gl.uniform1f(uniforms.u_time, performance.now());
        if (uniforms.u_pointer_position) gl.uniform2f(uniforms.u_pointer_position, px, py);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    // ---------- Cleanup ----------
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onTouch);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [color, speed, maxDpr]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
      }}
    />
  );
}
