// © 2026 Riadh MNASRI

// Charge la police Newsreader (gras) pour dessiner le monogramme des icônes.
// Rendu statique au build : en cas d'échec, l'icône retombe sur la police par défaut.
export async function loadIconFont(): Promise<{ name: string; data: ArrayBuffer; weight: 700 }[]> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@72,700&text=R",
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } },
    ).then((r) => r.text());
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype|woff)'\)/)?.[1];
    if (!url) return [];
    const data = await fetch(url).then((r) => r.arrayBuffer());
    return [{ name: "Newsreader", data, weight: 700 }];
  } catch {
    return [];
  }
}
