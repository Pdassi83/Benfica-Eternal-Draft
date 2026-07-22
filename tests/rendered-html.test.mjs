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
  const [page, data, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /type LiveMatch=/);
  assert.match(page, /penaltyShootout/);
  assert.match(page, /drawRoute/);
  assert.match(page, /Coleção Eternal · 100\/100/);
  assert.match(page, /Nenhum rosto inventado/);
  assert.match(page, /champions-trophy\.webp/);
  assert.doesNotMatch(page, /assets\/players/);
  assert.match(page, /pitchName\(pick\.player\.name\)/);
  assert.match(page, /window\.scrollTo\(\{top:0,left:0/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /\.player-card \.player-identity\{height:auto;aspect-ratio:16\/9/);
  assert.match(css, /\.pitch-pos>small\{display:block;width:62px/);
  const rivalBlock = data.split("export const rivals:Rival[]=")[1] ?? "";
  assert.equal((rivalBlock.match(/^\{id:/gm) ?? []).length, 24);
  assert.equal((data.match(/current:true/g) ?? []).length, 1);
});
