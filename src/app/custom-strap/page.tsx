import type { Metadata } from "next";
import { CustomStrapStudio } from "./custom-strap-studio";

export const metadata: Metadata = {
  title: "Custom Strap",
  description:
    "Design a custom ChronoStrap with live 3D preview, uploaded textures, finishes, hardware, and stitching.",
};

export default function Page() {
  return <CustomStrapStudio />;
}
