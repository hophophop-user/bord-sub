"""Génère base-aides-supabase.sql à partir de base-subventions/aides-metier.json."""
import json, re, sys, pathlib
src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
d = json.loads(src.read_text(encoding="utf-8"))
def q(v):
    if v is None or v == "": return "null"
    return "'" + str(v).replace("'", "''") + "'"
def date(v): return q(v) if re.fullmatch(r"\d{4}-\d{2}-\d{2}", v or "") else "null"
def num(v): return str(int(v)) if isinstance(v, (int, float)) or (isinstance(v, str) and v.isdigit()) else "null"
def arr(v):
    codes = [c.strip() for c in (v or "").split(";") if c.strip()]
    return "'{}'::text[]" if not codes else "array[" + ",".join(q(c) for c in codes) + "]"
L = []
L.append(f"""-- Base des aides musique / spectacle vivant (version {d['version']}, générée le {d['date_generation']})
-- À coller tel quel dans Supabase > SQL Editor, puis cliquer sur « Run ».
-- On peut le relancer sans risque : il efface et recrée les deux tables.

drop function if exists public.aides_du_departement(text);
drop table if exists public.aides;
drop table if exists public.departements;

create table public.departements (
  code   text primary key,
  nom    text not null,
  region text not null
);

create table public.aides (
  id                         text primary key,
  organisme                  text not null,
  region                     text,
  portee                     text,
  departements               text[] not null default '{{}}',  -- vide = aide nationale (toute la France)
  programme                  text not null,
  type_projet                text,
  beneficiaires              text,
  description                text,
  montant_resume             text,
  montant_max_eur            integer,
  statut                     text,
  actif                      boolean not null default true,
  prochaine_date_limite      date,
  calendrier                 text,
  conditions_cles            text,
  pieces_a_fournir           text,
  mode_depot                 text,
  url_officielle             text,
  url_page_regionale         text,
  url_conditions_pdf         text,
  url_monprojetmusique       text,
  date_derniere_verification date,
  verifie_par                text,
  prochaine_verification     date,
  notes                      text
);
create index aides_departements_idx on public.aides using gin (departements);

-- Sécurité : tout le monde peut LIRE, personne ne peut modifier depuis l'appli.
alter table public.departements enable row level security;
alter table public.aides enable row level security;
create policy "lecture publique" on public.departements for select to anon, authenticated using (true);
create policy "lecture publique" on public.aides for select to anon, authenticated using (true);
grant select on public.departements, public.aides to anon, authenticated;

-- Règle de filtrage : aides nationales + aides dont la liste contient le département.
create function public.aides_du_departement(code_dep text)
returns setof public.aides
language sql stable security invoker
set search_path = public
as $$
  select * from public.aides
  where cardinality(departements) = 0 or code_dep = any(departements)
  order by actif desc, prochaine_date_limite nulls last, organisme, programme;
$$;
grant execute on function public.aides_du_departement(text) to anon, authenticated;
""")
L.append("insert into public.departements (code, nom, region) values")
L.append(",\n".join(f"  ({q(x['code'])}, {q(x['nom'])}, {q(x['region'])})" for x in d["departements"]) + ";\n")
cols = ["id","organisme","region","portee","departements","programme","type_projet","beneficiaires","description",
        "montant_resume","montant_max_eur","statut","actif","prochaine_date_limite","calendrier","conditions_cles",
        "pieces_a_fournir","mode_depot","url_officielle","url_page_regionale","url_conditions_pdf","url_monprojetmusique",
        "date_derniere_verification","verifie_par","prochaine_verification","notes"]
rows = []
for a in d["aides"]:
    vals = []
    for c in cols:
        v = a.get(c, "")
        if c == "departements": vals.append(arr(v))
        elif c == "montant_max_eur": vals.append(num(v))
        elif c == "actif": vals.append("true" if str(v).lower() == "oui" else "false")
        elif c in ("prochaine_date_limite","date_derniere_verification","prochaine_verification"): vals.append(date(v))
        else: vals.append(q(v))
    rows.append("  (" + ", ".join(vals) + ")")
L.append(f"insert into public.aides ({', '.join(cols)}) values")
L.append(",\n".join(rows) + ";\n")
L.append("-- Vérification : doit afficher %d départements et %d aides.\nselect (select count(*) from public.departements) as departements, (select count(*) from public.aides) as aides;\n" % (len(d["departements"]), len(d["aides"])))
out.write_text("\n".join(L), encoding="utf-8")
print(out, out.stat().st_size, "octets", len(d["departements"]), "dép.", len(d["aides"]), "aides")
