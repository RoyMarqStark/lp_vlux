'use client';

import { useEffect, useRef } from 'react';

/* ============================================================
   Fractured-structure field (validated in Blender prototype)
   8×4 node lattice · diagonal fault · displaced fragment ·
   red fracture edges · slow 3D rotation · #22D3EE / #F87171
   ============================================================ */
const COLS = 8;
const ROWS = 4;
const X_HALF = 2.0;
const Y_HALF = 0.72;
const X_STEP = (X_HALF * 2) / (COLS - 1);
const Y_STEP = (Y_HALF * 2) / (ROWS - 1);

/* Fragment B (the part that broke away) displacement */
const B_DX = 0.16;
const B_DY = -0.05;
const B_DD = 0.50;   // depth — gives the fault its 3D parallax on rotation

/* Mulberry32 — deterministic strut dropping (SSR/client parity) */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Which fragment a node belongs to — diagonal fault line */
function side(c: number, r: number): 'A' | 'B' {
  return c + (ROWS - 1 - r) * 0.9 > 4.6 ? 'B' : 'A';
}

function nodePos(c: number, r: number): [number, number, number] {
  let x = -X_HALF + c * X_STEP;
  let y = -Y_HALF + r * Y_STEP;
  let d = 0;
  if (side(c, r) === 'B') { x += B_DX; y += B_DY; d += B_DD; }
  return [x, y, d];
}

/* A node is "red" (fracture edge) if any neighbour is on the other fragment */
function isFracture(c: number, r: number): boolean {
  const me = side(c, r);
  const nb: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dc, dr] of nb) {
    const nc = c + dc, nr = r + dr;
    if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && side(nc, nr) !== me) return true;
  }
  return false;
}

function buildLattice() {
  const rand = seededRng(3);

  const nodePosArr: number[] = [];
  const nodeRedArr: number[] = [];
  const linePosArr: number[] = [];

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const [x, y, d] = nodePos(c, r);
      nodePosArr.push(x, y, d);
      nodeRedArr.push(isFracture(c, r) ? 1 : 0);

      // Struts to right + up neighbours, same fragment only, ~15% dropped
      for (const [dc, dr] of [[1, 0], [0, 1]] as Array<[number, number]>) {
        const nc = c + dc, nr = r + dr;
        if (nc < COLS && nr < ROWS && side(c, r) === side(nc, nr) && rand() > 0.15) {
          const [x2, y2, d2] = nodePos(nc, nr);
          linePosArr.push(x, y, d, x2, y2, d2);
        }
      }
    }
  }

  return {
    nodePos: new Float32Array(nodePosArr),
    nodeRed: new Float32Array(nodeRedArr),
    linePos: new Float32Array(linePosArr),
    nodeCount: nodeRedArr.length,
    lineVerts: linePosArr.length / 3,
  };
}

/* ============================================================
   Shaders
   ============================================================ */
const VERT = `
  precision mediump float;
  attribute vec3  a_pos;     /* x=horizontal, y=vertical, z=depth */
  attribute float a_red;     /* 0 = cyan, 1 = fracture red */
  uniform float u_time;
  uniform float u_sx;        /* world→NDC x scale (keeps proportion, fits any aspect) */
  uniform float u_sy;        /* world→NDC y scale */
  uniform float u_ptBase;
  uniform float u_reduced;
  varying float v_red;
  varying float v_depth;

  void main() {
    /* Slow oscillating rotation around the vertical axis */
    float a  = (u_reduced > 0.5) ? 0.32 : sin(u_time * 0.20) * 0.5;
    float ca = cos(a), sa = sin(a);
    float rx = a_pos.x * ca + a_pos.z * sa;
    float rd = -a_pos.x * sa + a_pos.z * ca;

    /* Constant tilt around the horizontal axis → 3/4 view */
    float tx  = 0.13;
    float cty = cos(tx), sty = sin(tx);
    float ry  = a_pos.y * cty - rd * sty;
    float rd2 = a_pos.y * sty + rd * cty;

    /* Perspective (camera in front at depth = -2) */
    float proj = 2.0 / (2.0 + rd2);
    gl_Position  = vec4(rx * proj * u_sx, ry * proj * u_sy, 0.0, 1.0);
    gl_PointSize = u_ptBase * proj;
    v_red   = a_red;
    v_depth = rd2;
  }
`;

const FRAG = `
  precision mediump float;
  uniform float u_isPoint;
  uniform float u_time;
  uniform float u_reduced;
  varying float v_red;
  varying float v_depth;

  void main() {
    float shape = 1.0;
    if (u_isPoint > 0.5) {
      vec2  coord = gl_PointCoord - vec2(0.5);
      float dd    = length(coord);
      if (dd > 0.5) discard;
      shape = 1.0 - smoothstep(0.18, 0.5, dd);
    }

    /* Subtle pulse — fracture (red) nodes throb harder */
    float pulse = (u_reduced > 0.5) ? 1.0 : (0.82 + 0.18 * sin(u_time * 1.7 + v_depth * 3.0));
    float redPulse = mix(0.92, pulse, v_red);

    vec3 cyan = vec3(0.133, 0.827, 0.933);
    vec3 red  = vec3(0.973, 0.443, 0.443);
    vec3 col  = mix(cyan, red, v_red);

    float baseA = (u_isPoint > 0.5) ? 0.85 : 0.34;
    gl_FragColor = vec4(col, shape * baseA * redPulse);
  }
`;

/* ============================================================
   Component — raw WebGL, NeuralNoise/IntegrationField pattern.
   Ambient backdrop for the Problem [02] section: a data
   structure that has fractured into two displaced fragments.
   ============================================================ */
export function FractureField() {
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

    const compile = (src: string, type: number): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('[FractureField] Shader:', gl.getShaderInfoLog(sh));
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
      console.warn('[FractureField] Link:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    /* ── Geometry → buffers ── */
    const { nodePos, nodeRed, linePos, nodeCount, lineVerts } = buildLattice();

    const mkBuf = (data: Float32Array) => {
      const b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    };

    const bufNodePos = mkBuf(nodePos);
    const bufNodeRed = mkBuf(nodeRed);
    const bufLinePos = mkBuf(linePos);
    const lineRed    = new Float32Array(lineVerts);   // all 0 → cyan struts
    const bufLineRed = mkBuf(lineRed);

    const locPos = gl.getAttribLocation(prog, 'a_pos');
    const locRed = gl.getAttribLocation(prog, 'a_red');

    const bindPair = (posBuf: WebGLBuffer, redBuf: WebGLBuffer) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.enableVertexAttribArray(locPos);
      gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, redBuf);
      gl.enableVertexAttribArray(locRed);
      gl.vertexAttribPointer(locRed, 1, gl.FLOAT, false, 0, 0);
    };

    const uTime    = gl.getUniformLocation(prog, 'u_time');
    const uSx      = gl.getUniformLocation(prog, 'u_sx');
    const uSy      = gl.getUniformLocation(prog, 'u_sy');
    const uPtBase  = gl.getUniformLocation(prog, 'u_ptBase');
    const uReduced = gl.getUniformLocation(prog, 'u_reduced');
    const uIsPoint = gl.getUniformLocation(prog, 'u_isPoint');

    gl.uniform1f(uReduced, reduced ? 1 : 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);   /* additive glow */
    gl.clearColor(0, 0, 0, 0);

    /* ── Resize ── */
    const MAX_DPR = 1.5;
    let ptBase = 8;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const { width, height } = parent.getBoundingClientRect();
      const w = Math.max(1, Math.round(width  * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      // Fit the lattice to the canvas while keeping square proportions.
      // content half-extents (+ slack for node radius / fragment offset):
      const CHX = 2.3, CHY = 0.9, TARGET = 0.85;
      const k = Math.min((TARGET * w) / (2 * CHX), (TARGET * h) / (2 * CHY));
      gl.uniform1f(uSx, (2 * k) / w);
      gl.uniform1f(uSy, (2 * k) / h);
      ptBase = Math.max(4, Math.round(h / 95));
      gl.uniform1f(uPtBase, ptBase);
    };
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    /* ── Pause offscreen ── */
    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => { visible = e?.isIntersecting ?? false; },
      { threshold: 0 },
    );
    io.observe(canvas);

    /* ── Draw ── */
    const draw = (t: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      // struts (lines) first
      gl.uniform1f(uIsPoint, 0);
      bindPair(bufLinePos, bufLineRed);
      gl.drawArrays(gl.LINES, 0, lineVerts);
      // nodes (points) on top
      gl.uniform1f(uIsPoint, 1);
      bindPair(bufNodePos, bufNodeRed);
      gl.drawArrays(gl.POINTS, 0, nodeCount);
    };

    const render = () => {
      if (visible) draw(performance.now() * 0.001);
      rafRef.current = requestAnimationFrame(render);
    };

    if (reduced) {
      draw(0);
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    /* ── Cleanup ── */
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(bufNodePos);
      gl.deleteBuffer(bufNodeRed);
      gl.deleteBuffer(bufLinePos);
      gl.deleteBuffer(bufLineRed);
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
