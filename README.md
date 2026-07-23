# Benfica Legends Draft

Draft interativo para construir um onze histórico do Sport Lisboa e Benfica e disputar uma **Champions Legends** fictícia contra campeões europeus de várias eras.

## Conceito

- 100 lendas avaliadas com um modelo de 60% Benfica e 40% carreira.
- Quatro opções por posição e dois spins por draft.
- Cinco formações inspiradas em diferentes eras e dez treinadores históricos.
- Campanha de seis jogos contra 24 campeões europeus.
- Draft do Dia determinístico, igual para todos.
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

No Netlify, a variável entra em **Site configuration → Environment variables**.
Um novo deploy ativa automaticamente as métricas.

## Ranking semanal

O Draft do Dia já garante condições iguais e resultados reproduzíveis. O ranking
global será ligado a uma base partilhada no plano gratuito do Supabase e pedirá
apenas um nickname público, sem contas de jogador.

## Versão online

[Benfica Legends Draft](https://cadraft.netlify.app)

## Nota

Este é um projeto ficcional e não oficial, sem afiliação ao Sport Lisboa e Benfica ou à UEFA.

## Deploy na Netlify

O repositório inclui uma configuração `netlify.toml`. Ao ligar o repositório à
Netlify, usa a branch `main`; o build `npm run build:netlify`, a pasta publicada
`out` e o Node.js 22.13 são aplicados automaticamente.
