import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] }, { status: 400 });
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.search = new URLSearchParams({ name:q, count:"8", language:"en", format:"json" }).toString();
    const r = await fetch(url, { next:{ revalidate:86400 } });
    if (!r.ok) throw new Error("Geocoding provider unavailable");
    const data = await r.json();
    return NextResponse.json({ results:(data.results ?? []).map((x:any)=>({
      id:x.id, name:x.name, country:x.country, country_code:x.country_code,
      admin1:x.admin1, latitude:x.latitude, longitude:x.longitude, timezone:x.timezone
    })) });
  } catch { return NextResponse.json({ error:"Could not search for that location." },{status:502}); }
}