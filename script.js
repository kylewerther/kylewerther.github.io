import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const $ = (s, el = document) => el.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- nav ---------- */
$("#year").textContent = new Date().getFullYear();
const nav = $(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), { passive: true });
$("#navToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
$("#navLinks").addEventListener("click", e => { if (e.target.tagName === "A") $("#navLinks").classList.remove("open"); });

/* ---------- placeholder art ---------- */
const placeholder = n => `
<div class="placeholder"><svg viewBox="0 0 400 260" fill="none" stroke="#5b9bd5" stroke-width="1.5">
  <rect x="60" y="60" width="200" height="130" rx="6" fill="#fff"/>
  <circle cx="160" cy="125" r="34"/><circle cx="160" cy="125" r="14" stroke-dasharray="4 4"/>
  <path d="M60 210h200M60 204v12M260 204v12" stroke="#9bbfe3"/>
  <path d="M280 60v130M274 60h12M274 190h12" stroke="#9bbfe3"/>
  <path d="M100 60v-18h120v18" /><path d="M126 125h68M160 91v68" stroke="#9bbfe3" stroke-dasharray="6 4"/>
  <text x="160" y="232" fill="#7890a8" stroke="none" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">DESIGN ${n} · ADD RENDERS OR MODEL</text>
</svg></div>`;

/* ---------- render projects ---------- */
const list = $("#projectList");
(window.PROJECTS || []).forEach((p, i) => {
  const n = String(i + 1).padStart(2, "0");
  const imgs = (p.images || []).filter(x => x && x.src);
  const hasModel = !!p.model;
  const specs = Object.entries(p.specs || {}).filter(([, v]) => v);
  const el = document.createElement("article");
  el.className = "project reveal" + (i % 2 ? " flip" : "");
  el.innerHTML = `
    <div class="p-media">
      <div class="media-frame">
        ${imgs.length && hasModel ? `<div class="media-tabs"><button data-v="img" class="on">Renders</button><button data-v="3d">3D model</button></div>` : ""}
        <div class="stage"></div>
      </div>
      ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((im, k) => `<button data-k="${k}" class="${k ? "" : "on"}"><img src="${esc(im.src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      <p class="caption"></p>
    </div>
    <div class="p-body">
      <div class="p-num">${n}</div>
      <h3>${esc(p.title)}</h3>
      ${p.subtitle ? `<p class="p-sub">${esc(p.subtitle)}</p>` : ""}
      ${p.summary ? `<p class="p-summary">${esc(p.summary)}</p>` : ""}
      ${(p.highlights || []).length ? `<ul class="p-highlights">${p.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      ${specs.length ? `<div class="p-specs">${specs.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>` : ""}
      ${(p.tags || []).length ? `<div class="chips">${p.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
      ${(p.links || []).length ? `<div class="p-links">${p.links.map((l, k) => `<a class="btn ${k ? "btn-ghost" : ""} btn-sm" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} →</a>`).join("")}</div>` : ""}
    </div>`;
  list.appendChild(el);

  const stage = $(".stage", el), cap = $(".caption", el);
  let viewer = null, cur = 0;
  const showImg = k => {
    cur = k;
    if (viewer) viewer.pause();
    stage.innerHTML = `<img src="${esc(imgs[k].src)}" alt="${esc(imgs[k].caption || p.title)}">`;
    $("img", stage).onclick = () => openLB(imgs[k]);
    cap.textContent = imgs[k].caption || "";
    el.querySelectorAll(".thumbs button").forEach((b, j) => b.classList.toggle("on", j === k));
  };
  const show3D = () => {
    stage.innerHTML = "";
    cap.textContent = "Interactive model · drag to rotate, scroll to zoom, right-drag to pan";
    if (!viewer) viewer = createViewer(stage.parentElement, p.model);
    else viewer.attach(stage.parentElement);
  };

  if (imgs.length) showImg(0);
  else if (hasModel) {
    stage.innerHTML = `<div class="viewer-msg">Loading model…</div>`;
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); show3D(); } }, { rootMargin: "200px" });
    io.observe(el);
  } else stage.innerHTML = placeholder(n);

  el.querySelectorAll(".thumbs button").forEach(b => b.onclick = () => {
    showImg(+b.dataset.k);
    el.querySelectorAll(".media-tabs button").forEach(t => t.classList.toggle("on", t.dataset.v === "img"));
  });
  el.querySelectorAll(".media-tabs button").forEach(t => t.onclick = () => {
    el.querySelectorAll(".media-tabs button").forEach(x => x.classList.toggle("on", x === t));
    t.dataset.v === "3d" ? show3D() : showImg(cur);
  });
});

/* ---------- 3D viewer ---------- */
function createViewer(frame, url) {
  const stage = $(".stage", frame);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 4 / 3, 0.1, 5000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdbe8f5, 1.8));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd8f5, 0.8); rim.position.set(-4, 2, -3); scene.add(rim);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = 1.2;
  renderer.domElement.addEventListener("pointerdown", () => controls.autoRotate = false);

  const tools = document.createElement("div");
  tools.className = "viewer-tools";
  tools.innerHTML = `<button title="Reset view">⟲</button><button title="Toggle auto-rotate">⟳</button>`;
  const hint = document.createElement("div"); hint.className = "viewer-hint"; hint.textContent = "drag · scroll · right-drag";

  let fit = () => {}, running = true, raf;
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight || w * .75;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const loop = () => { if (!running) return; controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };

  const addObject = obj => {
    const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    obj.position.sub(c);
    const d = size.length();
    const grid = new THREE.GridHelper(d * 2, 20, 0x9bbfe3, 0xdbeaf8);
    grid.position.y = -size.y / 2 - d * 0.002; scene.add(grid);
    scene.add(obj);
    fit = () => {
      camera.near = d / 100; camera.far = d * 50; camera.updateProjectionMatrix();
      camera.position.set(d * 0.9, d * 0.65, d * 1.1); controls.target.set(0, 0, 0); controls.update();
    };
    fit();
  };

  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  const fail = () => stage.innerHTML = `<div class="viewer-msg">Model not found: ${esc(url)}</div>`;
  if (ext === "stl") {
    new STLLoader().load(url, g => {
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xb4d2f0, metalness: 0.2, roughness: 0.5 }));
      m.rotation.x = -Math.PI / 2; // SOLIDWORKS is Y-up in-app but STL exports Z-up
      const grp = new THREE.Group(); grp.add(m); addObject(grp);
    }, undefined, fail);
  } else {
    new GLTFLoader().load(url, g => addObject(g.scene), undefined, fail);
  }

  tools.children[0].onclick = () => fit();
  tools.children[1].onclick = () => controls.autoRotate = !controls.autoRotate;
  const ro = new ResizeObserver(resize);

  const attach = f => {
    const s = $(".stage", f);
    s.innerHTML = ""; s.style.height = "100%";
    s.append(renderer.domElement); f.append(tools, hint);
    ro.observe(s); resize();
    running = true; cancelAnimationFrame(raf); loop();
  };
  attach(frame);
  return {
    attach,
    pause() { running = false; tools.remove(); hint.remove(); }
  };
}

/* ---------- lightbox ---------- */
const lb = $("#lightbox");
function openLB(im) { $("img", lb).src = im.src; $(".lb-cap", lb).textContent = im.caption || ""; lb.hidden = false; }
lb.onclick = e => { if (e.target !== $("img", lb)) lb.hidden = true; };
addEventListener("keydown", e => { if (e.key === "Escape") lb.hidden = true; });

/* ---------- reveal on scroll ---------- */
const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: 0.08 });
document.querySelectorAll(".reveal, .tl-item, .edu-card, .skill-card").forEach(x => { x.classList.add("reveal"); rio.observe(x); });
