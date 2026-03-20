import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DiscoveryForm({ categories }) {
  const [discoveryInput, setDiscoveryInput] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isInferring, setIsInferring] = useState(false);

  // Debounced Inference
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (discoveryInput.length > 3 && !discoveryInput.startsWith('http')) {
        setIsInferring(true);
        try {
          const res = await fetch(`http://localhost:5001/enrich?category=${encodeURIComponent(discoveryInput)}`);
          const data = await res.json();
          if (data.suggestedCategory) {
            setSuggestedCategory(data.suggestedCategory);
          }
        } catch (err) {
          console.error("Inference Error:", err);
        } finally {
          setIsInferring(false);
        }
      } else {
        setSuggestedCategory('');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [discoveryInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!discoveryInput) return;

    setIsBotThinking(true);
    const isUrl = discoveryInput.startsWith('http');
    
    try {
      await addDoc(collection(db, "discoveries"), {
        name: isUrl ? "Enriqueciendo..." : discoveryInput,
        category: suggestedCategory || (isUrl ? "Analizando..." : "General"),
        description: isUrl ? `Analizando recurso en ${discoveryInput}...` : "Pendiente de descripción por el Bot.",
        subcategory: "Nuevo",
        metadata: isUrl ? { url: discoveryInput } : {},
        rawInput: discoveryInput,
        status: "pending_bot",
        createdAt: serverTimestamp()
      });

      setDiscoveryInput('');
      setSuggestedCategory('');
      setIsBotThinking(false);
    } catch (err) {
      console.error("Error al insertar:", err);
      setIsBotThinking(false);
    }
  };

  return (
    <form className="discovery-form" onSubmit={handleSubmit}>
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
          {isInferring && <div className="spinner-small"></div>}
        </div>
        
        {suggestedCategory && (
          <div className="suggestion-badge">
            Sugerencia: <span className="category-chip">{suggestedCategory}</span>
          </div>
        )}
      </div>

      <button type="submit" className="btn-submit premium" disabled={isBotThinking || !discoveryInput}>
        {isBotThinking ? "Sincronizando..." : "Consumar Descubrimiento"}
      </button>

      {isBotThinking && (
        <div className="bot-status pulse">El Nexo está asimilando la nueva información...</div>
      )}
    </form>
  );
}
