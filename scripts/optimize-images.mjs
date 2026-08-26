import { createRequire } from "node:module";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  // Fall back to the sibling portfolio repo's install
  sharp = require("C:/coding/personal/portfolio/node_modules/sharp");
}

const SRC = "assets/img/src";
const OUT = "assets/img";
const files = readdirSync(SRC);

for (const f of files) {
  const name = f.replace(/-src\.(webp|png)$/, ".webp");
  const img = sharp(join(SRC, f));
  const meta = await img.metadata();
  let pipeline = img.rotate().resize({
    width: Math.min(meta.width, 800),
    withoutEnlargement: true,
  });
  if (f.endsWith(".png")) {
    pipeline = pipeline.flatten({ background: "#120E2E" }); // pursuit logo transparency -> purple-tinted surface
  }
  const info = await pipeline.webp({ quality: 72 }).toFile(join(OUT, name));
  console.log(`${name}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
}

const oversized = [];
for (const f of readdirSync(OUT)) {
  if (!f.endsWith(".webp")) continue;
  if (statSync(join(OUT, f)).size > 150 * 1024) oversized.push(f);
}
if (oversized.length) {
  console.error("OVERSIZE:", oversized.join(", "));
  process.exit(1);
}
console.log("OK: all optimized images <=150KB");
