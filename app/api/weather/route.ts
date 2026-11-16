import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const lat=req.nextUrl.searchParams.get("lat"), lon=req.nextUrl.searchParams.get("lon");
  if (!lat || !lon || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon)))
    return NextResponse.json({error:"Valid latitude and longitude are required."},{status:400});
  const params=new URLSearchParams({
    latitude:lat, longitude:lon,
    daily:"weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
    current:"temperature_2m,weather_code,wind_speed_10m",
    forecast_days:"10", timezone:"auto"
  });
  try {
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`,{next:{revalidate:1800}});
    if(!r.ok) throw new Error("Forecast provider unavailable");
    return NextResponse.json(await r.json());
  } catch { return NextResponse.json({error:"Weather forecast could not be loaded. Please retry."},{status:502}); }
}