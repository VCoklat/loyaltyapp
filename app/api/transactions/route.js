import { NextResponse } from "next/server";
import { processPaidTransaction } from "@/lib/hompimpay";

// POST /api/transactions  { productId, qty, multiplier }
// Titik integrasi: Hompimplay Payments memanggil endpoint ini (webhook) saat transaksi lunas.
export async function POST(req) {
  try {
    const body = await req.json();
    return NextResponse.json(processPaidTransaction(body));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
