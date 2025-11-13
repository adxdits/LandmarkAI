# Monument Recognition App

Application de reconnaissance de monuments utilisant CLIP et ONNX Runtime (100% local, pas d'API externe).

## 🚀 Installation

### Prérequis
- Java 21+
- Node.js 18+
- Maven

### Setup des modèles ONNX

⚠️ Les modèles CLIP ne sont pas inclus dans Git (trop volumineux). Téléchargez-les :

```bash
cd backend/src/main/resources

# Vision model (85 MB)
curl -L -o clip_vision.onnx "https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/main/onnx/vision_model.onnx"

# Text model (62 MB)
curl -L -o clip_text.onnx "https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/main/onnx/text_model_quantized.onnx"
```

## 📦 Lancer l'application

### 1. Backend (Quarkus)

Ouvrez un terminal PowerShell et exécutez :

```powershell
cd backend
.\mvnw.cmd quarkus:dev
```

✅ API disponible sur `http://localhost:8080`
✅ Swagger UI : `http://localhost:8080/swagger-ui`

### 2. Frontend (React + Vite)

Ouvrez un **nouveau** terminal PowerShell et exécutez :

```powershell
cd frontend
npm install
npm run dev
```

✅ Interface disponible sur `http://localhost:5173`

## 🎯 Utilisation

1. Ouvrez votre navigateur sur `http://localhost:5173`
2. Deux options pour ajouter une image :
   - **📁 Importer** : Cliquez sur la zone de téléchargement pour sélectionner une photo
   - **📷 Caméra** : Cliquez sur le bouton "Prendre une photo" pour utiliser votre webcam
3. L'image sera automatiquement envoyée au backend pour reconnaissance
4. Les résultats s'affichent avec le nom du monument, sa localisation et le niveau de confiance

## 🧪 Test de l'API

```bash
curl -X POST http://localhost:8080/api/image/recognize -F "file=@monument.jpg"
```

Réponse :
```json
{
  "monument": "Tour Eiffel",
  "confidence": 0.95,
  "top5": [
    {"monument": "Tour Eiffel", "confidence": 0.95},
    {"monument": "Arc de Triomphe", "confidence": 0.75}
  ]
}
```

## 🏛️ Monuments reconnus

30 monuments : Tour Eiffel, Arc de Triomphe, Taj Mahal, Colisée, Statue de la Liberté, Big Ben, Pyramides de Gizeh, Notre-Dame de Paris, Sagrada Familia, Christ Rédempteur, Machu Picchu, Grande Muraille de Chine, Opéra de Sydney, Mont Saint-Michel, Neuschwanstein, Golden Gate Bridge, Empire State Building, Tower Bridge, Louvre, Sacré-Cœur, Versailles, Château de Chambord, Pont du Gard, Carcassonne, Tour de Pise, Palais de Buckingham, Petra, Acropole, Alhambra, Champs-Élysées.

## 🔗 Architecture

```
Frontend (React + Vite)          Backend (Quarkus + Java)
Port: 5173                       Port: 8080
    │                                 │
    │   POST /api/image/recognize     │
    ├──────────────────────────────────►
    │   FormData (image file)         │
    │                                 │
    │                            CLIP ONNX
    │                          (reconnaissance)
    │                                 │
    │   ◄──────────────────────────────┤
    │   JSON Response                 │
    │   {monument, city, country,     │
    │    confidence}                  │
    │                                 │
```

Le frontend envoie automatiquement l'image au backend (que ce soit via upload ou caméra) et affiche les résultats de reconnaissance.

## 📚 Documentation complète

- **[QUICKSTART.md](QUICKSTART.md)** - Démarrage rapide en 3 étapes
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture détaillée et flux de données
- **[TESTING.md](TESTING.md)** - Guide de test complet
- **[CHANGES.md](CHANGES.md)** - Résumé des modifications pour la connexion frontend-backend

## 🚀 Scripts de démarrage

Pour simplifier le lancement :

```powershell
# Démarrer le backend
.\start-backend.ps1

# Démarrer le frontend (dans un nouveau terminal)
.\start-frontend.ps1
```
