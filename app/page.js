"use client";
import { useEffect, useState } from "react";

const TIERS = [
  { name: "Bronze", min: 0, mult: 1 },
  { name: "Silver", min: 500, mult: 1.25 },
  { name: "Gold", min: 1500, mult: 1.5 },
  { name: "Platinum", min: 4000, mult: 2 },
];
const REWARDS = [
  { id: "r1", name: "Diskon 10%", cost: 200 },
  { id: "r2", name: "Gratis Minuman", cost: 350 },
  { id: "r3", name: "Voucher Rp50.000", cost: 800 },
  { id: "r4", name: "Merchandise Eksklusif", cost: 1500 },
];
const STREAK_BONUS = [10, 10, 15, 15, 20, 25, 50]; // hari ke-7 bonus besar
const KEY = "loyalty_v1";
const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

const fresh = () => ({
  points: 50, lifetime: 50, streak: 0, lastCheckin: null,
  code: "LOY" + Math.random().toString(36).slice(2, 7).toUpperCase(),
  referred: false,
  history: [{ t: today(), d: "Bonus selamat datang", p: 50 }],
});

export default function Home() {
  const [s, setS] = useState(null);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");

  useEffect(() => {
    let d;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch {}
    d = d || fresh();
    // streak putus jika lewat >1 hari
    if (d.lastCheckin && daysBetween(d.lastCheckin, today()) > 1) d.streak = 0;
    setS(d);
  }, []);
  useEffect(() => { if (s) try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s]);

  if (!s) return null;

  const tier = [...TIERS].reverse().find((t) => s.lifetime >= t.min);
  const next = TIERS[TIERS.indexOf(tier) + 1];
  const pct = next ? ((s.lifetime - tier.min) / (next.min - tier.min)) * 100 : 100;
  const checkedToday = s.lastCheckin === today();

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const earn = (p, d, lifetime = true) =>
    setS((x) => ({ ...x, points: x.points + p, lifetime: lifetime ? x.lifetime + p : x.lifetime,
      history: [{ t: today(), d, p }, ...x.history].slice(0, 50) }));

  const checkin = () => {
    const st = (s.streak % 7) + 1;
    const p = STREAK_BONUS[st - 1];
    setS((x) => ({ ...x, streak: x.streak + 1, lastCheckin: today() }));
    earn(p, `Check-in hari ke-${st}`);
    flash(`+${p} poin! Streak ${s.streak + 1} hari 🔥`);
  };
  const purchase = () => {
    const rp = parseInt(amount, 10);
    if (!rp || rp < 1000) return flash("Minimal Rp1.000");
    const p = Math.floor((rp / 10000) * 10 * tier.mult); // 10 poin / Rp10rb × multiplier
    earn(p, `Belanja Rp${rp.toLocaleString("id-ID")}`);
    setAmount(""); flash(`+${p} poin (${tier.mult}× ${tier.name})`);
  };
  const redeem = (r) => {
    setS((x) => ({ ...x, points: x.points - r.cost,
      history: [{ t: today(), d: `Tukar: ${r.name}`, p: -r.cost }, ...x.history] }));
    flash(`${r.name} berhasil ditukar 🎉`);
  };
  const applyRef = () => {
    if (!ref.trim() || ref.trim().toUpperCase() === s.code) return flash("Kode tidak valid");
    setS((x) => ({ ...x, referred: true })); earn(100, "Bonus kode referral"); flash("+100 poin referral!");
  };
  const share = async () => {
    const text = `Gabung Loyalty Club pakai kodeku ${s.code} dan dapat 100 poin!`;
    try { navigator.share ? await navigator.share({ text }) : await navigator.clipboard.writeText(text); flash("Disalin!"); } catch {}
  };

  return (
    <main className="wrap">
      {toast && <div className="toast">{toast}</div>}

      {tab === "home" && <>
        <div className="card hero">
          <div className="row"><span>Member {tier.name}</span><span>{tier.mult}× poin</span></div>
          <div className="big">{s.points.toLocaleString("id-ID")}</div>
          <div>poin tersedia</div>
          <div className="bar"><i style={{ width: pct + "%" }} /></div>
          <small>{next ? `${next.min - s.lifetime} poin lagi ke ${next.name}` : "Tier tertinggi 👑"}</small>
        </div>

        <div className="card">
          <div className="row"><h2>Check-in Harian</h2><span className="mute">🔥 {s.streak} hari</span></div>
          <div className="days">
            {STREAK_BONUS.map((b, i) => (
              <div key={i} className={"day" + (i < (checkedToday ? ((s.streak - 1) % 7) + 1 : s.streak % 7) ? " on" : "")}>+{b}</div>
            ))}
          </div>
          <button style={{ width: "100%" }} disabled={checkedToday} onClick={checkin}>
            {checkedToday ? "Sudah check-in, kembali besok!" : "Check-in sekarang"}
          </button>
        </div>

        <div className="card">
          <h2>Catat Transaksi</h2>
          <p className="mute">10 poin per Rp10.000 × multiplier tier</p>
          <div className="row">
            <input inputMode="numeric" placeholder="Nominal (Rp)" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
            <button onClick={purchase}>Tambah</button>
          </div>
        </div>
      </>}

      {tab === "rewards" && <div className="card">
        <h2>Tukar Reward</h2>
        <p className="mute">Saldo: {s.points} poin</p>
        <div className="list">
          {REWARDS.map((r) => (
            <div key={r.id} className="row">
              <div><b>{r.name}</b><div className="mute">{r.cost} poin</div></div>
              <button disabled={s.points < r.cost} onClick={() => redeem(r)}>Tukar</button>
            </div>
          ))}
        </div>
      </div>}

      {tab === "invite" && <>
        <div className="card">
          <h2>Ajak Teman</h2>
          <p className="mute">Teman dapat 100 poin saat memakai kodemu.</p>
          <div className="big" style={{ fontSize: 28, letterSpacing: 2 }}>{s.code}</div>
          <button onClick={share}>Bagikan kode</button>
        </div>
        {!s.referred && <div className="card">
          <h2>Punya kode referral?</h2>
          <div className="row"><input placeholder="Masukkan kode" value={ref} onChange={(e) => setRef(e.target.value)} /><button onClick={applyRef}>Pakai</button></div>
        </div>}
        <div className="card">
          <h2>Tier Member</h2>
          <div className="list">{TIERS.map((t) => (
            <div key={t.name} className="row"><b>{t.name}{t.name === tier.name ? " ✓" : ""}</b><span className="mute">{t.min}+ poin · {t.mult}×</span></div>
          ))}</div>
        </div>
      </>}

      {tab === "history" && <div className="card">
        <h2>Riwayat Poin</h2>
        <div className="list">{s.history.map((h, i) => (
          <div key={i} className="row"><div>{h.d}<div className="mute">{h.t}</div></div>
            <b style={{ color: h.p > 0 ? "var(--ok)" : "var(--accent)" }}>{h.p > 0 ? "+" : ""}{h.p}</b></div>
        ))}</div>
        <button className="ghost" style={{ marginTop: 12 }} onClick={() => { if (confirm("Reset data demo?")) setS(fresh()); }}>Reset demo</button>
      </div>}

      <nav className="tabs">
        {[["home", "🏠 Beranda"], ["rewards", "🎁 Reward"], ["invite", "👥 Ajak"], ["history", "📜 Riwayat"]].map(([k, l]) => (
          <button key={k} className={tab === k ? "act" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>
    </main>
  );
}
