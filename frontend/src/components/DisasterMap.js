

// frontend/src/components/DisasterMap.js
import React, { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css"; // for custom styling

// small inline emoji icon generator (fast)
const createEmojiIcon = (emoji, color) => L.divIcon({
  className: "emoji-divicon",
  html: `<div style="display:flex;align-items:center;justify-content:center;
         width:36px;height:36px;border-radius:18px;background:${color};color:white;font-size:18px;border:2px solid white;">
         ${emoji}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const typeToEmoji = {
  earthquake: "🌍",
  wildfire: "🔥",
  volcano: "🌋",
  storm: "🌪",
  flood: "🌊",
  other: "⚠️"
};

const typeToColor = {
  earthquake: "#e63946",
  wildfire: "#ff7b00",
  volcano: "#ffb703",
  storm: "#6a4c93",
  flood: "#118ab2",
  other: "#6c757d"
};

const MapBoundsTracker = ({ setBounds }) => {
  useMapEvents({
    moveend(e) { setBounds(e.target.getBounds()); },
    zoomend(e) { setBounds(e.target.getBounds()); }
  });
  return null;
};

export default function DisasterMap({ disasters }) {
  const [bounds, setBounds] = useState(null);
  const mapRef = useRef();

  // derive visible disasters (bounds filtering)
  const visible = useMemo(() => {
    if (!bounds) return disasters;
    return disasters.filter(d => {
      const lat = d.coordinates && d.coordinates[0];
      const lng = d.coordinates && d.coordinates[1];
      if (lat == null || lng == null) return false;
      return bounds.contains([lat, lng]);
    });
  }, [disasters, bounds]);

  // cluster options for performance
  const clusterOptions = {
    chunkedLoading: true,
    removeOutsideVisibleBounds: true,
    spiderfyOnEveryZoom: false,
    maxClusterRadius: 50,
    disableClusteringAtZoom: 10
  };

  return (
    <div className="map-wrapper">
      <MapContainer center={[20,0]} zoom={2} style={{ height: "100%", width: "100%" }} whenCreated={m => mapRef.current = m}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapBoundsTracker setBounds={setBounds} />

        <MarkerClusterGroup {...clusterOptions}>
          {visible.map((d, idx) => {
            const type = (d.type || "other").toLowerCase();
            const emoji = typeToEmoji[type] || typeToEmoji.other;
            const color = typeToColor[type] || typeToColor.other;
            const icon = createEmojiIcon(emoji, color);

            // ensure coordinates are [lat, lon]
            const coords = d.coordinates && d.coordinates.length >= 2 ? [d.coordinates[0], d.coordinates[1]] : null;
            if (!coords) return null;
            return (
              <Marker key={d.id || idx} position={coords} icon={icon}>
                <Popup>
                  <div style={{minWidth:200}}>
                    <strong>{d.title || d.place || d.type}</strong><br/>
                    <em>Type:</em> {d.type}<br/>
                    {d.magnitude != null && <><em>Mag:</em> {d.magnitude}<br/></>}
                    <em>Risk:</em> {d.risk || 'N/A'}<br/>
                    <small>{d.time ? new Date(d.time).toLocaleString() : ''}</small>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

      </MapContainer>
    </div>
  );
}



