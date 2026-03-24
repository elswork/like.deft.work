import React, { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import './index.css'
import DiscoveryForm from './components/DiscoveryForm'
import { AuthProvider, useAuth } from './context/AuthContext'

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

function LoveApp() {
  const { data: discoveries, loading } = useDiscoveries();
  const { user, loginWithGoogle, logout } = useAuth();
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(discoveries.map(item => item.category))];
  
  // Sorting: Relevance first, then Date
  const filteredDiscoveries = (filter === 'All' 
    ? discoveries 
    : discoveries.filter(d => d.category === filter))
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

  const getRelevanceClass = (score) => {
    if (score >= 90) return 'ultra-relevance';
    if (score >= 70) return 'high-relevance';
    return 'normal-relevance';
  };

  const handleDelete = async (id) => {
    if (!user) {
      alert("Solo los ciudadanos autenticados pueden realizar purgas en el Nexo.");
      return;
    }
    
    if (window.confirm('¿Confirmas la purga de este elemento del Nexo?')) {
      try {
        await deleteDoc(doc(db, "discoveries", id));
        console.log("[Nexo] Purga completada en Firestore");
      } catch (error) {
        console.error("[Firestore] Error crítico al borrar:", error);
        alert("Error de comunicación con el Nexo: " + error.message);
      }
    }
  };

  return (
    <div className={`app-container vault-${filter.toLowerCase()}`}>
      <header>
        <div className="header-top">
          <div className="brand">
            <h1>love.deft.work</h1>
            <p className="subtitle">Cámara de Descubrimientos Premium</p>
          </div>
          <div className="auth-section">
            {user ? (
              <div className="user-profile">
                <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                <div className="user-info">
                  <span className="user-name">{user.displayName}</span>
                  <span className="user-rank">{user.rank || 'Ciudadano'}</span>
                </div>
                <button onClick={logout} className="btn-auth-logout">Salir</button>
              </div>
            ) : (
              <button onClick={loginWithGoogle} className="btn-auth-login">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Acceder al Nexo
              </button>
            )}
          </div>
        </div>
      </header>

      {user ? (
        <DiscoveryForm categories={categories} />
      ) : (
        <div className="auth-placeholder">
          <p>Debes identificarte como ciudadano para aportar nuevos descubrimientos al Nexo.</p>
        </div>
      )}

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
          <div style={{textAlign: 'center', padding: '4rem', color: 'var(--primary)'}}>Sincronizando con el Nexo...</div>
        ) : (
          <div className="discovery-grid">
            {filteredDiscoveries.map(item => {
              const catClass = item.category?.toLowerCase() || 'default';
              return (
                <div key={item.id} className={`card ${catClass} ${item.status || 'manual'} ${getRelevanceClass(item.relevance_score)}`}>
                  <div className="card-top-right">
                    {item.status === 'pending_bot' && <div className="bot-processing-glow">Analizando...</div>}
                    <div className="status-indicator">
                      <span className="status-dot"></span>
                      {item.status === 'completed' ? 'Validado' : item.status === 'pending' ? 'Pendiente' : 'Manual'}
                    </div>
                    {user && (
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
                    )}
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

function App() {
  return (
    <AuthProvider>
      <LoveApp />
    </AuthProvider>
  );
}

export default App
