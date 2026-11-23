// © 2026 Riadh MNASRI
import { ImageResponse } from "next/og";
import { IconArt } from "@/lib/icon-art";
import { loadIconFont } from "@/lib/icon-font";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(<IconArt size={180} padding={10} />, { ...size, fonts: await loadIconFont() });
}
