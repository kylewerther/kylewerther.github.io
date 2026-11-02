/* ==========================================================================
   DESIGNS: edit this file to change project text or media.
   --------------------------------------------------------------------------
   views: what the media panel can show, in tab order (first one loads first).
     { type: "model",  src: ".glb", label }                  plain CAD model
     { type: "result", src: ".glb", label, legend: {...} }   colored sim result
     { type: "image",  src: ".jpg", label, caption }
     { type: "video",  src: ".mp4", poster: ".jpg", label, caption }
   Models are SOLIDWORKS STL / VRML exports converted to compressed .glb
   (see README for the conversion steps).
   ========================================================================== */

const P = "assets/projects/";

window.PROJECTS = [
  {
    id: "pulley-fixture",
    kicker: "Fixture design",
    title: "Linear-to-Rotary Pulley Fixture",
    subtitle: "Converts linear motion into rotation to drive a pulley fixture",
    summary:
      "A fixture that turns straight-line motion, such as a test frame's crosshead travel, into rotation for a pulley fixture. " +
      "A gear rack meshes with a pinion on the pulley shaft, so linear travel of the rack turns the pulley. " +
      "Modeled as a full SOLIDWORKS assembly.",
    highlights: [
      "Rack-and-pinion drive: linear travel in, pulley rotation out",
      "Pinion and pulley carried together in one compact housing",
      "Full assembly with the gear mesh modeled"
    ],
    specs: { Software: "SOLIDWORKS", Mechanism: "Rack & pinion", Envelope: "132 × 237 × 52 mm" },
    tags: ["SOLIDWORKS", "Assembly modeling", "Fixture design", "Mechanisms"],
    views: [
      { type: "model", src: P + "pulley-fixture/model.glb", label: "3D model", view: [0.9, 0.45, 1.0], zoom: 1.2 }
    ]
  },

  {
    id: "conformability-fixture",
    kicker: "Fixture + flow simulation",
    title: "Adhesive Conformability Fixture",
    subtitle: "Tests how well an adhesive conforms to skin under water held at a constant 40 mmHg",
    summary:
      "A water-pressure fixture that checks whether an adhesive stays conformed and sealed to a skin substrate. " +
      "A standpipe sets the head pressure at a constant 40 mmHg and an in-line pressure gauge confirms it. " +
      "I ran a SOLIDWORKS Flow Simulation of the full water path to check that the test chamber sees the " +
      "target pressure and to find where the pressure losses happen.",
    results: [
      { value: "40 mmHg", label: "Target chamber pressure" },
      { value: "60.3 mmHg", label: "Peak pressure at inlet" },
      { value: "−6.7 mmHg", label: "Minimum, at outlet" }
    ],
    highlights: [
      "Standpipe sets a constant 40 mmHg head; a pressure gauge verifies it during the test",
      "Flow simulation shows the test chamber sitting in the ~40 mmHg band",
      "Largest pressure drop is at the chamber outlet, not along the supply line"
    ],
    specs: { CAD: "SOLIDWORKS", Simulation: "SOLIDWORKS Flow Simulation", Fluid: "Water", "Test pressure": "40 mmHg" },
    tags: ["SOLIDWORKS", "Flow Simulation", "CFD", "Fixture design", "Test method development"],
    views: [
      { type: "image", src: P + "conformability-fixture/setup.jpg", label: "Setup",
        caption: "Pressure contours on the water path, shown inside the fixture (mm Hg)" },
      { type: "result", src: P + "conformability-fixture/pressure.glb", label: "Pressure 3D", lineOpacity: .25,
        view: [0.7, 0.75, 1.1], caption: "Surface pressure on the fluid domain · drag to rotate",
        legend: { title: "Pressure [mm Hg]", min: -6.73, max: 60.28 } },
      { type: "video", src: P + "conformability-fixture/trajectories.mp4", poster: P + "conformability-fixture/trajectories-poster.jpg",
        label: "Flow animation", caption: "Flow trajectories colored by pressure, inlet to outlet" },
      { type: "model", src: P + "conformability-fixture/model.glb", label: "Fixture 3D", view: [1.0, 0.55, 0.9] }
    ]
  },

  {
    id: "watertight-cell",
    kicker: "Fixture + FEA",
    title: "Watertight Test Cell",
    subtitle: "Clamp fixture that tests whether a product is waterproof",
    summary:
      "A sealed test cell for checking whether a product holds out water. A screw clamp drives a tripod load spreader " +
      "down onto the sample so the sealing force is applied evenly around the ring, and the spreader can be swapped " +
      "to test different press-down components. I used a static FEA in SOLIDWORKS Simulation to evaluate whether " +
      "the clamp load reaches the sample as an even pressure distribution.",
    results: [
      { value: "9.11 MPa", label: "Max von Mises stress" },
      { value: "0.153 mm", label: "Max displacement" },
      { value: "1.99 × 10⁻³", label: "Max equivalent strain" }
    ],
    highlights: [
      "Three-legged load spreader spreads the screw force evenly around the sealing ring",
      "Interchangeable press-down components for testing different samples",
      "Stress, strain and displacement plotted across the full clamp assembly"
    ],
    specs: { CAD: "SOLIDWORKS", Simulation: "SOLIDWORKS Simulation (static)", Envelope: "100 × 130 × 100 mm" },
    tags: ["SOLIDWORKS", "FEA", "Simulation", "Fixture design", "Sealing"],
    views: [
      { type: "result", src: P + "watertight-cell/displacement.glb", label: "Displacement 3D", lineOpacity: .35,
        caption: "Resultant displacement (URES), true scale · drag to rotate",
        legend: { title: "URES [mm]", min: 0, max: 0.1531, digits: 3 } },
      { type: "image", src: P + "watertight-cell/stress.jpg", label: "Stress",
        caption: "Von Mises stress (N/m²)" },
      { type: "result", src: P + "watertight-cell/strain.glb", label: "Strain 3D", lineOpacity: .35,
        caption: "Equivalent strain (ESTRN) · drag to rotate",
        legend: { title: "ESTRN", min: 8.1e-9, max: 1.988e-3, exp: true } },
      { type: "model", src: P + "watertight-cell/model.glb", label: "Fixture 3D" }
    ]
  }
];
