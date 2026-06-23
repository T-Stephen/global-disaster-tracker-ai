// frontend/src/components/DisasterFeed.js
import React from "react";

export default function DisasterFeed({ disasters }) {
  return (
    <div style={{ padding: 12 }}>
      <h3>Live Feed</h3>
      <div style={{ maxHeight: '82vh', overflowY: 'auto' }}>
        {disasters.length === 0 && <div>No events.</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {disasters.map((d, i) => (
            <li key={d.id || i} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
              <strong>{d.title || d.place}</strong><br/>
              <small>{d.type} • {d.risk || 'N/A'} • {d.magnitude ? `mag ${d.magnitude}` : ''}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
