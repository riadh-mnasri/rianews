// © 2026 Riadh MNASRI
import { ImageResponse } from "next/og";
import { IconArt } from "@/lib/icon-art";

const VARIANTS: Record<string, { size: number; padding: number }> = {
  "192": { size: 192, padding: 0 },
  "512": { size: 512, padding: 0 },
  "maskable-512": { size: 512, padding: 72 },
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((size) => ({ size }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const variant = VARIANTS[size.replace(/\.png$/, "")] ?? VARIANTS["192"];
  return new ImageResponse(<IconArt size={variant.size} padding={variant.padding} />, {
    width: variant.size,
    height: variant.size,
  });
}
