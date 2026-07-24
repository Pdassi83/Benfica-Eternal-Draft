# Supabase

O ranking semanal usa a tabela `public.daily_scores` e duas funções RPC:

- `submit_daily_score`
- `get_weekly_ranking`

O ficheiro `weekly-ranking.sql` contém as funções, permissões e proteção RLS usadas
pela versão 1.4. As variáveis públicas necessárias no Netlify estão documentadas
no README principal.
