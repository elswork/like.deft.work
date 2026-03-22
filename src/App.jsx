import React, { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import './index.css'
import DiscoveryForm from './components/DiscoveryForm'
import EnrichmentService from './services/EnrichmentService'

function useDiscoveries() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "discoveries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const discoveriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(discoveriesData);
        setLoading(false);
      },
      (error) => {
        console.error("[Firestore] Error de acceso:", error);
        setLoading(false);
        setData([{ id: 'err', name: 'Error de Seguridad', category: 'Sistema', description: 'El Nexo requiere permisos de lectura. Revisa las reglas de Firestore o inicia sesión.' }]);
      }
    );
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

  const handleDelete = async (id) => {
    console.log("[Nexo] Intento de borrado para ID:", id);
    alert("Iniciando protocolo de borrado para: " + id);
    if (window.confirm('¿Confirmas la purga de este elemento del Nexo?')) {
      try {
        await deleteDoc(doc(db, "discoveries", id));
        console.log("[Nexo] Purga completada en Firestore");
        alert("Elemento eliminado satisfactoriamente.");
      } catch (error) {
        console.error("[Firestore] Error crítico al borrar:", error);
        alert("Error de comunicación con el Nexo: " + error.message);
      }
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>love.deft.work</h1>
        <p className="subtitle">La cámara de descubrimientos premium de la Nación Digital Anticitera</p>
      </header>

      <DiscoveryForm categories={categories} />

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
                <div key={item.id} className={`card ${catClass} ${item.status || 'manual'}`}>
                  <div className="card-top-right">
                    {item.status === 'pending_bot' && <div className="bot-processing-glow">Analizando...</div>}
                    <div className="status-indicator">
                      <span className="status-dot"></span>
                      {item.status === 'completed' ? 'Validado' : item.status === 'pending' ? 'Pendiente' : 'Manual'}
                    </div>
                    <button 
                      className="btn-card-delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      title="Borrar del Nexo"
                    >
                      &times;
                    </button>
                  </div>
                  <span className="category-badge">{item.category}</span>
                  
                  <div className="card-image-container">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2232&auto=format&fit=crop'} 
                      alt={item.name} 
                      className="card-image" 
                    />
                  </div>

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
                    <button className="btn-action" disabled={item.status === 'pending_bot'}>
                      {item.status === 'pending_bot' ? 'Procesando...' : 'Explorar'}
                    </button>
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
