import { NextResponse } from "next/server";
import { store, simulateLatency } from "@/lib/store";

export async function GET() {
  await simulateLatency();

  return NextResponse.json({
    success: true,
    message: "OK",
    data: store.providers,
  });
}
