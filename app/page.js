"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const CLE_MEMO = "bordsub-departement";

function formatDate(iso) {
  if (!iso) return null;
  const [a, m, j] = iso.split("-");
  return `${j}/${m}/${a}`;
}

function Aide({ aide }) {
  const lien = aide.url_officielle || aide.url_page_regionale || aide.url_monprojetmusique;
  const limite = formatDate(aide.prochaine_date_limite);
  return (
    <article className={`carte ${aide.actif ? "" : "fermee"}`}>
      <div className="carte-haut">
        <span className="organisme">{aide.organisme}</span>
        <span className={`statut ${aide.actif ? "ouvert" : "ferme"}`}>
          {aide.actif ? "Ouvert" : "Fermé pour l'instant"}
        </span>
      </div>
      <h3>{aide.programme}</h3>
      {aide.type_projet && <p className="type">{aide.type_projet}</p>}
      {aide.description && <p>{aide.description}</p>}
      <dl>
        {aide.beneficiaires && (<><dt>Pour qui</dt><dd>{aide.beneficiaires}</dd></>)}
        {aide.montant_resume && (<><dt>Montant</dt><dd>{aide.montant_resume}</dd></>)}
        {limite && (<><dt>Prochaine date limite</dt><dd><strong>{limite}</strong></dd></>)}
        {!limite && aide.calendrier && (<><dt>Calendrier</dt><dd>{aide.calendrier}</dd></>)}
      </dl>
      {lien && (
        <a className="lien" href={lien} target="_blank" rel="noopener noreferrer">
          Voir la fiche officielle ↗
        </a>
      )}
    </article>
  );
}

export default function Accueil() {
  const [departements, setDepartements] = useState([]);
  const [code, setCode] = useState("");
  const [aides, setAides] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [ouvertesSeulement, setOuvertesSeulement] = useState(true);
  const [recherche, setRecherche] = useState("");

  // 1. Liste des départements + dernier département choisi
  useEffect(() => {
    if (!supabase) {
      setErreur("L'appli n'est pas encore reliée à la base (adresse et clé Supabase manquantes).");
      return;
    }
    supabase
      .from("departements")
      .select("code, nom, region")
      .order("code")
      .then(({ data, error }) => {
        if (error) setErreur("Impossible de charger les départements.");
        else setDepartements(data);
      });
    try {
      const memo = localStorage.getItem(CLE_MEMO);
      if (memo) setCode(memo);
    } catch {}
  }, []);

  // 2. Aides du département choisi (aides nationales + aides de sa région)
  useEffect(() => {
    if (!supabase || !code) return;
    try { localStorage.setItem(CLE_MEMO, code); } catch {}
    setChargement(true);
    setErreur("");
    supabase.rpc("aides_du_departement", { code_dep: code }).then(({ data, error }) => {
      if (error) setErreur("Impossible de charger les aides.");
      else setAides(data);
      setChargement(false);
    });
  }, [code]);

  const dep = departements.find((d) => d.code === code);

  const filtrees = useMemo(() => {
    const mot = recherche.trim().toLowerCase();
    return aides.filter((a) => {
      if (ouvertesSeulement && !a.actif) return false;
      if (!mot) return true;
      return [a.programme, a.organisme, a.description, a.type_projet, a.beneficiaires]
        .join(" ")
        .toLowerCase()
        .includes(mot);
    });
  }, [aides, ouvertesSeulement, recherche]);

  const locales = filtrees.filter((a) => a.departements && a.departements.length > 0);
  const nationales = filtrees.filter((a) => !a.departements || a.departements.length === 0);

  return (
    <main>
      <header>
        <p className="marque">Bòrd Sub</p>
        <h1>Quelles aides pour mon projet musical ou de spectacle ?</h1>
        <p className="intro">
          Choisissez votre département : vous voyez les aides de votre région et les aides nationales
          auxquelles vous pouvez prétendre.
        </p>
      </header>

      <section className="choix">
        <label htmlFor="dep">Mon département</label>
        <select id="dep" value={code} onChange={(e) => setCode(e.target.value)}>
          <option value="">Choisir…</option>
          {departements.map((d) => (
            <option key={d.code} value={d.code}>
              {d.code} · {d.nom}
            </option>
          ))}
        </select>
      </section>

      {erreur && <p className="erreur">{erreur}</p>}

      {code && !erreur && (
        <>
          <section className="filtres">
            <input
              type="search"
              placeholder="Rechercher (ex. : enregistrement, festival, résidence…)"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <label className="case">
              <input
                type="checkbox"
                checked={ouvertesSeulement}
                onChange={(e) => setOuvertesSeulement(e.target.checked)}
              />
              Seulement les aides ouvertes
            </label>
          </section>

          {chargement ? (
            <p className="info">Chargement…</p>
          ) : (
            <>
              <p className="info">
                <strong>{filtrees.length}</strong> aide{filtrees.length > 1 ? "s" : ""} pour {dep ? dep.nom : code}
              </p>

              {locales.length > 0 && (
                <>
                  <h2>En {dep ? dep.region : "région"} ({locales.length})</h2>
                  <div className="grille">{locales.map((a) => <Aide key={a.id} aide={a} />)}</div>
                </>
              )}
              {nationales.length > 0 && (
                <>
                  <h2>Partout en France ({nationales.length})</h2>
                  <div className="grille">{nationales.map((a) => <Aide key={a.id} aide={a} />)}</div>
                </>
              )}
            </>
          )}
        </>
      )}

      <footer>
        Informations vérifiées sur les sites officiels. Vérifiez toujours les conditions sur la fiche
        de l'organisme avant de déposer un dossier.
      </footer>
    </main>
  );
}
