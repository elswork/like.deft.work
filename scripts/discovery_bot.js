
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHNIdehFKV9GnHZoDJtvy_zpN0QjKOQQU",
  authDomain: "free-deft-work.firebaseapp.com",
  projectId: "free-deft-work",
  storageBucket: "free-deft-work.firebasestorage.app",
  messagingSenderId: "951143682652",
  appId: "1:951143682652:web:62625c64f20b69351f8c99"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🤖 Anticitera Discovery Bot: ACTIVADO");

const q = query(collection(db, "discoveries"), where("status", "==", "pending_bot"));

onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === "added") {
      const data = change.doc.data();
      const docRef = doc(db, "discoveries", change.doc.id);
      
      console.log(`🔍 Procesando: ${data.category} -> ${data.rawInput}`);

      // Simulación de Enriquecimiento Inteligente
      // Nota: En una fase real, aquí llamaríamos a una API de IA o Scraping
      let update = {
        status: "active",
        subcategory: "Enriquecido por Bot"
      };

      if (data.rawInput.startsWith('http')) {
        // Lógica de Scraping Simulada (para el MVP)
        update.name = `Recurso: ${new URL(data.rawInput).hostname}`;
        update.description = `Descubrimiento extraído de ${data.rawInput}. Incluye arquitectura y diseño premium.`;
        update.metadata = { ...data.metadata, bot_score: 0.95, source: "Web Scraper" };
      } else {
        update.name = data.rawInput;
        update.description = `El Bot ha validado ${data.rawInput} como una adición valiosa a la pasión de ${data.category}.`;
        update.metadata = { bot_score: 0.88, source: "Semantic Analysis" };
      }

      await updateDoc(docRef, update);
      console.log(`✅ Completado: ${data.rawInput}`);
    }
  });
});
