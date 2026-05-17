/**
 * The 8 official ChronoStrap colourways shown on /buy-strap.
 * Each maps to a 3D GLB model + a Shopify cart-line attribute.
 * All cards add the SAME Shopify product (chronostrap-custom-strap) — only
 * the attributes differ. No Shopify changes needed to add a new colourway.
 */
export interface Colourway {
  id: string;
  name: string;
  tagline: string;
  swatch: string; // strap colour
  bg: string; // card background colour
  src: string; // GLB model path
  /**
   * Default camera framing for the model — record via ?debug=1 on /buy-strap/[id]
   * (drag to position, then click "Copy JSON"). Paste the values here per colourway.
   */
  cameraOrbit?: string;
  cameraTarget?: string;
}

// Default framing applied to every strap until you record a per-colourway pose
// via ?debug=1 on the detail page.
const DEFAULT_ORBIT = "61.3deg 90.2deg 2.027m";
const DEFAULT_TARGET = "0m 0m -0m";

export const STRAP_COLOURWAYS: Colourway[] = [
  {
    id: "otto-rosso",
    name: "Otto Rosso",
    tagline: "Pop red",
    swatch: "#cd3c30",
    bg: "#941843",
    src: "/wristwatch.opt.glb",
    cameraOrbit: DEFAULT_ORBIT,
    cameraTarget: DEFAULT_TARGET,
  },
  {
    id: "huit-blanc",
    name: "Huit Blanc",
    tagline: "Arctic white",
    swatch: "#e5e2e5",
    bg: "#E5E2E5",
    src: "/huit-blanc.opt.glb",
    cameraOrbit: DEFAULT_ORBIT,
    cameraTarget: DEFAULT_TARGET,
  },
  {
    id: "green-eight",
    name: "Green Eight",
    tagline: "Pure green",
    swatch: "#10b981",
    bg: "#ECF0C2",
    src: "/green.opt.glb",
    cameraOrbit: "61.9deg 72.9deg 2.027m",
    cameraTarget: "0m 0.2m 0m",
  },
  {
    id: "lan-ba",
    name: "Lan Ba",
    tagline: "Sky blue",
    swatch: "#9bd0e8",
    bg: "#DAE8EA",
    src: "/yellow-sky.opt.glb",
    cameraOrbit: DEFAULT_ORBIT,
    cameraTarget: "0m 0.2m 0m",
  },
  {
    id: "otg-roz",
    name: "Otg Roz",
    tagline: "Soft rose",
    swatch: "#f15bb5",
    bg: "#f3c8e4",
    // Reuses the Pink Pop GLB used in custom-strap's Royal Purple preset.
    src: "/wristwatch.opt.glb",
    cameraOrbit: DEFAULT_ORBIT,
    cameraTarget: DEFAULT_TARGET,
  },
  {
    id: "ocho-negro",
    name: "Ocho Negro",
    tagline: "Stealth black",
    swatch: "#0a0a0a",
    bg: "#ffffff",
    src: "/black.opt.glb",
    cameraOrbit: DEFAULT_ORBIT,
    cameraTarget: DEFAULT_TARGET,
  },
  {
    id: "orenji-hachi",
    name: "Orenji Hachi",
    tagline: "Hyper orange",
    swatch: "#ff7a1a",
    bg: "#CD3C30",
    src: "/orenji-hachi.opt.glb",
    cameraOrbit: DEFAULT_ORBIT,
    cameraTarget: DEFAULT_TARGET,
  },
];

export function findColourway(id: string): Colourway | undefined {
  return STRAP_COLOURWAYS.find((c) => c.id === id);
}
