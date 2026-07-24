-- Benfica Legends Draft v1.4
-- Requer a tabela public.daily_scores já criada com as colunas documentadas no README.

alter table public.daily_scores enable row level security;

revoke all privileges on table public.daily_scores from public, anon, authenticated;
grant all privileges on table public.daily_scores to service_role;

create or replace function public.submit_daily_score(
  p_daily_key date,
  p_nickname text,
  p_device_id uuid,
  p_champion boolean,
  p_team_rating integer,
  p_chemistry integer,
  p_wins integer,
  p_goal_difference integer
)
returns table (
  saved_as_best boolean,
  best_score integer,
  saved_nickname text,
  saved_daily_key date,
  saved_week_key date
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nickname text;
  v_today date;
  v_week_key date;
  v_score integer;
  v_row public.daily_scores%rowtype;
  v_saved boolean := false;
begin
  v_nickname := regexp_replace(btrim(coalesce(p_nickname, '')), '[[:space:]]+', ' ', 'g');
  v_today := (now() at time zone 'Europe/Lisbon')::date;

  if p_daily_key is null or p_daily_key <> v_today then
    raise exception 'Só é possível submeter o Draft do Dia atual.' using errcode = '22023';
  end if;
  if char_length(v_nickname) not between 3 and 20 then
    raise exception 'O nickname deve ter entre 3 e 20 caracteres.' using errcode = '22023';
  end if;
  if p_device_id is null or p_device_id = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Identificador do dispositivo inválido.' using errcode = '22023';
  end if;
  if p_team_rating not between 75 and 99 then
    raise exception 'Rating de equipa inválido.' using errcode = '22023';
  end if;
  if p_chemistry not between 48 and 100 then
    raise exception 'Química inválida.' using errcode = '22023';
  end if;
  if p_wins not between 0 and 6 then
    raise exception 'Número de vitórias inválido.' using errcode = '22023';
  end if;
  if p_goal_difference not between -50 and 50 then
    raise exception 'Diferença de golos inválida.' using errcode = '22023';
  end if;

  v_week_key := date_trunc('week', p_daily_key::timestamp)::date;
  v_score := greatest(0,
    case when p_champion then 1000 else 0 end
    + p_wins * 100
    + p_goal_difference * 10
    + p_team_rating
    + p_chemistry
  );

  insert into public.daily_scores (
    daily_key, week_key, nickname, device_id, score, champion,
    team_rating, chemistry, wins, goal_difference
  ) values (
    p_daily_key, v_week_key, v_nickname, p_device_id, v_score, p_champion,
    p_team_rating::smallint, p_chemistry::smallint, p_wins::smallint,
    p_goal_difference::smallint
  )
  on conflict (daily_key, device_id) do nothing
  returning * into v_row;

  if found then
    v_saved := true;
  else
    select ds.* into v_row
    from public.daily_scores ds
    where ds.daily_key = p_daily_key and ds.device_id = p_device_id
    for update;

    if row(v_score, case when p_champion then 1 else 0 end, p_wins,
      p_goal_difference, p_team_rating, p_chemistry)
      > row(v_row.score, case when v_row.champion then 1 else 0 end,
      v_row.wins::integer, v_row.goal_difference::integer,
      v_row.team_rating::integer, v_row.chemistry::integer) then
      update public.daily_scores set
        nickname = v_nickname,
        week_key = v_week_key,
        score = v_score,
        champion = p_champion,
        team_rating = p_team_rating::smallint,
        chemistry = p_chemistry::smallint,
        wins = p_wins::smallint,
        goal_difference = p_goal_difference::smallint,
        updated_at = now()
      where id = v_row.id
      returning * into v_row;
      v_saved := true;
    else
      update public.daily_scores set nickname = v_nickname, updated_at = now()
      where id = v_row.id
      returning * into v_row;
    end if;
  end if;

  return query select v_saved, v_row.score, v_row.nickname::text,
    v_row.daily_key, v_row.week_key;
end;
$$;

create or replace function public.get_weekly_ranking(p_week_key date default null)
returns table (
  ranking_position bigint,
  nickname text,
  score integer,
  champion boolean,
  wins smallint,
  goal_difference smallint,
  team_rating smallint,
  chemistry smallint,
  daily_key date
)
language sql
stable
security definer
set search_path = ''
as $$
  with target_week as (
    select coalesce(p_week_key,
      date_trunc('week', now() at time zone 'Europe/Lisbon')::date) as week_key
  ),
  best_result_per_device as (
    select ds.*,
      row_number() over (
        partition by ds.device_id
        order by ds.score desc, ds.champion desc, ds.wins desc,
          ds.goal_difference desc, ds.team_rating desc, ds.chemistry desc,
          ds.created_at asc
      ) as device_rank
    from public.daily_scores ds
    cross join target_week tw
    where ds.week_key = tw.week_key
  ),
  ranked_results as (
    select row_number() over (
      order by br.score desc, br.champion desc, br.wins desc,
        br.goal_difference desc, br.team_rating desc, br.chemistry desc,
        br.created_at asc
    ) as ranking_position,
    br.nickname::text as nickname, br.score, br.champion, br.wins,
    br.goal_difference, br.team_rating, br.chemistry, br.daily_key
    from best_result_per_device br
    where br.device_rank = 1
  )
  select rr.ranking_position, rr.nickname, rr.score, rr.champion, rr.wins,
    rr.goal_difference, rr.team_rating, rr.chemistry, rr.daily_key
  from ranked_results rr
  order by rr.ranking_position
  limit 50;
$$;

revoke all privileges on function public.submit_daily_score(date,text,uuid,boolean,integer,integer,integer,integer) from public;
revoke all privileges on function public.get_weekly_ranking(date) from public;
grant execute on function public.submit_daily_score(date,text,uuid,boolean,integer,integer,integer,integer) to anon, authenticated;
grant execute on function public.get_weekly_ranking(date) to anon, authenticated;
