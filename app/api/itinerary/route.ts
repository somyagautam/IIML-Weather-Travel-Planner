import { NextRequest, NextResponse } from "next/server";
type Place={id:string;name:string;lat:number;lon:number;category:string;distanceKm:number};
type Day={date:string;weather:string;high:number;low:number;rain:number;precip:number};
const weatherAdvice=(d:Day)=>d.rain>=50||d.precip>=5?"Rain is likely: prioritize museums, covered markets and indoor experiences; keep outdoor stops flexible.":"Conditions look more suitable for exploring outdoors; include a walk, viewpoint or open-air attraction.";
function fallback(days:Day[],places:Place[],destination:string,interests:string[],hours:number) {
 const interestWords=interests.join(" ").toLowerCase();
 const rank=(p:Place)=> (interestWords.includes("history")&&/historic|museum|fort|castle|temple|church/i.test(p.name+" "+p.category)?5:0)+(interestWords.includes("food")&&/market|food/i.test(p.name+" "+p.category)?5:0)+(interestWords.includes("nature")&&/park|garden|beach|viewpoint|nature/i.test(p.name+" "+p.category)?5:0)+(interestWords.includes("art")&&/gallery|museum|art/i.test(p.name+" "+p.category)?5:0);
 const sorted=[...places].sort((a,b)=>rank(b)-rank(a));
 const generic=["Explore the historic centre and its main landmarks","Visit a local museum or cultural attraction","Discover a neighbourhood market and regional food","Enjoy a park, garden or scenic viewpoint","Explore local architecture and independent shops","Take a relaxed walking tour and try a local speciality"];
 return days.map((d,i)=>{
   const rainy=d.rain>=50||d.precip>=5;
   const available=sorted.filter((p,j)=>j%days.length===i||j<days.length*2).slice(i*2,i*2+2);
  ? available.map((p, j) => ({
      placeId: p.id,
      time: j === 0 ? "Morning" : "Afternoon",
      title: p.name,
      description: `${p.category.replaceAll("_", " ")} · about ${p.distanceKm} km from the destination search point`      
    }))
  : [
      {
        placeId: "",
        time: "Morning",
        title: generic[(i * 2) % generic.length],
        description: "A flexible suggested activity based on the destination."
      },
      {
        placeId: "",
        time: "Afternoon",
        title: generic[(i * 2 + 1) % generic.length],
        description: "Allow time for breaks, meals and local discoveries."
      }
    ];
   if(rainy) activities.push({placeId:"",time:"Weather tip",title:"Keep an indoor alternative",description:"Rain is possible; check local conditions before heading out."});
   return {day:i+1,date:d.date,weather:d.weather,high:d.high,low:d.low,rainChance:d.rain,summary:weatherAdvice(d),activities:activities.slice(0,Math.max(2,Math.min(3,Math.floor(hours/3))))};
 });
}
export async function POST(req:NextRequest) {
 try {
  const body=await req.json();
  const destination=String(body.destination??"").slice(0,120), days=(body.days??[]).slice(0,5) as Day[], places=(body.places??[]).slice(0,30) as Place[];
  const interests=(body.interests??[]).slice(0,10).map((x:any)=>String(x).slice(0,40)), hours=Math.max(2,Math.min(14,Number(body.hours)||8));
  if(!destination||days.length<3||days.length>5) return NextResponse.json({error:"Destination and 3–5 forecast days are required."},{status:400});
  const apiKey=process.env.OPENAI_API_KEY;
  if(apiKey) {
   const prompt={destination,availableHoursPerDay:hours,interests,forecast:days,nearbyAttractions:places.map(p=>({id:p.id,name:p.name,category:p.category,distanceKm:p.distanceKm})),instructions:"Create a realistic day-by-day travel itinerary. Match activities to forecast, prioritize the supplied interests, avoid overpacking the day, use nearby attractions only when supplied, and refer to placeId exactly when using one. For rainy days favor indoor activities. Return JSON only with key days: array of {day,date,weather,high,low,rainChance,summary,activities:[{time,title,description,placeId?}]}. Do not invent opening hours, ticket prices or travel times."};
   try {
    const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",response_format:{type:"json_object"},messages:[{role:"system",content:"You are a careful local travel planner. Output valid JSON only."},{role:"user",content:JSON.stringify(prompt)}],temperature:0.5}),signal:AbortSignal.timeout(45000)});
    if(r.ok){const data=await r.json();const raw=data.choices?.[0]?.message?.content;const parsed=JSON.parse(raw);if(Array.isArray(parsed.days)&&parsed.days.length) return NextResponse.json({days:parsed.days,mode:"AI"});}
   } catch { /* fall through to deterministic itinerary */ }
  }
  return NextResponse.json({days:fallback(days,places,destination,interests,hours),mode:"Planner"});
 } catch { return NextResponse.json({error:"Could not generate the itinerary. Please try again."},{status:500}); }
}
