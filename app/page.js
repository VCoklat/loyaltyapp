"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { LOGO, TIERS, ZONES, GAMES, PRODUCTS, DEFAULT_VOUCHERS } from "@/lib/data";

const KEY = "hompim_rewards_v2";
const rp = (n) => "Rp" + n.toLocaleString("id-ID");
const now = () => new Date().toISOString();
const fmt = (d) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const rid = (p) => p + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
const gameById = (id) => GAMES.find((g) => g.id === id);
const zoneById = (id) => ZONES.find((z) => z.id === id);

const fresh = () => ({
  member: { id: rid("HMP"), name: "Kak Dedy" },
  points: 100, lifetime: 100,
  tickets: [], myVouchers: [],
  vouchers: DEFAULT_VOUCHERS,
  history: [{ t: now(), d: "Bonus member baru", p: 100, k: "earn" }],
});

export default function App() {
  const [s, setS] = useState(null);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [mode, setMode] = useState("mobile");

  useEffect(() => {
    let d; try { d = JSON.parse(localStorage.getItem(KEY)); } catch {}
    setS(d || fresh());
    let m; try { m = localStorage.getItem("hompim_mode"); } catch {}
    setMode(m || (window.innerWidth >= 900 ? "web" : "mobile"));
  }, []);
  const switchMode = (m) => { setMode(m); try { localStorage.setItem("hompim_mode", m); } catch {} };
  useEffect(() => { if (s) try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s]);
  if (!s) return null;

  const tier = [...TIERS].reverse().find((t) => s.lifetime >= t.min);
  const next = TIERS[TIERS.indexOf(tier) + 1];
  const pct = next ? ((s.lifetime - tier.min) / (next.min - tier.min)) * 100 : 100;
  const unplayed = s.tickets.flatMap((t) => t.games.filter((g) => !g.played).map((g) => ({ ...g, ticket: t })));

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2400); };
  const addHist = (x, d, p, k) => [{ t: now(), d, p, k }, ...x.history].slice(0, 100);

  // 1) Transaksi via Hompimplay Payments → poin + tiket QR
  const pay = async (productId, qty) => {
    const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty, multiplier: tier.mult }) });
    const r = await res.json();
    if (r.error) return flash(r.error);
    setS((x) => ({ ...x, points: x.points + r.points, lifetime: x.lifetime + r.points,
      tickets: [...r.tickets, ...x.tickets],
      history: addHist(x, `${r.product} ×${qty} · ${rp(r.total)}`, r.points, "earn") }));
    setModal({ type: "paid", r });
  };

  // 2) Aktivitas wahana (scan gelang/QR di gate) → poin
  const playGame = (ticketId, gameId) => {
    const g = gameById(gameId);
    setS((x) => ({ ...x, points: x.points + g.pts, lifetime: x.lifetime + g.pts,
      tickets: x.tickets.map((t) => t.id !== ticketId ? t : { ...t, games: t.games.map((y) => y.id === gameId ? { ...y, played: true, at: now() } : y) }),
      history: addHist(x, `Main ${g.name}`, g.pts, "earn") }));
    flash(`+${g.pts} poin dari ${g.name} 🎉`);
  };

  // 3) Redeem voucher
  const redeem = (v) => {
    const code = rid("VC");
    const exp = new Date(Date.now() + v.exp * 864e5).toISOString();
    setS((x) => ({ ...x, points: x.points - v.cost,
      vouchers: x.vouchers.map((y) => y.id === v.id ? { ...y, stock: y.stock - 1 } : y),
      myVouchers: [{ code, name: v.name, cat: v.cat, exp, used: false, at: now() }, ...x.myVouchers],
      history: addHist(x, `Tukar ${v.name}`, -v.cost, "redeem") }));
    setModal({ type: "voucher", v: { code, name: v.name, exp } });
  };
  const useVoucher = (code) => setS((x) => ({ ...x, myVouchers: x.myVouchers.map((v) => v.code === code ? { ...v, used: true } : v) }));

  // 4) Admin: buat voucher
  const createVoucher = (v) => {
    setS((x) => ({ ...x, vouchers: [{ ...v, id: rid("V") }, ...x.vouchers] }));
    flash("Voucher baru dipublikasikan ✅");
  };

  const props = { s, tier, next, pct, unplayed, pay, playGame, redeem, useVoucher, createVoucher, setTab, setModal, flash };

  const NAV = [["home", "🏠", "Beranda"], ["pay", "💳", "Bayar"], ["qr", "🎟️", "Tiket QR"], ["rewards", "🎁", "Reward"], ["map", "🗺️", "Peta"], ["history", "📜", "Riwayat"]];
  const TITLES = { home: "Beranda", pay: "Hompimplay Payments", qr: "Tiket QR", rewards: "Reward & Voucher", map: "Peta Hompimplay", history: "Riwayat Poin", admin: "Panel Admin" };
  const web = mode === "web";

  const toggle = (
    <div className="mode">
      <button className={!web ? "act" : ""} onClick={() => switchMode("mobile")}>📱 Mobile</button>
      <button className={web ? "act" : ""} onClick={() => switchMode("web")}>🖥️ Web</button>
    </div>
  );

  return (
    <div className={web ? "shell web" : "shell"}>
      {toast && <div className="toast">{toast}</div>}

      {web && <aside className="side">
        <div style={{ padding: "4px 8px 18px" }}><Logo /></div>
        {[...NAV, ["admin", "⚙️", "Admin"]].map(([k, i, l]) => (
          <button key={k} className={tab === k ? "act" : ""} onClick={() => setTab(k)}><b>{i}</b>{l}</button>
        ))}
        <div className="side-card">
          <div className="mute">Level</div><b style={{ color: tier.color }}>{tier.name} · {tier.mult}×</b>
          <div style={{ marginTop: 10 }}><QRCodeSVG value={s.member.id} size={96} /></div>
          <div className="mute">{s.member.id}</div>
        </div>
      </aside>}

      <main className="app">
        <header className="top">
          {web ? <h1 style={{ margin: 0, fontSize: 28 }}>{TITLES[tab]}</h1> : <Logo />}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {toggle}
            <span className="pill" style={{ color: tier.color }}>★ {s.points.toLocaleString("id-ID")}{web ? " poin" : ""}</span>
          </div>
        </header>

        <div className={web ? `content c-${tab}` : ""}>
          {tab === "home" && <Home {...props} web={web} />}
          {tab === "pay" && <Pay {...props} />}
          {tab === "qr" && <Tickets {...props} />}
          {tab === "rewards" && <Rewards {...props} />}
          {tab === "map" && <MapView {...props} />}
          {tab === "history" && <History {...props} reset={() => setS(fresh())} />}
          {tab === "admin" && <Admin {...props} />}
        </div>
      </main>

      {modal && <Modal modal={modal} close={() => setModal(null)} s={s} />}

      {!web && <nav className="tabs">
        {NAV.map(([k, i, l]) => (
          <button key={k} className={tab === k ? "act" : ""} onClick={() => setTab(k)}><b>{i}</b>{l}</button>
        ))}
      </nav>}
    </div>
  );
}

function Logo() {
  const [err, setErr] = useState(false);
  return err ? <span className="brand">HomPim Play</span>
    : <img src={LOGO} alt="HomPim Play" onError={() => setErr(true)} />;
}

function Home({ s, tier, next, pct, unplayed, setTab, setModal, web }) {
  return <>
    <div className="card hero full">
      <div className="row"><b>Halo, {s.member.name} 👋</b><span className="tag" style={{ background: "#fff", color: tier.color }}>{tier.name} · {tier.mult}×</span></div>
      <div className="big">{s.points.toLocaleString("id-ID")}</div>
      <div>poin siap ditukar</div>
      <div className="bar"><i style={{ width: pct + "%" }} /></div>
      <small>{next ? `${(next.min - s.lifetime).toLocaleString("id-ID")} poin lagi ke ${next.name}` : "Level tertinggi 👑"}</small>
    </div>

    <div className="card row" onClick={() => setModal({ type: "member" })} style={{ cursor: "pointer" }}>
      <div><h3 style={{ margin: 0 }}>QR Member</h3><div className="mute">Tunjukkan di kasir & gate wahana untuk dapat poin</div></div>
      <QRCodeSVG value={s.member.id} size={56} />
    </div>

    {!web && <div className="grid4" style={{ marginBottom: 12 }}>
      {[["💳", "Bayar", "pay"], ["🎟️", "Tiket", "qr"], ["🎁", "Voucher", "rewards"], ["🗺️", "Peta", "map"]].map(([e, l, t]) => (
        <button key={t} className="quick" onClick={() => setTab(t)}><span>{e}</span>{l}</button>
      ))}
    </div>}

    {unplayed.length > 0 && <div className="card" style={{ borderColor: "var(--orange)" }}>
      <div className="row"><h2>Belum dimainkan ⏳</h2><span className="tag o">{unplayed.length} wahana</span></div>
      <p className="mute" style={{ marginTop: 0 }}>Sayang kalau terlewat! Tiket QR-mu masih berlaku.</p>
      <button style={{ width: "100%" }} onClick={() => setTab("qr")}>Lihat tiket QR</button>
    </div>}

    <div className="card">
      <h2>Cara dapat poin</h2>
      <div className="list">
        <div className="row"><span>💳 Transaksi via Hompimplay Payments</span><b>1 poin / Rp1.000</b></div>
        <div className="row"><span>🎢 Main wahana (scan QR/gelang)</span><b>+15–30 poin</b></div>
        <div className="row"><span>⭐ Bonus level {tier.name}</span><b>{tier.mult}×</b></div>
      </div>
    </div>
    {!web && <button className="ghost" style={{ width: "100%" }} onClick={() => setTab("admin")}>⚙️ Panel Admin (buat voucher)</button>}
  </>;
}

function Pay({ pay, tier }) {
  const [pid, setPid] = useState(PRODUCTS[0].id);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const p = PRODUCTS.find((x) => x.id === pid);
  const pts = Math.floor((p.price * qty) / 1000 * tier.mult);
  return <div className="card">
    <h2>Hompimplay Payments</h2>
    <p className="mute" style={{ marginTop: 0 }}>Simulasi transaksi. Setiap pembayaran otomatis jadi poin, dan pembelian tiket langsung terbit sebagai QR (pengganti gelang).</p>
    <label>Produk</label>
    <select value={pid} onChange={(e) => setPid(e.target.value)}>
      {PRODUCTS.map((x) => <option key={x.id} value={x.id}>{x.name} — {rp(x.price)}</option>)}
    </select>
    <label>Jumlah</label>
    <input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} />
    <div className="card" style={{ background: "#f3fbf6", marginTop: 12 }}>
      <div className="row"><span>Total</span><b>{rp(p.price * qty)}</b></div>
      <div className="row"><span>Poin didapat</span><b style={{ color: "var(--green)" }}>+{pts}</b></div>
      <div className="row"><span>Tiket QR</span><b>{p.games.length ? `${qty} tiket · ${p.games.length} wahana` : "—"}</b></div>
    </div>
    <button className="green" style={{ width: "100%" }} disabled={busy}
      onClick={async () => { setBusy(true); await pay(pid, qty); setBusy(false); }}>
      {busy ? "Memproses..." : "Bayar dengan HompimPay"}
    </button>
  </div>;
}

function Tickets({ s, playGame, setModal }) {
  const [f, setF] = useState("active");
  const list = s.tickets.filter((t) => (f === "active") === t.games.some((g) => !g.played));
  return <>
    <div className="seg">
      <button className={f === "active" ? "act" : ""} onClick={() => setF("active")}>Masih aktif</button>
      <button className={f === "done" ? "act" : ""} onClick={() => setF("done")}>Selesai</button>
    </div>
    {list.length === 0 && <div className="card mute full" style={{ textAlign: "center" }}>Belum ada tiket. Beli di menu Bayar 🎟️</div>}
    {list.map((t) => {
      const left = t.games.filter((g) => !g.played).length;
      return <div key={t.id} className="card">
        <div className="row">
          <div><b>{t.product}</b><div className="mute">{t.id} · {fmt(t.issued)}</div></div>
          <div onClick={() => setModal({ type: "ticket", t })} style={{ cursor: "pointer" }}><QRCodeSVG value={t.id} size={56} /></div>
        </div>
        <div className="mute" style={{ margin: "8px 0" }}>{left} dari {t.games.length} wahana belum dimainkan</div>
        <div className="list">
          {t.games.map((g) => {
            const gm = gameById(g.id), z = zoneById(gm.zone);
            return <div key={g.id} className="row">
              <div>{z.emoji} {gm.name}<div className="mute">{z.name} · +{gm.pts} poin</div></div>
              {g.played ? <span className="tag g">✓ Dimainkan</span>
                : <button className="green" style={{ padding: "6px 10px", fontSize: 13 }} onClick={() => playGame(t.id, g.id)}>Scan di gate</button>}
            </div>;
          })}
        </div>
      </div>;
    })}
  </>;
}

function Rewards({ s, redeem, useVoucher, setModal }) {
  const [f, setF] = useState("catalog");
  const [cat, setCat] = useState("Semua");
  const cats = ["Semua", ...new Set(s.vouchers.map((v) => v.cat))];
  return <>
    <div className="seg">
      <button className={f === "catalog" ? "act" : ""} onClick={() => setF("catalog")}>Katalog</button>
      <button className={f === "mine" ? "act" : ""} onClick={() => setF("mine")}>Voucher saya ({s.myVouchers.filter((v) => !v.used).length})</button>
    </div>
    {f === "catalog" ? <>
      <div className="full" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
        {cats.map((c) => <button key={c} className={c === cat ? "green" : "ghost"} style={{ padding: "6px 12px", fontSize: 13, whiteSpace: "nowrap" }} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {s.vouchers.filter((v) => cat === "Semua" || v.cat === cat).map((v) => (
        <div key={v.id} className="card voucher row">
          <div><span className="tag o">{v.cat}</span><div><b>{v.name}</b></div><div className="mute">{v.cost} poin · sisa {v.stock} · berlaku {v.exp} hari</div></div>
          <button disabled={s.points < v.cost || v.stock < 1} onClick={() => redeem(v)}>Tukar</button>
        </div>
      ))}
    </> : <>
      {s.myVouchers.length === 0 && <div className="card mute" style={{ textAlign: "center" }}>Belum ada voucher.</div>}
      {s.myVouchers.map((v) => (
        <div key={v.code} className="card voucher" style={{ opacity: v.used ? 0.5 : 1 }}>
          <div className="row">
            <div><b>{v.name}</b><div className="mute">{v.code} · s/d {new Date(v.exp).toLocaleDateString("id-ID")}</div></div>
            {v.used ? <span className="tag g">Terpakai</span>
              : <button className="green" onClick={() => setModal({ type: "voucher", v, onUse: () => useVoucher(v.code) })}>Pakai</button>}
          </div>
        </div>
      ))}
    </>}
  </>;
}

function MapView({ unplayed }) {
  const [sel, setSel] = useState(ZONES[0]);
  const pending = (zid) => unplayed.filter((u) => gameById(u.id).zone === zid).length;
  return <>
    <div className="card" style={{ padding: 8 }}>
      <svg viewBox="0 0 360 300" className="map">
        <path d="M0 140 Q90 120 180 150 T360 140" stroke="#e9d9a8" strokeWidth="18" fill="none" />
        <path d="M180 0 V300" stroke="#e9d9a8" strokeWidth="14" />
        <ellipse cx="205" cy="245" rx="70" ry="38" fill="#9fd8f5" />
        <circle cx="300" cy="215" r="34" fill="#b6e2a1" />
        {ZONES.map((z) => {
          const n = pending(z.id);
          return <g key={z.id} className={sel.id === z.id ? "sel" : ""} onClick={() => setSel(z)}>
            <circle cx={z.x} cy={z.y} r="24" fill={z.color} />
            <text x={z.x} y={z.y + 7} textAnchor="middle" fontSize="20">{z.emoji}</text>
            <text x={z.x} y={z.y + 40} textAnchor="middle" fontSize="10" fontWeight="700" fill="#22301f">{z.name.replace("Hompim ", "")}</text>
            {n > 0 && <><circle cx={z.x + 18} cy={z.y - 18} r="9" fill="#ef5d8f" /><text x={z.x + 18} y={z.y - 14} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="800">{n}</text></>}
          </g>;
        })}
        <text x="10" y="292" fontSize="10" fill="#2d5a27">🚪 Pintu masuk · Jl. Rancakendal Luhur No.9</text>
      </svg>
    </div>
    <div className="card">
      <div className="row"><h2>{sel.emoji} {sel.name}</h2><span className="tag">{sel.type}</span></div>
      <p className="mute" style={{ marginTop: 0 }}>{sel.desc}</p>
      <div className="list">
        {GAMES.filter((g) => g.zone === sel.id).map((g) => (
          <div key={g.id} className="row"><span>{g.name}</span><b>+{g.pts} poin</b></div>
        ))}
      </div>
      {pending(sel.id) > 0 && <p style={{ color: "var(--pink)", fontWeight: 700 }}>📍 {pending(sel.id)} wahana di zona ini belum kamu mainkan</p>}
    </div>
    <a className="mute full" target="_blank" rel="noreferrer" href="https://maps.google.com/?q=-6.8699251,107.6278598">Buka lokasi di Google Maps →</a>
  </>;
}

function History({ s, reset }) {
  const [f, setF] = useState("all");
  const list = s.history.filter((h) => f === "all" || h.k === f);
  const earned = s.history.filter((h) => h.p > 0).reduce((a, h) => a + h.p, 0);
  const spent = -s.history.filter((h) => h.p < 0).reduce((a, h) => a + h.p, 0);
  return <>
    <div className="grid2" style={{ marginBottom: 12 }}>
      <div className="card" style={{ margin: 0 }}><div className="mute">Total dikumpulkan</div><div className="big" style={{ fontSize: 28, color: "var(--green)" }}>{earned}</div></div>
      <div className="card" style={{ margin: 0 }}><div className="mute">Total ditukar</div><div className="big" style={{ fontSize: 28, color: "var(--orange)" }}>{spent}</div></div>
    </div>
    <div className="seg">
      {[["all", "Semua"], ["earn", "Dapat poin"], ["redeem", "Penukaran"]].map(([k, l]) => (
        <button key={k} className={f === k ? "act" : ""} onClick={() => setF(k)}>{l}</button>
      ))}
    </div>
    <div className="card list full">
      {list.map((h, i) => (
        <div key={i} className="row"><div>{h.d}<div className="mute">{fmt(h.t)}</div></div>
          <b style={{ color: h.p > 0 ? "var(--green)" : "var(--orange)" }}>{h.p > 0 ? "+" : ""}{h.p}</b></div>
      ))}
    </div>
    <button className="ghost" onClick={() => { if (confirm("Reset data demo?")) reset(); }}>Reset demo</button>
  </>;
}

function Admin({ s, createVoucher, setTab }) {
  const [v, setV] = useState({ name: "", cost: 200, stock: 50, cat: "Wahana", exp: 30 });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === "number" ? +e.target.value : e.target.value });
  return <>
    <div className="card">
      <h2>Buat Voucher Baru</h2>
      <label>Nama voucher</label><input value={v.name} onChange={set("name")} placeholder="mis. Free Flying Fox" />
      <div className="grid2">
        <div><label>Harga (poin)</label><input type="number" value={v.cost} onChange={set("cost")} /></div>
        <div><label>Stok</label><input type="number" value={v.stock} onChange={set("stock")} /></div>
        <div><label>Kategori</label>
          <select value={v.cat} onChange={set("cat")}>{["Wahana", "Tiket", "F&B", "Hadiah", "Event"].map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label>Masa berlaku (hari)</label><input type="number" value={v.exp} onChange={set("exp")} /></div>
      </div>
      <button className="green" style={{ width: "100%", marginTop: 12 }} disabled={!v.name.trim()}
        onClick={() => { createVoucher(v); setV({ ...v, name: "" }); }}>Publikasikan voucher</button>
    </div>
    <div className="card">
      <h2>Voucher aktif</h2>
      <div className="list">{s.vouchers.map((x) => (
        <div key={x.id} className="row"><span>{x.name}</span><span className="mute">{x.cost} pt · stok {x.stock}</span></div>
      ))}</div>
    </div>
    <button className="ghost" onClick={() => setTab("home")}>← Kembali</button>
  </>;
}

function Modal({ modal, close, s }) {
  const { type } = modal;
  let title, value, body;
  if (type === "member") { title = "QR Member"; value = s.member.id; body = <p className="mute">{s.member.name} · {s.member.id}</p>; }
  if (type === "ticket") { title = modal.t.product; value = modal.t.id; body = <p className="mute">Scan di gate wahana. Berlaku untuk wahana yang belum dimainkan.</p>; }
  if (type === "voucher") { title = modal.v.name; value = modal.v.code; body = <p className="mute">Kode {modal.v.code} · berlaku s/d {new Date(modal.v.exp).toLocaleDateString("id-ID")}</p>; }
  if (type === "paid") {
    const r = modal.r;
    return <div className="modal" onClick={close}><div className="card" onClick={(e) => e.stopPropagation()}>
      <div style={{ fontSize: 48 }}>✅</div><h2>Pembayaran berhasil</h2>
      <p className="mute">{r.trxId} · {r.product} · {rp(r.total)}</p>
      <div className="big" style={{ color: "var(--green)" }}>+{r.points}</div><p>poin masuk ke akunmu</p>
      {r.tickets.length > 0 && <p><b>{r.tickets.length} tiket QR</b> terbit di menu Tiket QR 🎟️</p>}
      <button className="green" onClick={close} style={{ width: "100%" }}>Oke</button>
    </div></div>;
  }
  return <div className="modal" onClick={close}><div className="card" onClick={(e) => e.stopPropagation()}>
    <h2>{title}</h2>
    <div className="qrbox"><QRCodeSVG value={value} size={200} /></div>
    {body}
    {modal.onUse && <button className="green" style={{ width: "100%", marginBottom: 8 }} onClick={() => { modal.onUse(); close(); }}>Tandai sudah dipakai kasir</button>}
    <button className="ghost" style={{ width: "100%" }} onClick={close}>Tutup</button>
  </div></div>;
}
