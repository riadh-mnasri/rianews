// © 2026 Riadh MNASRI
import { ImageResponse } from "next/og";
import { IconArt } from "@/lib/icon-art";
import { loadIconFont } from "@/lib/icon-font";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<IconArt size={64} />, { ...size, fonts: await loadIconFont() });
}
