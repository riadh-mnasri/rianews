// © 2026 Riadh MNASRI
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "RiaNews",
    short_name: "RiaNews",
    description: "L'actu qui compte, en deux minutes : IA, tech, politique, actualités, économie.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f0e6",
    theme_color: "#f5f0e6",
    lang: "fr",
    categories: ["news"],
    icons: [
      { src: "/icons/192?v=2", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512?v=2", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
