# Kyle Werther — CAD Portfolio

Static site for GitHub Pages (kylewerther.github.io). No build step.

## Structure
- `index.html`: hero (headshot), Designs, compact Resume, Contact
- `projects.js`: **all project text and media**. Edit this to change a design.
- `script.js`: renders projects + the three.js viewer (GLB, meshopt-compressed)
- `assets/projects/<id>/`: models (`.glb`), sim results (`.glb`), images, video
- `assets/KJW_Resume.pdf`: replace with the newest resume (same filename)
- `assets/headshot.jpg`: 720×720 crop

## Media types per design (`views` in projects.js)
- `model`: plain CAD model (.glb)
- `result`: colored simulation plot (.glb with vertex colors) + `legend`
- `image`: .jpg/.png, click to enlarge
- `video`: .mp4 (H.264); SOLIDWORKS .avi must be converted

## Adding a new model
1. SOLIDWORKS: File › Save As › STL (binary, mm). For sim results: right-click the plot › Save As › VRML (.wrl).
2. Convert to .glb, then compress:
   `npx @gltf-transform/cli weld in.glb tmp.glb && npx @gltf-transform/cli meshopt tmp.glb out.glb`
   (STL/WRL → GLB conversion scripts were used for the current files; ask Claude to rerun them.)
3. Add an entry under `views` in `projects.js`.

## Preview locally
`python -m http.server` in this folder, then open http://localhost:8000
(Opening index.html by double-click will not load the 3D viewer.)

## Note on proprietary work
Fixture designs from Ethicon are J&J property. Project write-ups stay generic:
no company, product or program names.
