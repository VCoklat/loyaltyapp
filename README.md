# Loyalty Club

Webapp loyalty (Next.js 14) untuk menaikkan retention customer.

## Fitur retention
- **Tier member** (Bronze → Platinum) dengan multiplier poin — motivasi naik level.
- **Streak check-in harian** dengan bonus bertingkat, hari ke-7 bonus besar — kebiasaan kembali tiap hari.
- **Poin per transaksi** (10 poin / Rp10.000 × multiplier).
- **Katalog reward** untuk tukar poin.
- **Kode referral** — akuisisi via teman.
- Riwayat poin, mobile-first, dark mode.

## Jalankan lokal
```bash
npm install
npm run dev
```

## Deploy ke Vercel
1. Push folder ini ke GitHub.
2. Di vercel.com → Add New Project → import repo → Deploy (framework Next.js terdeteksi otomatis).
   Atau via CLI: `npx vercel --prod`.

## Catatan
Data disimpan di `localStorage` (mode demo, per-browser). Untuk produksi multi-user, tambahkan
login + database (mis. Vercel Postgres / Supabase) dan pindahkan logika poin ke API route agar tidak bisa dimanipulasi dari browser.
