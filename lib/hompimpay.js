// Adapter integrasi Hompimplay Payments System.
// Sekarang mode MOCK (dipanggil dari /api/transactions). Untuk produksi, ganti fungsi
// di bawah dengan panggilan ke API Payments asli (pakai env HOMPIMPAY_API_URL & HOMPIMPAY_API_KEY),
// atau terima webhook "transaction.paid" dari Payments ke /api/transactions.

import { PRODUCTS, POINT_PER_RP } from "./data";

export function rid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Simulasi transaksi lunas dari Payments → hasil: poin + tiket QR (sama seperti gelang). */
export function processPaidTransaction({ productId, qty = 1, multiplier = 1 }) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) throw new Error("Produk tidak ditemukan");
  const total = p.price * qty;
  const points = Math.floor(total * POINT_PER_RP * multiplier);
  const trxId = rid("TRX");
  const tickets = p.games.length
    ? Array.from({ length: qty }, () => ({
        id: rid("QR"),
        trxId,
        product: p.name,
        games: p.games.map((g) => ({ id: g, played: false })),
        issued: new Date().toISOString(),
      }))
    : [];
  return { trxId, product: p.name, total, points, tickets, paidAt: new Date().toISOString() };
}
