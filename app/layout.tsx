import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Roamcast AI — Weather & Travel Planner",
  description: "Plan weather-aware trips with a 10-day forecast, personalized itinerary, map and budget."
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}