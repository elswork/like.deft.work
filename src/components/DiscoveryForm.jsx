import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DiscoveryForm({ categories }) {
  const [categoryInput, setCategoryInput] = useState('');
  const [discoveryInput, setDiscoveryInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);

  const filteredCategories = categories.filter(c => 
    c.toLowerCase().includes(categoryInput.toLowerCase()) && c !== 'All'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryInput || !discoveryInput) return;

    setIsBotThinking(true);
    
    // Simulación de "Bot Intelligence" para el MVP
    // En una fase real, esto dispararía una Cloud Function o un Agente
    const isUrl = discoveryInput.startsWith('http');
    
    try {
      await addDoc(collection(db, "discoveries"), {
        name: isUrl ? "Enriqueciendo..." : discoveryInput,
        category: categoryInput,
        description: isUrl ? `Analizando recurso en ${discoveryInput}...` : "Pendiente de descripción por el Bot.",
        subcategory: "Nuevo",
        metadata: isUrl ? { url: discoveryInput } : {},
        rawInput: discoveryInput,
        status: "pending_bot",
        createdAt: serverTimestamp()
      });

      setCategoryInput('');
      setDiscoveryInput('');
      setIsBotThinking(false);
    } catch (err) {
      console.error("Error al insertar:", err);
      setIsBotThinking(false);
    }
  };

  return (
    <form className="discovery-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>1. Pasión / Categoría</label>
        <input 
          type="text" 
          className="smart-input"
          placeholder="Escribe una categoría (ej: Motor, Cine...)"
          value={categoryInput}
          onChange={(e) => {
            setCategoryInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && categoryInput && (
          <div className="autocomplete-list">
            {filteredCategories.map(cat => (
              <div 
                key={cat} 
                className="suggestion-item"
                onClick={() => {
                  setCategoryInput(cat);
                  setShowSuggestions(false);
                }}
              >
                {cat}
              </div>
            ))}
            {!categories.includes(categoryInput) && (
              <div className="suggestion-item" onClick={() => setShowSuggestions(false)}>
                Crear: <strong>{categoryInput}</strong> <span className="new-category-tag">NUEVA</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="input-group">
        <label>2. El Descubrimiento (Nombre o URL)</label>
        <input 
          type="text" 
          className="smart-input"
          placeholder="Pega una URL o escribe un nombre..."
          value={discoveryInput}
          onChange={(e) => setDiscoveryInput(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-submit" disabled={isBotThinking}>
        {isBotThinking ? "Solicitando intervención al Bot..." : "Integrar en el Nexo"}
      </button>

      {isBotThinking && (
        <div className="bot-status">El Bot está escaneando la red en busca de detalles...</div>
      )}
    </form>
  );
}
