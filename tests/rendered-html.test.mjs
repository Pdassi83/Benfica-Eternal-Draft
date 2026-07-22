import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("keeps the Eternal live-match and expanded champion pool wired", async () => {
  const [page, data, css, layout, manifest, robots] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
  ]);

  assert.match(page, /type LiveMatch=/);
  assert.match(page, /penaltyShootout/);
  assert.match(page, /drawRoute/);
  assert.match(page, /Coleção Eternal · 100\/100/);
  assert.match(page, /Nenhum rosto inventado/);
  assert.doesNotMatch(page, /Uma experiência impossível/);
  assert.doesNotMatch(page, /SHOWCASE_IDS/);
  assert.match(page, /<h3>Formação<\/h3>/);
  assert.match(page, /<h3>Treinador<\/h3>/);
  assert.doesNotMatch(page, /01\.A · Formação|01\.B · Treinador/);
  assert.match(page, /champions-trophy\.webp/);
  assert.doesNotMatch(page, /assets\/players/);
  assert.match(page, /pitchName\(pick\.player\.name\)/);
  assert.match(page, /window\.scrollTo\(\{top:0,left:0/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /\.player-card \.player-identity\{height:auto;aspect-ratio:16\/9/);
  assert.match(css, /\.pitch-pos>small\{display:block;width:62px/);
  assert.match(css, /\.facts\{display:grid;width:100%;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /\.identity-preview>div:only-child\{display:block;width:100%;min-width:0\}/);
  assert.match(data, /specialRatings:Record<string,number>=\{aimar:99,jonas:96\}/);
  assert.match(data, /"4-2-4":\["GR","LE","DC","DC","LD","MC","MC","EE","PL","PL","ED"\]/);
  assert.match(data, /"4-4-2":\["GR","LE","DC","DC","LD","EE","MC","MC","ED","PL","PL"\]/);
  assert.match(data, /formationHistory:Record<Formation/);
  assert.doesNotMatch(data, /"3-4-3"/);
  assert.match(page, /useState<Formation>\("4-2-4"\)/);
  assert.match(page, /Cinco sistemas inspirados em diferentes eras táticas do clube/);
  assert.match(page, /querySelector\("\.match"\)\?\.scrollIntoView\(\{behavior:"smooth",block:"start"\}\)/);
  assert.match(page, /Partilhar o desafio/);
  assert.match(page, /Privacidade e aviso legal/);
  assert.match(page, /Projeto independente/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /manifest: "\/manifest\.webmanifest"/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  assert.match(robots, /Allow: \//);
  const rivalBlock = data.split("export const rivals:Rival[]=")[1] ?? "";
  assert.equal((rivalBlock.match(/^\{id:/gm) ?? []).length, 24);
  assert.equal((data.match(/current:true/g) ?? []).length, 1);
});
