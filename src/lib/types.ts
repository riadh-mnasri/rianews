// © 2026 Riadh MNASRI
import type { CategoryId } from "@/data/categories";

export type RawItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  excerpt: string | null;
};

export type Story = {
  id: string;
  title: string;
  essentiel: string;
  pourquoi: string | null;
  aPlacer: string | null;
  sources: { label: string; url: string }[];
  publishedAt: string | null;
};

export type Brief = {
  category: CategoryId;
  locale: string;
  mode: "ai" | "raw";
  intro: string | null;
  stories: Story[];
  generatedAt: string;
};
