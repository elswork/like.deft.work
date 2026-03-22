/**
 * EnrichmentService.js
 * 
 * Este servicio orquesta la captura de metadatos para el Nexo Love.
 * Sigue la doctrina de "Inteligencia Aumentada" ayudando al humano
 * a completar los campos de excelencia.
 */

import { ATHENA_KNOWLEDGE } from '../data/athena_knowledge';

const EnrichmentService = {
  /**
   * Enriquece una categoría mediante el motor de IA.
   * @param {string} categoryName - Nombre de la categoría a investigar.
   * @returns {Promise<Object>} - Metadatos: { description, imageUrl }
   */
  async enrichCategory(categoryName) {
    console.log(`[EnrichmentService] Consultando Lexicón Wikipedia para: ${categoryName}`);
    
    try {
      const response = await fetch(`http://localhost:5001/enrich?category=${encodeURIComponent(categoryName)}`);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      return {
        description: data.description,
        // Usamos LoremFlickr como alternativa estable para búsqueda por palabra clave
        imageUrl: `https://loremflickr.com/800/600/${encodeURIComponent(data.imageKeyword)}`,
        categories: data.categories,
        timestamp: new Date().toISOString(),
        isRealTime: true,
        source: data.source
      };
    } catch (error) {
      console.error("[EnrichmentService] Error en el Puente Wikipedia:", error);
      return {
        description: `Error de conexión con el Lexicón: ${error.message}. Asegúrate de que el puente esté activo.`,
        imageUrl: "https://placehold.co/600x400/18181b/ffffff?text=Error+Conexion",
        timestamp: new Date().toISOString(),
        isRealTime: false
      };
    }
  },

  /**
   * Enriquece un elemento (palabra o URL).
   * @param {string} input - Palabra clave o URL del descubrimiento.
   * @returns {Promise<Object>} - Metadatos extraídos con estado.
   */
  async enrichElement(input) {
    console.log(`[EnrichmentService] Analizando elemento: ${input}`);
    const isUrl = input.startsWith('http');
    
    if (isUrl) {
      try {
        // En un entorno real, aquí llamaríamos a un servicio de scraping (ej: AthenaBrain)
        // Por ahora simulamos la inferencia con un retraso
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulación de lógica de inferencia
        const urlLower = input.toLowerCase();
        let derivedCategory = "Desconocida";
        let subcategory = "Web";
        
        if (urlLower.includes('wine') || urlLower.includes('vino') || urlLower.includes('vinos')) derivedCategory = "vino";
        else if (urlLower.includes('watch') || urlLower.includes('reloj')) derivedCategory = "relojería";
        else if (urlLower.includes('chef') || urlLower.includes('restaurante') || urlLower.includes('food')) derivedCategory = "gastro";
        else if (urlLower.includes('car') || urlLower.includes('auto') || urlLower.includes('porsche')) derivedCategory = "motor";

        const isKnown = !!ATHENA_KNOWLEDGE[derivedCategory];
        
        return {
          title: `Descubrimiento en ${new URL(input).hostname}`,
          description: isKnown 
            ? ATHENA_KNOWLEDGE[derivedCategory].description.substring(0, 100) + "..."
            : "Contenido analizado. Categoría emergente detectada.",
          category: derivedCategory,
          subcategory: subcategory,
          image: isKnown ? ATHENA_KNOWLEDGE[derivedCategory].imageUrl : "https://placehold.co/600x400?text=Emergent+Discovery",
          status: isKnown ? "completed" : "pending",
          metadata: { url: input, source: "Athena Scraper" }
        };
      } catch (error) {
        console.error("Scraping fail:", error);
        return { status: "manual", error: "No se pudo extraer información automáticamente." };
      }
    }

    return {
      status: "manual",
      title: input,
      category: "General"
    };
  }
};

export default EnrichmentService;
