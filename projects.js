/* ==========================================================================
   YOUR 5 DESIGNS — edit this file only.
   --------------------------------------------------------------------------
   For each design:
     1. Put files in  assets/projects/0X/   (renders .png/.jpg, gifs, model)
     2. Fill in the fields below. Anything left empty is hidden automatically.

   images : list of { src, caption }. First image is the cover.
            Leave the list empty to show a blueprint placeholder.
   model  : path to a 3D file for the interactive viewer, or "".
            Supported: .stl  (SOLIDWORKS: File > Save As > STL, units mm)
                       .glb / .gltf
   links  : buttons under the description, e.g. drawings PDF, GitHub, video.
   ========================================================================== */

window.PROJECTS = [
  {
    title: "Design Title Goes Here",
    subtitle: "One line on what it is — e.g. Custom tensile fixture for Instron 5944",
    summary:
      "Two to four sentences: the problem, your design approach, and the result. " +
      "Mention the constraints you designed around (load, tolerances, material, manufacturability) " +
      "and how the part was validated or tested.",
    highlights: [
      "Key feature or decision #1 (e.g. self-aligning grip faces to remove off-axis loading)",
      "Key feature or decision #2 (e.g. designed for 3D printing, no supports needed)",
      "Outcome (e.g. cut setup time from 10 min to 2 min)"
    ],
    specs: { Software: "SOLIDWORKS 2025", Material: "6061-T6 Aluminum", Process: "CNC / FDM" },
    tags: ["SOLIDWORKS", "Fixture Design", "GD&T"],
    images: [],
    model: "assets/projects/01/demo.stl",
    links: []
  },
  {
    title: "Design Title Goes Here",
    subtitle: "One line on what it is",
    summary: "Problem → approach → result. Replace this text.",
    highlights: ["Key feature #1", "Key feature #2", "Outcome"],
    specs: { Software: "SOLIDWORKS", Material: "", Process: "" },
    tags: ["SOLIDWORKS", "Assembly"],
    images: [],
    model: "",
    links: []
  },
  {
    title: "Design Title Goes Here",
    subtitle: "One line on what it is",
    summary: "Problem → approach → result. Replace this text.",
    highlights: ["Key feature #1", "Key feature #2", "Outcome"],
    specs: { Software: "SOLIDWORKS", Material: "", Process: "" },
    tags: ["SOLIDWORKS", "Sheet Metal"],
    images: [],
    model: "",
    links: []
  },
  {
    title: "Design Title Goes Here",
    subtitle: "One line on what it is",
    summary: "Problem → approach → result. Replace this text.",
    highlights: ["Key feature #1", "Key feature #2", "Outcome"],
    specs: { Software: "SOLIDWORKS Simulation", Material: "", Process: "" },
    tags: ["SOLIDWORKS", "FEA"],
    images: [],
    model: "",
    links: []
  },
  {
    title: "Design Title Goes Here",
    subtitle: "One line on what it is",
    summary: "Problem → approach → result. Replace this text.",
    highlights: ["Key feature #1", "Key feature #2", "Outcome"],
    specs: { Software: "SOLIDWORKS", Material: "", Process: "" },
    tags: ["SOLIDWORKS", "Surfacing"],
    images: [],
    model: "",
    links: []
  }
];
