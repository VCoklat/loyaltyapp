import "./globals.css";

export const metadata = {
  title: "Hompimplay Rewards",
  description: "Kumpulkan poin dari setiap transaksi & wahana di Hompimplay, tukar jadi voucher dan hadiah.",
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#1f9d55" };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
