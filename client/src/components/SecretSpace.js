import React, { useState, useEffect, useRef } from 'react';

const SecretSpace = ({ plantIdApiKey }) => {
  const [secretSubTab, setSecretSubTab] = useState('easter');
  const [plantImage, setPlantImage] = useState(null);
  const [plantResult, setPlantResult] = useState(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const tadaRef = useRef(null);

  useEffect(() => {
    if (secretSubTab === 'easter') {
      setShowConfetti(true);
      if (tadaRef.current) {
        tadaRef.current.classList.remove('tada-animate');
        // Force reflow to restart animation
        void tadaRef.current.offsetWidth;
        tadaRef.current.classList.add('tada-animate');
      }
      // Hide confetti after 2.5s
      const timeout = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [secretSubTab]);

  async function identifyPlant(imageFile) {
    setIsIdentifying(true);
    setPlantResult(null);
    setRawApiResponse(null);
    try {
      const formData = new FormData();
      formData.append('images', imageFile);
      formData.append('organs', 'leaf'); // You can adjust this if needed
      // Request more details from the API
      formData.append('plant_details', JSON.stringify(["common_names","url","taxonomy","health_assessment"]));
      formData.append('plant_language', 'en');
      const response = await fetch('https://api.plant.id/v2/identify', {
        method: 'POST',
        headers: { 'Api-Key': plantIdApiKey },
        body: formData,
      });
      const data = await response.json();
      setRawApiResponse(data);
      if (data && data.suggestions && data.suggestions.length > 0) {
        setPlantResult(data.suggestions);
      } else {
        setPlantResult(JSON.stringify(data, null, 2));
      }
      setIsIdentifying(false);
    } catch (err) {
      setPlantResult('Error identifying plant.');
      setIsIdentifying(false);
    }
  }

  const getProbabilityColor = (prob) => {
    if (prob >= 0.85) return '#27ae60'; // green
    if (prob >= 0.5) return '#f39c12'; // orange
    return '#e74c3c'; // red
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          style={{ marginRight: '1rem', padding: '0.5rem 1rem', fontWeight: secretSubTab === 'easter' ? 'bold' : 'normal' }}
          onClick={() => setSecretSubTab('easter')}
        >
          🎉 Easter Egg
        </button>
        <button
          style={{ padding: '0.5rem 1rem', fontWeight: secretSubTab === 'botany' ? 'bold' : 'normal' }}
          onClick={() => setSecretSubTab('botany')}
        >
          🌱 Botany
        </button>
      </div>
      {secretSubTab === 'easter' && (
        <>
          <div ref={tadaRef} className="tada-animate" style={{ display: 'inline-block' }}>
            <h1 style={{ fontSize: '2.2em', fontWeight: 800, marginBottom: 0 }}>🎉 You found the secret tab! 🎉</h1>
          </div>
          <p style={{ fontSize: '1.2em', marginTop: 8 }}>Here's your Easter egg. 🥚</p>
          <p>Press Ctrl+Shift+E again to hide this tab.</p>
          {showConfetti && (
            <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
              {[...Array(60)].map((_, i) => {
                const left = Math.random() * 100;
                const duration = 1.8 + Math.random() * 1.7; // 1.8s to 3.5s
                const delay = Math.random() * 0.5;
                return (
                  <span key={i} style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: '-2em',
                    fontSize: `${Math.random() * 1.2 + 1.2}em`,
                    opacity: 0.92,
                    animation: `confetti-fall ${duration}s ${delay}s linear forwards`,
                    pointerEvents: 'none',
                  }}>
                    {['🎉','✨','🥳','🎊','💥','⭐','🎈'][Math.floor(Math.random()*7)]}
                  </span>
                );
              })}
            </div>
          )}
        </>
      )}
      {secretSubTab === 'botany' && (
        <div>
          <h2>🌱 Botany Space</h2>
          <p>Upload a plant image and click Identify to see the result using plant.id!</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1em', margin: '1.5em 0 1em 0' }}>
            <input
              id="plant-upload-input"
              type="file"
              accept="image/*"
              onChange={e => {
                setPlantImage(e.target.files[0]);
                setPlantResult(null);
              }}
              style={{ display: 'none' }}
            />
            <label htmlFor="plant-upload-input" style={{
              background: '#1976d2',
              color: '#fff',
              borderRadius: '6px',
              padding: '0.5em 1.3em',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1em',
              boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
              transition: 'background 0.2s',
              marginRight: '0.5em',
              display: 'inline-block',
            }}
              onMouseOver={e => e.currentTarget.style.background = '#1565c0'}
              onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
            >
              Choose File
            </label>
            <span style={{ fontSize: '0.98em', color: '#444', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {plantImage ? plantImage.name : 'No file chosen'}
            </span>
          </div>
          {plantImage && (
            <div style={{ margin: '1rem auto', maxWidth: 300 }}>
              <img
                src={URL.createObjectURL(plantImage)}
                alt="Uploaded plant"
                style={{ width: '100%', borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
          )}
          <br />
          <button
            onClick={() => plantImage && identifyPlant(plantImage)}
            disabled={!plantImage || isIdentifying}
            style={{
              padding: '0.6em 2.2em',
              borderRadius: '6px',
              background: plantImage && !isIdentifying ? '#43a047' : '#bdbdbd',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.08em',
              border: 'none',
              boxShadow: plantImage && !isIdentifying ? '0 2px 8px rgba(67,160,71,0.10)' : 'none',
              cursor: plantImage && !isIdentifying ? 'pointer' : 'not-allowed',
              margin: '0.5em 0 1.2em 0',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => { if (plantImage && !isIdentifying) e.currentTarget.style.background = '#388e3c'; }}
            onMouseOut={e => { if (plantImage && !isIdentifying) e.currentTarget.style.background = '#43a047'; }}
          >
            {isIdentifying ? 'Identifying...' : 'Identify'}
          </button>
          {plantResult && (
            <div style={{ marginTop: '1rem', background: '#f4f4f4', padding: '1rem', borderRadius: '12px', textAlign: 'left', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
              <strong style={{ fontSize: '1.2em', display: 'block', marginBottom: '1em' }}>Results:</strong>
              {Array.isArray(plantResult) ? (
                plantResult.map((s, idx) => {
                  const details = s.plant_details || {};
                  const taxonomy = details.taxonomy || {};
                  const health = details.health_assessment || {};
                  const probColor = getProbabilityColor(s.probability || 0);
                  return (
                    <div key={idx} style={{
                      marginBottom: '2rem',
                      borderRadius: '10px',
                      background: '#fff',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
                      padding: '1.2rem 1.5rem',
                      border: '1px solid #eaeaea',
                      transition: 'box-shadow 0.2s',
                      ':hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.13)' }
                    }}>
                      <div style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: 6 }}>{s.plant_name || 'N/A'}</div>
                      <div style={{ fontWeight: 500, marginBottom: 10 }}>
                        Probability: <span style={{ color: probColor, fontWeight: 700 }}>{(s.probability !== undefined ? (s.probability * 100).toFixed(2) + '%' : 'N/A')}</span>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <strong>Common Name:</strong> {details.common_names && details.common_names.length > 0 ? details.common_names[0] : 'N/A'}
                      </div>
                      {details.common_names && details.common_names.length > 1 && (
                        <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '0.4em' }}>
                          <strong style={{ marginRight: 6 }}>All Common Names:</strong>
                          {details.common_names.map((name, i) => (
                            <span key={i} style={{ background: '#e0f7fa', color: '#00796b', borderRadius: '12px', padding: '0.2em 0.7em', fontSize: '0.97em', marginRight: 4, marginBottom: 2 }}>{name}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ margin: '10px 0 4px 0', fontWeight: 600 }}>Taxonomy:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2em', marginBottom: 8 }}>
                        {taxonomy.kingdom && <div><span style={{ fontWeight: 500 }}>Kingdom:</span> {taxonomy.kingdom}</div>}
                        {taxonomy.phylum && <div><span style={{ fontWeight: 500 }}>Phylum:</span> {taxonomy.phylum}</div>}
                        {taxonomy.class && <div><span style={{ fontWeight: 500 }}>Class:</span> {taxonomy.class}</div>}
                        {taxonomy.order && <div><span style={{ fontWeight: 500 }}>Order:</span> {taxonomy.order}</div>}
                        {taxonomy.family && <div><span style={{ fontWeight: 500 }}>Family:</span> {taxonomy.family}</div>}
                        {taxonomy.genus && <div><span style={{ fontWeight: 500 }}>Genus:</span> {taxonomy.genus}</div>}
                        {!taxonomy.kingdom && !taxonomy.phylum && !taxonomy.class && !taxonomy.order && !taxonomy.family && !taxonomy.genus && <div>N/A</div>}
                      </div>
                      <div style={{ margin: '10px 0 4px 0', fontWeight: 600 }}>Health Assessment:</div>
                      <div style={{ marginBottom: 8 }}>
                        {health.is_healthy !== undefined && <div>Is Healthy: <span style={{ color: health.is_healthy ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{health.is_healthy ? 'Yes' : 'No'}</span></div>}
                        {health.diseases && health.diseases.length > 0 && <div>Diseases: {health.diseases.map(d => d.name).join(', ')}</div>}
                        {health.is_healthy === undefined && (!health.diseases || health.diseases.length === 0) && <div>N/A</div>}
                      </div>
                      {details.url && (
                        <a href={details.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#1976d2', color: '#fff', borderRadius: '6px', padding: '0.4em 1.1em', textDecoration: 'none', fontWeight: 600, margin: '8px 0' }}>Wikipedia</a>
                      )}
                      {details.wiki_description && details.wiki_description.value && (
                        <div style={{ marginTop: 8, fontStyle: 'italic', color: '#444' }}><strong>Description:</strong> {details.wiki_description.value}</div>
                      )}
                    </div>
                  );
                })
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{plantResult}</pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecretSpace; 