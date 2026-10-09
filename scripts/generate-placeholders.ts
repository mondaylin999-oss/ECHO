// Writes one labelled SVG card per tool view into public/images/tools/.
// Run with: npm run generate:placeholders
import fs from "node:fs";
import path from "node:path";
import { config } from "../src/config";
import { loadContent } from "../src/services/contentStore";

const VIEWS = ["top", "left", "right"] as const;

const PALETTE: Record<string, { background: string; accent: string }> = {
  mars: { background: "#3B1A12", accent: "#E2703A" },
  moon: { background: "#1E2430", accent: "#B8C1CC" },
};

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function renderCard(toolName: string, bodyName: string, view: string, bodyId: string): string {
  const { background, accent } = PALETTE[bodyId] ?? { background: "#202020", accent: "#CCCCCC" };
  const title = escapeXml(toolName);
  const label = `${view} view`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img" aria-label="${title} - ${label} (placeholder)">
  <rect width="800" height="600" fill="${background}"/>
  <rect x="24" y="24" width="752" height="552" rx="16" fill="none" stroke="${accent}" stroke-width="4" stroke-dasharray="14 10"/>
  <text x="400" y="150" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="4" fill="${accent}">${escapeXml(bodyName.toUpperCase())}</text>
  <text x="400" y="290" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="bold" fill="#FFFFFF" textLength="${Math.min(680, title.length * 22)}" lengthAdjust="spacingAndGlyphs">${title}</text>
  <text x="400" y="370" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="${accent}">${label}</text>
  <text x="400" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#FFFFFF" opacity="0.6">Placeholder illustration</text>
</svg>
`;
}

function main() {
  const content = loadContent();
  let written = 0;

  for (const tool of content.tools) {
    const bodyName = content.bodies.find((body) => body.id === tool.bodyId)?.name ?? tool.bodyId;

    for (const view of VIEWS) {
      const { url } = tool.images[view];
      if (!url.endsWith(".svg")) {
        console.log(`skip  ${url} (not an SVG, assumed to be a real image)`);
        continue;
      }
      const file = path.join(config.publicDir, url);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, renderCard(tool.name, bodyName, view, tool.bodyId), "utf8");
      console.log(`wrote ${url}`);
      written += 1;
    }
  }

  console.log(`Done: ${written} placeholder image(s).`);
}

main();
