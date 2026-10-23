// Data mock. Di produksi, data ini datang dari backend / Hompimplay Payments.

export const LOGO = "https://www.hompimplay.id/assets/home/logo-color.png";

export const TIERS = [
  { name: "Explorer", min: 0, mult: 1, color: "#3bb5e8" },
  { name: "Adventurer", min: 1000, mult: 1.25, color: "#1f9d55" },
  { name: "Ranger", min: 3000, mult: 1.5, color: "#f7931e" },
  { name: "Legend", min: 7500, mult: 2, color: "#ef5d8f" },
];

// Aturan konversi: 1 poin per Rp1.000 transaksi (× multiplier tier); aktivitas wahana = poin flat.
export const POINT_PER_RP = 1 / 1000;

// Zona dari hompimplay.id. x,y = posisi di peta SVG (viewBox 360x300).
export const ZONES = [
  { id: "jungle", name: "Hompim Jungle", type: "Indoor", emoji: "🌴", x: 80, y: 80, color: "#1f9d55", desc: "Playground indoor interaktif" },
  { id: "city", name: "Hompim City", type: "Indoor", emoji: "🏙️", x: 180, y: 60, color: "#3bb5e8", desc: "Kota mini untuk role-play anak" },
  { id: "farm", name: "Hompim Farm", type: "Outdoor", emoji: "🐐", x: 285, y: 85, color: "#a0702a", desc: "Edukasi hewan & mini zoo" },
  { id: "park", name: "Hompim Park", type: "Outdoor", emoji: "🏎️", x: 95, y: 200, color: "#f7931e", desc: "Hompim Dash go-kart, flying fox, wall climbing" },
  { id: "island", name: "Hompim Island", type: "Outdoor", emoji: "💦", x: 200, y: 235, color: "#2a8fd6", desc: "Wahana air untuk keluarga" },
  { id: "strawberry", name: "Kisah Bukit Strawberry", type: "Outdoor", emoji: "🍓", x: 290, y: 200, color: "#ef5d8f", desc: "Petik strawberry di bukit" },
  { id: "planet", name: "Hompim Planet", type: "Indoor", emoji: "🪐", x: 180, y: 150, color: "#7b5cd6", desc: "Wahana tema luar angkasa" },
];

export const GAMES = [
  { id: "g1", name: "Hompim Dash Go-Kart", zone: "park", pts: 30 },
  { id: "g2", name: "Flying Fox", zone: "park", pts: 25 },
  { id: "g3", name: "Wall Climbing", zone: "park", pts: 20 },
  { id: "g4", name: "Jungle Playground", zone: "jungle", pts: 20 },
  { id: "g5", name: "Feeding Farm Animals", zone: "farm", pts: 15 },
  { id: "g6", name: "Water Splash", zone: "island", pts: 20 },
  { id: "g7", name: "Petik Strawberry", zone: "strawberry", pts: 15 },
  { id: "g8", name: "Mini City Role Play", zone: "city", pts: 15 },
];

export const PRODUCTS = [
  { id: "p1", name: "Tiket Weekday Anak", price: 100000, games: ["g1", "g4", "g5", "g6"] },
  { id: "p2", name: "Tiket Weekend Dewasa", price: 150000, games: ["g1", "g2", "g3", "g6", "g7"] },
  { id: "p3", name: "Paket Keluarga (4 org)", price: 450000, games: ["g1", "g2", "g4", "g5", "g6", "g7", "g8"] },
  { id: "p4", name: "Makan di Food Court", price: 85000, games: [] },
  { id: "p5", name: "Souvenir Shop", price: 60000, games: [] },
];

export const DEFAULT_VOUCHERS = [
  { id: "v1", name: "Diskon 20% Food Court", cost: 150, stock: 100, cat: "F&B", exp: 30 },
  { id: "v2", name: "Free 1x Hompim Dash", cost: 300, stock: 50, cat: "Wahana", exp: 30 },
  { id: "v3", name: "Tiket Weekday Gratis", cost: 900, stock: 20, cat: "Tiket", exp: 60 },
  { id: "v4", name: "Boneka Maskot Hompim", cost: 1200, stock: 15, cat: "Hadiah", exp: 60 },
  { id: "v5", name: "Paket Ulang Tahun -30%", cost: 2500, stock: 5, cat: "Event", exp: 90 },
];
