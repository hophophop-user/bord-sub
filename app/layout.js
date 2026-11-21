import "./globals.css";

export const metadata = {
  title: "Bòrd Sub · Aides musique et spectacle",
  description: "Les aides et subventions accessibles depuis votre département.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
