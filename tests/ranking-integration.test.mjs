import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

test("wires the weekly Supabase ranking without exposing direct table access",async()=>{
 const [layout,integration,client,css,readme]=await Promise.all([
  readFile(new URL("../app/layout.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/ranking-integration.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/ranking.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/ranking.css",import.meta.url),"utf8"),
  readFile(new URL("../README.md",import.meta.url),"utf8"),
 ]);
 assert.match(layout,/RankingIntegration/);
 assert.match(layout,/ranking\.css/);
 assert.match(integration,/Ranking Legends/);
 assert.match(integration,/Regista o teu resultado/);
 assert.match(integration,/readCampaignSnapshot/);
 assert.match(client,/rest\/v1\/rpc/);
 assert.match(client,/submit_daily_score/);
 assert.match(client,/get_weekly_ranking/);
 assert.match(client,/headers:\{apikey:publishableKey/);
 assert.doesNotMatch(client,/Authorization/);
 assert.match(css,/\.weekly-ranking\{/);
 assert.match(css,/\.score-submit\{/);
 assert.match(readme,/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
});
