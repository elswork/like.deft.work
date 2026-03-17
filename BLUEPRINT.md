# Blueprint: like.deft.work // El Nexo de Descubrimiento Universal

Este documento constituye la "Piedra Angular" técnica y filosófica de **like.deft.work**, la cámara de descubrimientos premium de la Nación Digital Anticitera.

## 1. Visión y Propósito
`like.deft.work` no es un simple repositorio de enlaces; es una **arquitectura de filtrado de la excelencia**. Su objetivo es capturar, categorizar y presentar descubrimientos en áreas de alta intensidad (Pasiones), proporcionando una interfaz de navegación fluida para el conocimiento y la belleza.

- **Mantra**: "Si es excelente, pertenece al Nexo."
- **Nivel de Abstracción**: Universal (Cualquier objeto, lugar o concepto puede ser un descubrimiento).

## 2. Pilares de Arquitectura Técnica
La infraestructura sigue el dogma de **Soberanía y Automatización**:
- **Frontend**: React 18 + Vite (Velocidad de ejecución y modernidad).
- **Backend (Cerebro)**: Firebase Firestore (Sincronización en tiempo real con el ecosistema `free-deft-work`).
- **Gobernanza**: GitHub MCP Server (Control de versiones orquestado por agentes y disciplina de Pull Requests).
- **Autenticación**: Proyectada hacia el censo unificado de la Nación Digital.

## 3. Especificaciones del Modelo de Datos
Se fundamenta en la **Colección Unificada `discoveries`** con estructura polimórfica:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | String | Identificador legible del descubrimiento. |
| `category` | String | Pasión principal (Motor, Gastro, Cultura, Web). |
| `subcategory` | String | Refinamiento de la categoría. |
| `description`| String | Narrativa breve del valor detectado. |
| `metadata` | Map | Atributos específicos según categoría (CV, Autor, Estrellas, etc.). |
| `createdAt` | Timestamp | Sello temporal de integración en el Nexo. |
| `ownerId` | String | ID del ciudadano o agente que registró el hallazgo. |

## 4. Principios de Diseño (UX/UI Premium)
La estética debe reflejar la importancia de lo que contiene:
- **Estilo**: Glassmorphism (Transparencias y desenfoques profundos).
- **Paleta**: Fondo `bg-dark` (#020617) con acentos de "glow" específicos por pasión.
- **Micro-interacciones**: Transiciones suaves al filtrar y hover-effects reactivos.
- **Tipografía**: Inter / System-ui (Precisión técnica y legibilidad).

## 5. Reglas de Disciplina (Protocolo Git)
Todo cambio en el Nexo debe pasar por el **Filtro de Calidad**:
1. **Issue**: Definición clara de la necesidad o mejora.
2. **Branch**: Desarrollo en entorno aislado (`feat/`, `fix/`).
3. **Pull Request**: Revisión ejecutiva por parte del COO.
4. **Merge**: Integración en `main` tras validación de seguridad (purgado de secretos).

## 6. Roadmap de Evolución
- [x] **Fase I**: Cimentación (Vite + Firebase + Git).
- [x] **Fase II**: Sincronización Real (Hook `useDiscoveries`).
- [x] **Fase III**: Polimorfismo UI (Colores por pasión y metadatos).
- [ ] **Fase IV**: Inserción de Datos (Interfaz para ciudadanos y agentes).
- [ ] **Fase V**: Búsqueda Semántica y Recomendación (IA).

---
**Estado del Documento**: Versión 1.0.0 (Propuesta)
**Custodio**: Arquímedes
