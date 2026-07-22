# Benfica Eternal Draft

Draft interativo para construir um onze histórico do Sport Lisboa e Benfica e disputar uma **Champions Eternal** fictícia contra campeões europeus de várias eras.

## Conceito

- 100 lendas avaliadas com um modelo de 60% Benfica e 40% carreira.
- Quatro opções aleatórias por posição e dois spins por draft.
- Quatro formações e dez treinadores históricos.
- Campanha de seis jogos contra 24 campeões europeus.
- Simulação rápida com golos, prolongamento e desempate por penáltis.
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

## Versão online

[Benfica Eternal Draft](https://benfica-eternal-draft.pdassi.chatgpt.site)

## Nota

Este é um projeto ficcional e não oficial, sem afiliação ao Sport Lisboa e Benfica ou à UEFA.

## Deploy na Netlify

O repositório inclui uma configuração `netlify.toml`. Ao ligar o repositório à Netlify, usa a branch `main`; o build `npm run build:netlify`, a pasta publicada `out` e o Node.js 22.13 são aplicados automaticamente.
