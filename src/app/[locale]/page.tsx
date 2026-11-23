// © 2026 Riadh MNASRI
import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/app-shell";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AppShell />;
}
