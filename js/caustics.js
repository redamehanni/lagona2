// Caustiques d'eau en WebGL brut : le « plafond » de Nocta.
// Un seul shader, réutilisé par la bascule jour/nuit et par le sélecteur d'ambiances.
// Rendu uniquement quand le canvas est visible, une seule image fixe en mouvement réduit.

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

// Interférences itérées : chaque passe décale le domaine par des sin/cos du temps,
// les lignes fines qui en sortent ressemblent aux caustiques projetées par un verre ondulé.
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uScale;
uniform vec2 uWarp;

float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  uv *= uScale;
  uv += uWarp;
  float t = uTime * 0.32 + 23.0;
  float a = caustic(uv, t);
  float b = caustic(uv * 1.35 + 0.37, t * 0.8 + 3.1);
  float v = clamp(a * 0.75 + b * 0.45, 0.0, 1.6);
  vec3 col = uColor * (0.10 + v * 0.95) + vec3(v * v * 0.22);
  gl_FragColor = vec4(col * uIntensity, 1.0);
}
`;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Caustics {
  constructor(canvas, { color = [0.45, 0.85, 1.0], scale = 1.6, intensity = 1 } = {}) {
    this.canvas = canvas;
    this.color = color.slice();
    this.target = color.slice();
    this.intensity = intensity;
    this.scale = scale;
    this.warp = [0, 0];
    this.visible = false;
    this.ok = false;
    this.start = performance.now();
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    this.gl = gl;
    const prog = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return; }
      gl.attachShader(prog, s);
    }
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    for (const n of ['uRes', 'uTime', 'uColor', 'uIntensity', 'uScale', 'uWarp']) this.u[n] = gl.getUniformLocation(prog, n);
    this.ok = true;

    new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible) this.kick();
    }, { rootMargin: '120px' }).observe(canvas);
    new ResizeObserver(() => { this.resize(); this.draw(); }).observe(canvas);
    this.resize();
  }

  resize() {
    // Les caustiques sont floues par nature : un rendu à demi-résolution suffit et soulage le GPU.
    const dpr = Math.min(devicePixelRatio || 1, 1.5) * 0.6;
    const w = Math.max(2, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(2, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  setColor(rgb) { this.target = rgb.slice(); this.kick(); }

  kick() {
    if (this.raf || !this.ok) return;
    const loop = () => {
      this.raf = 0;
      this.draw();
      if (this.visible && !reduce) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  draw() {
    if (!this.ok) return;
    const { gl, u } = this;
    for (let i = 0; i < 3; i++) this.color[i] += (this.target[i] - this.color[i]) * 0.06;
    const t = reduce ? 4 : (performance.now() - this.start) / 1000;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.uTime, t);
    gl.uniform3fv(u.uColor, this.color);
    gl.uniform1f(u.uIntensity, this.intensity);
    gl.uniform1f(u.uScale, this.scale);
    gl.uniform2fv(u.uWarp, this.warp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

export const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};
