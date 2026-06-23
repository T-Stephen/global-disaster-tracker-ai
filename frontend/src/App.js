import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Globe from 'react-globe.gl';

const API_URL = 'http://127.0.0.1:5000/api/disasters';

function App() {
  const globeEl = useRef();
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dimensions, setDimensions] = useState({ width: window.innerWidth - 380, height: window.innerHeight });

  // Handle Window Resize for the 3D Canvas
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 380, // Subtracting sidebar width
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Fetch Data with Error Handling
  useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error("Backend offline");
        return res.json();
      })
      .then(json => {
        const sortedData = json.data.sort((a, b) => b.risk_score - a.risk_score);
        
        // Map data specifically for the 3D Globe requirements (lng instead of lon)
        const globeReadyData = sortedData.map(evt => ({
          ...evt,
          lng: evt.lon 
        }));

        setAllEvents(globeReadyData);
        setFilteredEvents(globeReadyData);
        setLoading(false); // Stop loading on success
      })
      .catch(err => {
        console.error("Data Error: Is the Python backend running?", err);
        setLoading(false); // Stop loading even on error
      });
  }, []);

  // 2. Filter Logic
  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'All') setFilteredEvents(allEvents);
    else setFilteredEvents(allEvents.filter(e => e.category === category));
  };

  // 3. Risk Color Helper (Sci-Fi Palette)
  const getRiskColor = (risk) => {
    if (risk === 'Critical') return '#ff003c'; // Neon Red
    if (risk === 'High') return '#ff8800';     // Neon Orange
    if (risk === 'Medium') return '#fcee0a';   // Cyberpunk Yellow
    return '#00f0ff';                          // Cyan
  };

  // 4. Fly to Location Animation
  const flyToLocation = (lat, lng) => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat, lng, altitude: 1.5 }, 1500); // 1.5s flight animation
    }
  };

  return (
    <div className="vh-100 d-flex flex-column" style={{backgroundColor: '#050505', overflow: 'hidden'}}>
      
      {/* --- HUD HEADER --- */}
      <nav className="navbar navbar-dark bg-black border-bottom border-dark px-4 py-2 d-flex justify-content-between z-3">
        <div className="d-flex align-items-center gap-3">
          <span className="navbar-brand mb-0 h2 fw-bold" style={{color: '#00f0ff', letterSpacing: '2px', textShadow: '0 0 10px #00f0ff'}}>
            DISASTER.AI // CORE
          </span>
          <span className="badge bg-danger bg-opacity-75 border border-danger pulse-animation" style={{boxShadow: '0 0 10px red'}}>
            SATELLITE SYNC: ONLINE
          </span>
        </div>
        
        <div className="d-flex gap-2">
          {['All', 'Wildfires', 'Earthquake', 'Severe Storms'].map(cat => (
            <button 
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`btn btn-sm text-uppercase fw-bold ${selectedCategory === cat ? 'btn-info text-black' : 'btn-outline-secondary'}`}
              style={{fontSize: '0.75rem', letterSpacing: '1px'}}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-grow-1 d-flex position-relative">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="glass-panel d-flex flex-column" style={{width: '380px', zIndex: 1000, backgroundColor: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(10px)', borderRight: '1px solid #1a1a1a'}}>
          
          <div className="p-4 border-bottom border-dark">
            <div className="row text-center">
              <div className="col-6 border-end border-secondary">
                <h2 className="fw-bold mb-0 text-white display-6">{filteredEvents.length}</h2>
                <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>Active Threats</small>
              </div>
              <div className="col-6">
                <h2 className="fw-bold mb-0 display-6" style={{color: '#ff003c'}}>
                  {filteredEvents.filter(e => e.risk_label === 'Critical').length}
                </h2>
                <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>Critical Alerts</small>
              </div>
            </div>
          </div>

          <div className="flex-grow-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="text-center p-5 text-muted">
                <div className="spinner-border text-info mb-3"></div>
                <p className="small text-uppercase tracking-widest">Calibrating 3D Engine...</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="p-3 border-bottom border-dark event-card"
                  onClick={() => flyToLocation(event.lat, event.lng)}
                  style={{cursor: 'pointer'}}
                >
                  <div className="d-flex justify-content-between mb-1">
                    <span className="badge bg-dark border text-uppercase" style={{borderColor: getRiskColor(event.risk_label), color: getRiskColor(event.risk_label)}}>
                      {event.category}
                    </span>
                  </div>
                  <h6 className="mb-2 text-light fw-bold" style={{fontSize: '0.9rem'}}>{event.title}</h6>
                  
                  <div className="d-flex align-items-center">
                    <small className="me-2 text-muted fw-bold" style={{fontSize: '0.7rem'}}>RISK</small>
                    <div className="progress flex-grow-1" style={{height: '3px', backgroundColor: '#1a1a1a'}}>
                      <div 
                        className="progress-bar" 
                        style={{
                          width: `${event.risk_score}%`, 
                          backgroundColor: getRiskColor(event.risk_label),
                          boxShadow: `0 0 10px ${getRiskColor(event.risk_label)}`
                        }}
                      ></div>
                    </div>
                    <small className="ms-2 fw-bold" style={{color: getRiskColor(event.risk_label)}}>{event.risk_score}%</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- 3D WEBGL GLOBE --- */}
        <div className="flex-grow-1 bg-black position-relative" style={{cursor: 'grab'}}>
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            
            // --- 3D LIGHT PILLARS (FIXED SCALE) ---
            pointsData={filteredEvents}
            pointAltitude={(d) => d.risk_score / 1000} // Calibrated height
            pointColor={(d) => getRiskColor(d.risk_label)}
            pointRadius={0.4} // Thicker base
            pointsMerge={false} // Prevents visual stretching bugs
            
            // --- PULSING SONAR RINGS ---
            ringsData={filteredEvents}
            ringColor={(d) => getRiskColor(d.risk_label)}
            ringMaxRadius={(d) => d.risk_score / 12} // Rings expand based on risk
            ringPropagationSpeed={2}
            ringRepeatPeriod={800}
            
            // --- TOOLTIPS ---
            pointLabel={(d) => `
              <div style="background: rgba(0,0,0,0.8); padding: 10px; border: 1px solid ${getRiskColor(d.risk_label)}; border-radius: 4px; font-family: sans-serif;">
                <b style="color: white">${d.title}</b><br/>
                <span style="color: ${getRiskColor(d.risk_label)}">Severity: ${d.risk_label} (${d.risk_score})</span>
              </div>
            `}
          />
        </div>
      </div>
    </div>
  );
}

export default App;