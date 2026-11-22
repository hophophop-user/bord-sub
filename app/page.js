"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

// Charge la base depuis Supabase au format attendu par l'interface (public/bordsub-app.js).
async function chargerBase() {
  if (!supabase) throw new Error("Adresse ou clé Supabase manquante (.env.local)");
  const [deps, aides] = await Promise.all([
    supabase.from("departements").select("code, nom, region").order("code"),
    supabase.from("aides").select("*").order("id"),
  ]);
  if (deps.error) throw deps.error;
  if (aides.error) throw aides.error;
  return {
    departements: deps.data,
    aides: aides.data.map((a) => ({
      ...a,
      departements: a.departements || [],
      actif: a.actif ? "oui" : "non",
      prochaine_date_limite: a.prochaine_date_limite || "",
      montant_max_eur: a.montant_max_eur ?? "",
    })),
  };
}

export default function Accueil() {
  useEffect(() => {
    if (document.getElementById("bordsub-app")) return; // déjà chargé
    window.chargerBase = chargerBase;
    const s = document.createElement("script");
    s.id = "bordsub-app";
    s.src = "/bordsub-app.js";
    document.body.appendChild(s);
  }, []);

  return (
    <>
      <div id="app" />
      <nav className="tabbar" id="tabbar" aria-label="Navigation principale" />
    </>
  );
}
