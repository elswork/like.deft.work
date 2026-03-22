import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import EnrichmentService from '../services/EnrichmentService';

export default function DiscoveryForm({ categories }) {
  const [discoveryInput, setDiscoveryInput] = useState('');
  const [state, setState] = useState('idle'); // idle, scraping, preview, manual
  const [enrichedData, setEnrichedData] = useState(null);
  const [manualData, setManualData] = useState({
    title: '',
    category: '',
    subcategory: 'Nuevo',
    description: ''
  });

  const handleStartScraping = async (e) => {
    e.preventDefault();
    if (!discoveryInput) return;

    if (!discoveryInput.startsWith('http')) {
      // Si no es URL, vamos directo a manual con el input como título
      setManualData({ ...manualData, title: discoveryInput, category: 'General' });
      setState('manual');
      return;
    }

    setState('scraping');
    const result = await EnrichmentService.enrichElement(discoveryInput);

    if (result.status === 'manual') {
      setManualData({
        title: result.title || '',
        category: result.category || '',
        subcategory: 'Nuevo',
        description: ''
      });
      setState('manual');
    } else {
      setEnrichedData(result);
      setState('preview');
    }
  };

  const handleConsumar = async (finalData) => {
    try {
      setState('saving');
      await addDoc(collection(db, "discoveries"), {
        ...finalData,
        createdAt: serverTimestamp()
      });
      // Reset total
      setDiscoveryInput('');
      setEnrichedData(null);
      setManualData({ title: '', category: '', subcategory: 'Nuevo', description: '' });
      setState('idle');
    } catch (err) {
      console.error("Error al persistir:", err);
      setState('manual'); // Volver a manual si hay error
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'scraping':
        return (
          <div className="bot-status pulse">
            Athena está asimilando el recurso...
          </div>
        );

      case 'preview':
        return (
          <div className="discovery-preview">
            <div className="preview-grid">
              <img src={enrichedData.image} alt="Preview" className="preview-image" />
              <div className="preview-content">
                <span className={`category-chip ${enrichedData.status}`}>
                   {enrichedData.status === 'completed' ? '✓ CATEGORÍA CONOCIDA' : '◷ CATEGORÍA EMERGENTE'}
                </span>
                <h4>{enrichedData.title}</h4>
                <p>{enrichedData.description}</p>
                <div className="preview-actions">
                  <button className="btn-submit premium" onClick={() => handleConsumar({
                    name: enrichedData.title,
                    category: enrichedData.category,
                    subcategory: enrichedData.subcategory,
                    description: enrichedData.description,
                    status: enrichedData.status,
                    metadata: enrichedData.metadata,
                    image: enrichedData.image
                  })}>
                    Consumar para el Nexo
                  </button>
                  <button className="btn-secondary" onClick={() => {
                    setManualData({
                      title: enrichedData.title,
                      category: enrichedData.category,
                      subcategory: enrichedData.subcategory,
                      description: enrichedData.description
                    });
                    setState('manual');
                  }}>
                    Editar Manualmente
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'manual':
        return (
          <div className="manual-form-container">
            <div className="manual-fields">
              <div className="input-group">
                <label>Título del Hallazgo</label>
                <input 
                  className="smart-input" 
                  value={manualData.title} 
                  onChange={e => setManualData({...manualData, title: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Categoría / Pasión</label>
                <input 
                  className="smart-input" 
                  value={manualData.category}
                  placeholder="ej: Motor, Vino, IA..."
                  onChange={e => setManualData({...manualData, category: e.target.value})}
                />
              </div>
            </div>
            <div className="input-group" style={{marginTop: '1rem'}}>
              <label>Descripción de Excelencia</label>
              <textarea 
                className="smart-input" 
                rows="3"
                value={manualData.description}
                onChange={e => setManualData({...manualData, description: e.target.value})}
              />
            </div>
            <div className="preview-actions">
              <button className="btn-submit premium" onClick={() => handleConsumar({
                name: manualData.title,
                category: manualData.category,
                subcategory: manualData.subcategory,
                description: manualData.description,
                status: 'manual',
                metadata: { url: discoveryInput, inputMode: 'manual' },
                image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop' // Placeholder premium dark
              })}>
                Consumar Hallazgo
              </button>
              <button className="btn-secondary" onClick={() => setState('idle')}>Cancelar</button>
            </div>
          </div>
        );

      default: // idle
        return (
          <form className="discovery-form" onSubmit={handleStartScraping}>
            <div className="input-group full-width">
              <label>Integrar en el Nexo (Nombre o URL)</label>
              <div className="smart-input-container">
                <input 
                  type="text" 
                  className="smart-input unified"
                  placeholder="Pega una URL o escribe algo (ej: Porsche 911)..."
                  value={discoveryInput}
                  onChange={(e) => setDiscoveryInput(e.target.value)}
                />
                {state === 'scraping' && <div className="spinner-small"></div>}
              </div>
            </div>

            <button type="submit" className="btn-submit premium" disabled={!discoveryInput}>
              Iniciar Análisis
            </button>
          </form>
        );
    }
  };

  return <div className="discovery-form-wrapper">{renderContent()}</div>;
}
