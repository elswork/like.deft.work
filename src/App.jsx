import React, { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import './index.css'

function useDiscoveries() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "discoveries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const discoveriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(discoveriesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { data, loading };
}

function App() {
  const { data: discoveries, loading } = useDiscoveries();
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(discoveries.map(item => item.category))];
  const filteredDiscoveries = filter === 'All' 
    ? discoveries 
    : discoveries.filter(d => d.category === filter);

  return (
    <div className="app-container">
      <header>
        <h1>like.deft.work</h1>
        <p className="subtitle">La cámara de descubrimientos premium de la Nación Digital</p>
      </header>

      <div className="category-filter">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main>
        {loading ? (
          <div style={{textAlign: 'center', padding: '4rem', color: 'var(--primary)'}}>Iniciando sincronización con el Nexo...</div>
        ) : (
          <div className="discovery-grid">
            {filteredDiscoveries.map(item => {
              const catClass = item.category?.toLowerCase() || 'default';
              return (
                <div key={item.id} className={`card ${catClass}`}>
                  <span className="category-badge">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  
                  {item.metadata && (
                    <div className="card-metadata">
                      {Object.entries(item.metadata).map(([key, val]) => (
                        <div key={key} className="meta-item">
                          <span className="meta-key">{key}</span>
                          <span className="meta-val">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="card-footer">
                    <span className="subcategory">{item.subcategory}</span>
                    <button className="btn-action">Explorar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer style={{textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.8rem'}}>
        &copy; 2026 Nexo Anticitera // Arquitectura de Descubrimiento Universal
      </footer>
    </div>
  )
}

export default App
