import "./globals.css";

export const metadata = {
  title: "Bòrd Sub · Aides musique et spectacle",
  description: "Les aides et subventions accessibles depuis votre département.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112,800&family=IBM+Plex+Mono:wght@500;600&family=Instrument+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
