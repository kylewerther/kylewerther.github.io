import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

const $ = (s, el = document) => el.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- nav ---------- */
$("#year").textContent = new Date().getFullYear();
const nav = $(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), { passive: true });
$("#navToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
$("#navLinks").addEventListener("click", e => { if (e.target.tagName === "A") $("#navLinks").classList.remove("open"); });

const ICON = {
  model: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z M12 12l8-4.5 M12 12v9 M12 12L4 7.5"/></svg>',
  result: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M8 10.5v5 M12 12.5v5.5 M16 10.5v5"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 16l5-5 4 4 3-3 5 5"/></svg>',
  video: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M10 9.5v5l4.5-2.5z"/></svg>'
};

/* ---------- render projects ---------- */
const list = $("#projectList");
(window.PROJECTS || []).forEach((p, i) => {
  const n = String(i + 1).padStart(2, "0");
  const views = (p.views || []).filter(v => v && v.src);
  const specs = Object.entries(p.specs || {}).filter(([, v]) => v);
  const el = document.createElement("article");
  el.className = "project reveal";
  el.id = p.id || "design-" + n;
  el.innerHTML = `
    <header class="p-head">
      <div class="p-num">${n} <span>${esc(p.kicker || "")}</span></div>
      <h3>${esc(p.title)}</h3>
      ${p.subtitle ? `<p class="p-sub">${esc(p.subtitle)}</p>` : ""}
    </header>
    <div class="p-grid">
      <div class="p-media">
        <div class="media-frame"><div class="stage"></div></div>
        ${views.length > 1 ? `<div class="view-tabs" role="tablist">${views.map((v, k) =>
          `<button role="tab" data-k="${k}" class="${k ? "" : "on"}">${ICON[v.type] || ""}<span>${esc(v.label)}</span></button>`).join("")}</div>` : ""}
        <p class="caption"></p>
      </div>
      <div class="p-body">
        ${p.summary ? `<p class="p-summary">${esc(p.summary)}</p>` : ""}
        ${(p.results || []).length ? `<div class="p-results">${p.results.map(r => `<div><b>${esc(r.value)}</b><span>${esc(r.label)}</span></div>`).join("")}</div>` : ""}
        ${(p.highlights || []).length ? `<ul class="p-highlights">${p.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
        ${specs.length ? `<dl class="p-specs">${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        ${(p.tags || []).length ? `<div class="chips">${p.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
      </div>
    </div>`;
  list.appendChild(el);

  const frame = $(".media-frame", el), stage = $(".stage", el), cap = $(".caption", el);
  let viewer = null;

  const show = k => {
    const v = views[k];
    el.querySelectorAll(".view-tabs button").forEach((b, j) => b.classList.toggle("on", j === k));
    frame.querySelectorAll(".legend").forEach(x => x.remove());
    if (viewer) viewer.pause();
    frame.querySelectorAll("video").forEach(x => x.pause());
    cap.textContent = v.caption || "";
    if (v.type === "image") {
      stage.innerHTML = `<img src="${esc(v.src)}" alt="${esc(v.caption || p.title)}">`;
      $("img", stage).onclick = () => openLB(v);
    } else if (v.type === "video") {
      stage.innerHTML = `<video src="${esc(v.src)}" ${v.poster ? `poster="${esc(v.poster)}"` : ""} controls muted loop playsinline preload="none"></video>`;
      $("video", stage).play().catch(() => {});
    } else {
      stage.innerHTML = "";
      if (!viewer) viewer = createViewer(frame);
      viewer.show(v);
      if (v.legend) frame.insertAdjacentHTML("beforeend", legendHTML(v.legend));
      if (!v.caption) cap.textContent = "Interactive model · drag to rotate, scroll to zoom, right-drag to pan";
    }
  };

  el.querySelectorAll(".view-tabs button").forEach(b => b.onclick = () => show(+b.dataset.k));

  if (!views.length) { stage.innerHTML = `<div class="viewer-msg">No media yet</div>`; return; }
  // Defer the first view until the project is near the viewport (keeps first paint light).
  stage.innerHTML = `<div class="viewer-msg">Loading…</div>`;
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); show(0); } }, { rootMargin: "300px" });
  io.observe(el);
});

function legendHTML(l) {
  const steps = 5, ticks = [];
  for (let s = 0; s <= steps; s++) {
    const v = l.max - (l.max - l.min) * s / steps;
    ticks.push(`<span>${l.format ? l.format(v) : fmt(v, l)}</span>`);
  }
  return `<div class="legend"><p>${esc(l.title)}</p><div class="lg-body"><i></i><div class="lg-ticks">${ticks.join("")}</div></div></div>`;
}
function fmt(v, l) {
  if (l.exp) return v.toExponential(2).replace("e-", "e−");
  return v.toFixed(l.digits ?? 2).replace("-", "−");
}

/* ---------- 3D viewer (one renderer per project, cached models per view) ---------- */
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const cache = new Map();
const loadGLB = url => {
  if (!cache.has(url)) cache.set(url, new Promise((res, rej) => loader.load(url, g => res(g.scene), undefined, rej)));
  return cache.get(url);
};

function prepare(root, v) {
  const out = new THREE.Group();
  root.traverse(o => {
    if (o.isMesh) {
      let g = o.geometry;
      if (!g.attributes.normal) g = toCreasedNormals(g, THREE.MathUtils.degToRad(v.crease ?? 35));
      const colored = !!g.attributes.color;
      const mat = colored
        ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75, metalness: 0, side: THREE.DoubleSide,
            transparent: v.opacity < 1, opacity: v.opacity ?? 1, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
        : new THREE.MeshStandardMaterial({ color: v.color ?? 0xbcd6f0, roughness: .48, metalness: .18, side: THREE.DoubleSide,
            transparent: v.opacity < 1, opacity: v.opacity ?? 1, depthWrite: !(v.opacity < 1) });
      const m = new THREE.Mesh(g, mat);
      m.applyMatrix4(o.matrixWorld);
      out.add(m);
    } else if (o.isLineSegments || o.isLine) {
      if (v.lines === false) return;
      const m = new THREE.LineSegments(o.geometry, new THREE.LineBasicMaterial({
        vertexColors: !!o.geometry.attributes.color, color: o.geometry.attributes.color ? 0xffffff : 0x12304f,
        transparent: true, opacity: v.lineOpacity ?? .55 }));
      m.applyMatrix4(o.matrixWorld);
      out.add(m);
    }
  });
  if (v.scale) out.scale.setScalar(v.scale);
  return out;
}

function createViewer(frame) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 5000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfdff0, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 5, 4);
  const rim = new THREE.DirectionalLight(0xdbeaf8, .7); rim.position.set(-4, 2, -3);
  camera.add(key, rim); scene.add(camera);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = 1;
  renderer.domElement.addEventListener("pointerdown", () => controls.autoRotate = false);

  const tools = document.createElement("div");
  tools.className = "viewer-tools";
  tools.innerHTML = `<button title="Reset view" aria-label="Reset view">⟲</button><button title="Toggle auto-rotate" aria-label="Toggle auto-rotate">⟳</button>`;
  const msg = document.createElement("div"); msg.className = "viewer-msg";

  const world = new THREE.Group(); scene.add(world);
  let fit = () => {}, running = false, raf, token = 0;
  const stage = $(".stage", frame);
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight || w * .75;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  const vis = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && running) loop(); });
  let visible = true;
  const loop = () => {
    cancelAnimationFrame(raf);
    if (!running || !visible) return;
    controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop);
  };

  tools.children[0].onclick = () => fit();
  tools.children[1].onclick = () => controls.autoRotate = !controls.autoRotate;

  async function show(v) {
    const my = ++token;
    stage.innerHTML = ""; stage.append(renderer.domElement); frame.append(tools);
    msg.textContent = "Loading model…"; frame.append(msg);
    ro.observe(stage); vis.observe(frame); resize();
    running = true; loop();
    try {
      const parts = await Promise.all([v.src, ...(v.ghost ? [v.ghost.src] : [])].map(loadGLB));
      if (my !== token) return;
      world.clear();
      parts.forEach(r => r.updateMatrixWorld(true));
      const obj = new THREE.Group();
      obj.add(prepare(parts[0], v));
      if (v.ghost) obj.add(prepare(parts[1], { ...v.ghost, opacity: v.ghost.opacity ?? .18, lines: false }));
      world.add(obj);
      const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      obj.position.sub(c);
      const d = size.length();
      const grid = new THREE.GridHelper(d * 1.6, 16, 0x9bbfe3, 0xdbeaf8);
      grid.position.y = -size.y / 2 - d * .004; world.add(grid);
      const dir = new THREE.Vector3(...(v.view || [0.85, 0.6, 1.1])).normalize();
      fit = () => {
        camera.near = d / 200; camera.far = d * 40; camera.updateProjectionMatrix();
        const dist = (d / 2) / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * (v.zoom || 1);
        camera.position.copy(dir.clone().multiplyScalar(dist)); controls.target.set(0, 0, 0); controls.update();
      };
      controls.autoRotate = true; fit(); msg.remove();
    } catch (e) {
      msg.textContent = "Couldn't load model"; console.error(e);
    }
  }
  return {
    show,
    pause() { running = false; cancelAnimationFrame(raf); tools.remove(); msg.remove(); }
  };
}

/* ---------- lightbox ---------- */
const lb = $("#lightbox");
function openLB(im) { $("img", lb).src = im.src; $(".lb-cap", lb).textContent = im.caption || ""; lb.hidden = false; }
lb.onclick = e => { if (e.target !== $("img", lb)) lb.hidden = true; };
addEventListener("keydown", e => { if (e.key === "Escape") lb.hidden = true; });

/* ---------- reveal on scroll ---------- */
const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: 0.06 });
document.querySelectorAll(".reveal, .r-card, .stat").forEach(x => { x.classList.add("reveal"); rio.observe(x); });
