# Bòrd Sub

Appli des aides et subventions musique / spectacle vivant : on choisit son département, on voit les aides nationales et celles de sa région.

- **Base de données** : Supabase (tables `aides` et `departements`, lecture publique seule). Le fichier `supabase/base-aides-supabase.sql` recrée la base ; `supabase/generer_sql.py` le regénère depuis `aides-metier.json`.
- **Site** : Next.js, mis en ligne sur Vercel.
- **Réglages à mettre dans Vercel** (Settings > Environment Variables) : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clé publique « anon » / « publishable », jamais la clé secrète). Voir `.env.example`.
