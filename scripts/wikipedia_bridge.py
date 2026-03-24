from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import trafilatura
import json
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

@app.route('/scrape', methods=['GET'])
def scrape():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    print(f"[AthenaBridge] Raspando URL: {url}")
    
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return jsonify({"error": "No se pudo descargar el contenido de la URL"}), 500

        # Extraer metadatos
        metadata = trafilatura.extract_metadata(downloaded)
        # Extraer contenido principal
        content = trafilatura.extract(downloaded, include_comments=False, include_tables=True, no_fallback=False)

        # Determinar título (prioridad metadatos -> trafilatura -> hostname)
        title = "Descubrimiento en la Red"
        if metadata and metadata.title:
            title = metadata.title
        
        description = "Sin descripción detectada."
        if metadata and metadata.description:
            description = metadata.description
        elif content:
            description = " ".join(content.split()[:40]) + "..."

        image = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2232&auto=format&fit=crop"
        if metadata and metadata.image:
             image = metadata.image
        
        # Inferencia de Categoría básica (mejorable en Fase V)
        category = "General"
        url_lower = url.lower()
        if any(kw in url_lower for kw in ['wine', 'vino', 'enology']): category = "Gastronomía"
        elif any(kw in url_lower for kw in ['watch', 'reloj', 'horologe']): category = "Relojería"
        elif any(kw in url_lower for kw in ['car', 'motor', 'porsche', 'ferrari']): category = "Motor"
        elif any(kw in url_lower for kw in ['art', 'museum', 'exhibition']): category = "Arte"
        elif any(kw in url_lower for kw in ['ai', 'intelligence', 'software', 'dev']): category = "Tecnología"

        return jsonify({
            "title": title,
            "description": description,
            "image": image,
            "category": category,
            "subcategory": "Web Scraping",
            "status": "completed" if category != "General" else "pending",
            "metadata": {
                "author": metadata.author if metadata else None,
                "date": metadata.date if metadata else None,
                "hostname": urlparse(url).hostname,
                "scraper": "Trafilatura/Athena"
            }
        })

    except Exception as e:
        print(f"Scraping error: {e}")
        return jsonify({
            "status": "manual",
            "error": str(e),
            "title": urlparse(url).hostname
        }), 200

@app.route('/enrich', methods=['GET'])
def enrich():
    category = request.args.get('category')
    if not category:
        return jsonify({"error": "No category provided"}), 400

    print(f"[WikipediaBridge] Consultando Wikipedia para: {category}")
    
    headers = {
        'User-Agent': 'AnticiteraProject/1.0 (https://anticitera.deft.work; contact@deft.work)'
    }
    
    # Intentar obtener el extracto e info de Wikipedia (en español primero)
    wiki_url = "https://es.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "prop": "extracts|categories",
        "exintro": True,
        "explaintext": True,
        "titles": category,
        "format": "json",
        "cllimit": "max"
    }
    
    try:
        response = requests.get(wiki_url, params=params, headers=headers)
        data = response.json()
        
        pages = data.get("query", {}).get("pages", {})
        page_id = next(iter(pages))
        page = pages[page_id]
        
        if "missing" in page:
            # Reintentar con la primera letra en mayúscula si falló
            params["titles"] = category.capitalize()
            response = requests.get(wiki_url, params=params, headers=headers)
            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            page_id = next(iter(pages))
            page = pages[page_id]

        if "missing" in page:
            # Fallback a inglés si no hay en español
            wiki_url_en = "https://en.wikipedia.org/w/api.php"
            response = requests.get(wiki_url_en, params=params, headers=headers)
            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            page_id = next(iter(pages))
            page = pages[page_id]

        if "missing" in page:
            return jsonify({
                "description": f"Enclave místico sin registro enciclopédico. '{category}' permanece como un misterio por descubrir.",
                "imageKeyword": category,
                "categories": [],
                "source": "None"
            })

        extract = page.get("extract", "")
        # Limitar a unos 40 palabras para el diseño premium
        short_desc = " ".join(extract.split()[:40]) + "..."
        if not short_desc.strip():
             short_desc = f"Referencia técnica para {category}."

        categories = [c.get("title", "").replace("Categoría:", "").replace("Category:", "") for c in page.get("categories", [])]
        
        # Lógica de Inferido Táctico para el Nexo
        suggested_category = "General"
        taxonomy_mapping = {
            "Motor": ["Automóvil", "Coche", "Vehículo", "Motor", "Car", "Engine", "Fórmula 1", "Automotive"],
            "Cine": ["Cine", "Película", "Film", "Director", "Actor", "Productora", "Cinema"],
            "Música": ["Música", "Cantante", "Álbum", "Banda", "Music", "Singer", "Band", "Composer"],
            "Tecnología": ["Informática", "Software", "Hardware", "Internet", "Tecnología", "Technology", "Computing"],
            "Ciencia": ["Ciencia", "Física", "Química", "Biología", "Espacio", "Science", "Physics", "Chemistry"],
            "Arte": ["Arte", "Pintura", "Escultura", "Museo", "Art", "Painting", "Sculpture"],
            "Historia": ["Historia", "Siglo", "Guerra", "Reino", "History", "Century", "Empire"],
            "Geografía": ["Ciudad", "País", "Continente", "Población", "Geography", "City", "Country"],
            "Videojuegos": ["Videojuego", "Consola", "Game", "Nintendo", "PlayStation", "Xbox"],
            "Literatura": ["Libro", "Escritor", "Novela", "Poesía", "Literature", "Book", "Writer", "Novel"]
        }

        # Analizar categorías de Wikipedia para encontrar el match
        found_match = False
        for master, keywords in taxonomy_mapping.items():
            for kw in keywords:
                if any(kw.lower() in wiki_cat.lower() for wiki_cat in categories):
                    suggested_category = master
                    found_match = True
                    break
            if found_match: break

        return jsonify({
            "description": short_desc,
            "imageKeyword": page.get("title", category),
            "categories": categories,
            "suggestedCategory": suggested_category,
            "source": "Wikipedia"
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
