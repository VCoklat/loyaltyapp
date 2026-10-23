# Hompimplay Rewards (Mockup)

Mockup web app loyalty berbasis web (mobile-first) untuk HomPim Play, Next.js 14, siap deploy di Vercel.

## Fitur
| Kebutuhan | Di aplikasi |
|---|---|
| Transaksi → poin (integrasi Payments) | Menu **Bayar**: simulasi Hompimplay Payments → `POST /api/transactions` → poin (1 poin/Rp1.000 × multiplier level) |
| Transaksi → QR (seperti gelang) | Pembelian tiket otomatis menerbitkan **Tiket QR** berisi daftar wahana |
| Lacak wahana belum dimainkan | Menu **Tiket QR** + banner "Belum dimainkan" di beranda + badge di peta |
| Aktivitas → poin | "Scan di gate" pada wahana memberi poin |
| Voucher creation & redeem | **Panel Admin** (buat voucher), menu **Reward** (katalog, tukar, voucher saya + QR untuk kasir) |
| Riwayat poin & penukaran | Menu **Riwayat** dengan filter dan ringkasan |
| Peta interaktif | Menu **Peta**: zona Jungle, City, Farm, Park, Island, Bukit Strawberry, Planet |
| Level member | Explorer → Adventurer → Ranger → Legend |

## Struktur
- `app/page.js` — seluruh UI
- `lib/data.js` — zona, wahana, produk, voucher (mock)
- `lib/hompimpay.js` — adapter integrasi Payments (ganti dengan API asli)
- `app/api/transactions/route.js` — endpoint/webhook transaksi lunas

## Jalankan
```bash
npm install && npm run dev
```
Deploy: push ke GitHub → import di Vercel → Deploy (Root Directory = folder yang berisi package.json).

## Menuju produksi (estimasi 1–2 bulan)
1. **Minggu 1–2**: Auth (OTP WhatsApp/email), database (Supabase/Vercel Postgres): users, transactions, points_ledger, tickets, vouchers, redemptions.
2. **Minggu 3–4**: Integrasi webhook Hompimplay Payments (`transaction.paid`) → ledger poin + penerbitan tiket QR bertanda tangan (HMAC) agar tidak bisa dipalsukan.
3. **Minggu 5–6**: Scanner gate/kasir (web app staf pakai kamera), panel admin voucher & laporan, embed ke website hompimplay.id.
4. **Minggu 7–8**: UAT, PWA (bisa di-install di HP), monitoring, go-live.

Catatan: logo diambil langsung dari hompimplay.id (fallback ke teks). Palet warna hijau/oranye/kuning adalah perkiraan, jadi sesuaikan dengan brand guideline resmi.
