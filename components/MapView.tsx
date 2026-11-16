"use client";
import {MapContainer,TileLayer,Marker,Popup,useMap} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {useEffect} from "react";
export type MapPlace={id:string;name:string;lat:number;lon:number;category:string;distanceKm:number};
const icon=L.divIcon({className:"pin-icon",html:'<span class="pin-dot"></span>',iconSize:[22,22],iconAnchor:[11,11]});
function Fit({places,center}:{places:MapPlace[];center:[number,number]}){const map=useMap();useEffect(()=>{if(places.length)map.fitBounds([[center[0],center[1]],...places.map(p=>[p.lat,p.lon] as [number,number])],{padding:[35,35],maxZoom:13});else map.setView(center,12);},[places,center,map]);return null;}
export default function MapView({center,places}:{center:[number,number];places:MapPlace[]}) {
 return <div className="map-frame"><MapContainer center={center} zoom={12} scrollWheelZoom className="leaflet-map"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><Marker position={center}><Popup>Destination search location</Popup></Marker>{places.map(p=><Marker key={p.id} position={[p.lat,p.lon]} icon={icon}><Popup><b>{p.name}</b><br/>{p.category} · {p.distanceKm} km away</Popup></Marker>)}<Fit places={places} center={center}/></MapContainer></div>;
}