// Le cube Nocta en 3D : verre lumineux texturé, socle blanc.
// Les faces sont un shader : les ondulations du verre réfractent la couleur de la lampe,
// avec un bord en Fresnel pour qu'il se lise comme du verre et pas comme un néon.
import * as THREE from '../vendor/three.module.min.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const glassVert = `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vView;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const glassFrag = `
precision highp float;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vView;
uniform vec3 uColor;
uniform float uTime;
uniform float uOn;

// bruit de valeur lissé, deux octaves : les bosses irrégulières du verre martelé
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}
void main() {
  vec2 p = vUv * 7.0;
  float w = n(p + n(p * 0.7 + uTime * 0.05) * 2.2);
  float ridge = 1.0 - abs(w * 2.0 - 1.0);
  ridge = pow(ridge, 5.0);
  float fres = pow(1.0 - max(dot(vN, vView), 0.0), 2.4);
  float core = 0.35 + 0.65 * smoothstep(0.95, 0.1, length(vUv - 0.5) * 1.6);
  vec3 lit = uColor * (core * 0.75 + ridge * 1.4) * uOn;
  vec3 glass = vec3(0.92, 0.95, 1.0) * (ridge * 0.35 + fres * 0.7);
  vec3 col = lit + glass * (0.45 + 0.55 * (1.0 - uOn * 0.6));
  float alpha = clamp(0.38 + ridge * 0.4 + fres * 0.5 + uOn * 0.25, 0.0, 0.96);
  gl_FragColor = vec4(col, alpha);
}
`;

export class Cube {
  constructor(canvas, { color = '#7fe6ff' } = {}) {
    this.canvas = canvas;
    this.visible = false;
    this.on = 1;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) { return; }
    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 1.25, 6.4);
    camera.lookAt(0, 0.35, 0);
    this.scene = scene;
    this.camera = camera;

    this.group = new THREE.Group();
    scene.add(this.group);

    this.uniforms = {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uOn: { value: 1 },
    };
    const glassMat = new THREE.ShaderMaterial({
      vertexShader: glassVert,
      fragmentShader: glassFrag,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), glassMat);
    glass.position.y = 0.95;
    this.group.add(glass);

    // le cœur lumineux qu'on devine à travers le verre
    this.coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.55 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 16), this.coreMat);
    core.position.y = 0.55;
    this.group.add(core);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.86, 0.2, 1.86),
      new THREE.MeshStandardMaterial({ color: 0xf3f1ee, roughness: 0.75 })
    );
    base.position.y = 0.05;
    this.group.add(base);

    scene.add(new THREE.HemisphereLight(0xe8ecff, 0x302850, 1.2));
    this.light = new THREE.PointLight(new THREE.Color(color), 6, 6, 1.6);
    this.light.position.set(0, 0.9, 0);
    scene.add(this.light);
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(3, 4, 5);
    scene.add(key);

    this.target = new THREE.Color(color);
    this.rot = { x: -0.08, y: 0.65, vx: 0, vy: 0, auto: !reduce };
    this.bindDrag();

    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.kick(); }, { rootMargin: '100px' }).observe(canvas);
    new ResizeObserver(() => { this.resize(); this.render(); }).observe(canvas);
    this.resize();
    this.start = performance.now();
  }

  bindDrag() {
    let down = null;
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY };
      this.rot.auto = false;
      c.setPointerCapture?.(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!down) return;
      this.rot.vy = (e.clientX - down.x) * 0.006;
      this.rot.vx = (e.clientY - down.y) * 0.003;
      down = { x: e.clientX, y: e.clientY };
      this.kick();
    });
    const up = () => { down = null; setTimeout(() => { if (!down) this.rot.auto = !reduce; }, 2400); };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
  }

  resize() {
    if (!this.renderer) return;
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setColor(hex) { this.target.set(hex); this.kick(); }
  setOn(v) { this.on = v; this.kick(); }

  kick() {
    if (this.raf || !this.renderer) return;
    const loop = () => {
      this.raf = 0;
      this.render();
      if (this.visible && !reduce) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  render() {
    if (!this.renderer) return;
    const t = (performance.now() - this.start) / 1000;
    const u = this.uniforms;
    u.uColor.value.lerp(this.target, 0.08);
    u.uTime.value = t;
    u.uOn.value += (this.on - u.uOn.value) * 0.08;
    this.coreMat.color.copy(u.uColor.value);
    this.coreMat.opacity = 0.15 + 0.5 * u.uOn.value;
    this.light.color.copy(u.uColor.value);
    this.light.intensity = 6 * u.uOn.value;

    const r = this.rot;
    if (r.auto) r.vy += (0.0035 - r.vy) * 0.05;
    else r.vy *= 0.94;
    r.vx *= 0.9;
    r.y += r.vy;
    r.x = Math.max(-0.45, Math.min(0.3, r.x + r.vx));
    this.group.rotation.set(r.x, r.y, 0);
    this.group.position.y = reduce ? 0 : Math.sin(t * 0.8) * 0.04;
    this.renderer.render(this.scene, this.camera);
  }
}
