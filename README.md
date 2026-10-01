# Kyle Werther — CAD Portfolio

Static site for GitHub Pages. No build step.

## Add your 5 designs
1. Drop files into `assets/projects/01/` … `05/`
   - Renders/screenshots: `.png` / `.jpg` / `.gif` (1600 px wide is plenty)
   - 3D model (optional): SOLIDWORKS **File › Save As › STL** (Options: Binary, Fine, units mm). Keep under ~20 MB.
2. Edit `projects.js` — title, subtitle, summary, highlights, specs, tags, and:
   ```js
   images: [
     { src: "assets/projects/01/iso.png",     caption: "Isometric render" },
     { src: "assets/projects/01/section.png", caption: "Section view" }
   ],
   model: "assets/projects/01/fixture.stl",
   links: [{ label: "Drawing (PDF)", url: "assets/projects/01/drawing.pdf" }]
   ```
   If a design has both images and a model, a Renders / 3D model toggle appears.
   No images and no model → a blueprint placeholder shows.
3. Delete `assets/projects/01/demo.stl` once Design 01 has a real model.

## Resume
Replace `assets/KJW_Resume.pdf` with the newest version (same filename).

## Publish (GitHub Pages)
Repo named `<username>.github.io` → upload all files → Settings › Pages › Deploy from branch `main` / root.
Site goes live at `https://<username>.github.io` within ~1 minute.

## Preview locally
`python -m http.server` in this folder, then open http://localhost:8000
(Opening index.html by double-click will not load the 3D viewer.)

## Note on proprietary work
Ethicon fixture designs are J&J property. Only post them with approval, or use
personal/school projects and re-created generic versions.
