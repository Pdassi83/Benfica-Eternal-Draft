# Benfica Legends Draft

Draft interativo para construir um onze histórico do Sport Lisboa e Benfica e disputar uma **Champions Legends** fictícia contra campeões europeus de várias eras.

## Conceito

- 100 lendas avaliadas com um modelo de 60% Benfica e 40% carreira.
- Quatro opções por posição e dois spins por draft.
- Cinco formações inspiradas em diferentes eras e dez treinadores históricos.
- Campanha de seis jogos contra 24 campeões europeus.
- Draft do Dia determinístico, igual para todos.
- Ranking semanal com o melhor resultado diário de cada dispositivo.
- Simulação rápida com golos, prolongamento e desempate por penáltis.
- Cartão partilhável com o resultado e os marcadores da final.
- Interface retro-moderna adaptada a computador e telemóvel.

## Executar localmente

Requer Node.js 22.13 ou superior.

```bash
npm ci
npm run dev
```

Para validar a versão de produção:

```bash
npm test
npm run lint
```

## Métricas

O site utiliza Cloudflare Web Analytics sem cookies. O identificador público da
propriedade está configurado no layout e pode ser substituído por uma variável:

```text
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=token_da_propriedade
```

No Netlify, a variável entra em **Project configuration → Environment variables**.
Um novo deploy ativa automaticamente as métricas.

## Ranking semanal

O Draft do Dia garante condições iguais e resultados reproduzíveis. O ranking usa
funções RPC protegidas no Supabase, pede apenas um nickname público e conserva um
identificador anónimo no navegador para manter um resultado por dispositivo e dia.

Variáveis necessárias no frontend:

```text
NEXT_PUBLIC_SUPABASE_URL=https://projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

A tabela `daily_scores` permanece protegida por RLS. O browser apenas pode executar
`submit_daily_score` e `get_weekly_ranking`, sem ler diretamente o `device_id`.

## Versão online

[Benfica Legends Draft](https://benficadraft.netlify.app)

## Nota

Este é um projeto ficcional e não oficial, sem afiliação ao Sport Lisboa e Benfica ou à UEFA.

## Deploy na Netlify

O repositório inclui uma configuração `netlify.toml`. Ao ligar o repositório à
Netlify, usa a branch `main`; o build `npm run build:netlify`, a pasta publicada
`out` e o Node.js 22.13 são aplicados automaticamente.
