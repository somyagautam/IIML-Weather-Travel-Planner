import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(req:NextRequest) {
  const lat=Number(req.nextUrl.searchParams.get("lat")), lon=Number(req.nextUrl.searchParams.get("lon"));
  if(!Number.isFinite(lat)||!Number.isFinite(lon)) return NextResponse.json({places:[]},{status:400});
  const query=`[out:json][timeout:20];(node(around:12000,${lat},${lon})["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"];way(around:12000,${lat},${lon})["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"];relation(around:12000,${lat},${lon})["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"];);out center tags 50;`;
  try {
   const r = await fetch(
     "https://overpass-api.de/api/interpreter",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "RoamcastAI/1.0 travel planner"
    },
    body: new URLSearchParams({
      data: query
    }),
    signal: AbortSignal.timeout(25000),
    cache: "no-store"
  }
);
    if(!r.ok) throw new Error("Places service unavailable");
    const data=await r.json();
    const places=(data.elements??[]).map((e:any)=>{
      const p=e.center??e; const name=e.tags?.name;
      if(!name||!Number.isFinite(p.lat)||!Number.isFinite(p.lon)) return null;
      return {id:String(e.id),name,lat:p.lat,lon:p.lon,category:e.tags?.tourism??e.tags?.historic??"place",distanceKm:Math.round(Math.hypot((p.lat-lat)*111,(p.lon-lon)*111*Math.cos(lat*Math.PI/180))*10)/10};
    }).filter(Boolean).sort((a:any,b:any)=>a.distanceKm-b.distanceKm).slice(0,30);
    return NextResponse.json({places});
  } catch { return NextResponse.json({places:[],warning:"Nearby attraction search is temporarily unavailable."}); }
}
