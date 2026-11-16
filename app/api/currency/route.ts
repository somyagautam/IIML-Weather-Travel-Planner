import { NextRequest,NextResponse } from "next/server";
export async function GET(req:NextRequest) {
 const from=(req.nextUrl.searchParams.get("from")||"USD").toUpperCase(), amount=Number(req.nextUrl.searchParams.get("amount")||0);
 if(!/^[A-Z]{3}$/.test(from)||!Number.isFinite(amount)||amount<0) return NextResponse.json({error:"Invalid currency or amount."},{status:400});
 if(from==="INR") return NextResponse.json({from,to:"INR",amount,converted:amount,rate:1,source:"same currency"});
 try {
  const r=await fetch(`https://api.frankfurter.app/latest?from=${from}&to=INR`,{next:{revalidate:21600}});
  if(!r.ok) throw new Error("FX unavailable");
  const d=await r.json(), rate=Number(d.rates?.INR);
  if(!rate) throw new Error("Rate unavailable");
  return NextResponse.json({from,to:"INR",amount,converted:amount*rate,rate,date:d.date,source:"Frankfurter reference rate"});
 } catch { return NextResponse.json({from,to:"INR",amount,converted:null,rate:null,source:"unavailable"}); }
}