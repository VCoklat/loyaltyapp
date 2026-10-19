import "./globals.css";

export const metadata = {
  title: "Loyalty Club",
  description: "Kumpulkan poin, naik tier, tukar reward.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
