# Architecture - Monument Recognition App

## 📐 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                   (React + TypeScript + Vite)                │
│                      Port: 5173                              │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │   Components     │      │      Hooks       │            │
│  │  - UploadArea    │◄─────┤  useImageUpload  │            │
│  │  - CameraDialog  │      │                  │            │
│  │  - ImagePreview  │      └────────┬─────────┘            │
│  │  - FlightResults │               │                      │
│  └──────────────────┘               │                      │
│                                     │                      │
│                                     ▼                      │
│                              ┌──────────────┐              │
│                              │  Fetch API   │              │
│                              │  POST /api/  │              │
│                              │  image/      │              │
│                              │  recognize   │              │
│                              └──────┬───────┘              │
└─────────────────────────────────────┼───────────────────────┘
                                      │
                                      │ HTTP Request
                                      │ (FormData)
                                      │
┌─────────────────────────────────────▼───────────────────────┐
│                         BACKEND                              │
│                     (Quarkus + Java 21)                      │
│                      Port: 8080                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          ImageRecognitionResource.java               │  │
│  │              (REST Controller)                       │  │
│  │                                                      │  │
│  │  POST /api/image/recognize                          │  │
│  │  GET  /api/image/health                             │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                    │
│                       ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          ClipMonumentService.java                    │  │
│  │         (Business Logic + AI)                        │  │
│  │                                                      │  │
│  │  1. Prétraitement image (resize, normalize)         │  │
│  │  2. Génération embedding vision (ONNX)               │  │
│  │  3. Comparaison avec embeddings texte                │  │
│  │  4. Calcul similarités (dot product)                 │  │
│  │  5. Softmax + Top-K                                  │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                    │
│                       ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ONNX Runtime                            │  │
│  │                                                      │  │
│  │  ┌──────────────────┐    ┌──────────────────┐      │  │
│  │  │ clip_vision.onnx │    │ clip_text.onnx   │      │  │
│  │  │  (85 MB)         │    │  (62 MB)         │      │  │
│  │  │  ViT-B/32        │    │  Text Encoder    │      │  │
│  │  └──────────────────┘    └──────────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                    │
│                       ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         monuments_tokens.json                        │  │
│  │                                                      │  │
│  │  Tokens pré-calculés pour 30 monuments              │  │
│  │  Embeddings en cache (démarrage)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de données complet

### 1. Upload d'image (Frontend)

```typescript
// useImageUpload.ts
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file) {
    const url = URL.createObjectURL(file)
    setUploadedImage({ url, file })
    analyzeImage(file)  // ← Appel API
  }
}
```

### 2. Analyse de l'image (Frontend → Backend)

```typescript
const analyzeImage = async (file: File) => {
  setIsAnalyzing(true)
  
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('http://localhost:8080/api/image/recognize', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  // Transformation et affichage des résultats
}
```

### 3. Réception et traitement (Backend)

```java
@POST
@Path("/recognize")
@Consumes(MediaType.MULTIPART_FORM_DATA)
public Response recognizeImage(@RestForm("file") FileUpload file) {
    byte[] imageBytes = Files.readAllBytes(file.uploadedFile());
    Map<String, Object> result = clipService.recognizeMonument(imageBytes);
    return Response.ok(result).build();
}
```

### 4. Reconnaissance par CLIP (Backend)

```java
public Map<String, Object> recognizeMonument(byte[] imageBytes) {
    // 1. Charger et redimensionner l'image (224x224)
    BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
    
    // 2. Prétraitement (normalisation RGB)
    float[][][][] inputData = preprocessImage(image);
    
    // 3. Générer embedding vision via ONNX
    float[] imageEmbedding = visionSession.run(inputData);
    
    // 4. Comparer avec embeddings texte pré-calculés
    float[] similarities = new float[monuments.length];
    for (int i = 0; i < monuments.length; i++) {
        similarities[i] = dotProduct(imageEmbedding, textEmbeddings[i]);
    }
    
    // 5. Softmax + sélection meilleur résultat
    softmax(similarities);
    int bestIdx = argmax(similarities);
    
    // 6. Construire réponse JSON
    return Map.of(
        "monument", monuments[bestIdx],
        "city", ...,
        "country", ...,
        "confidence", similarities[bestIdx]
    );
}
```

### 5. Affichage des résultats (Frontend)

```typescript
if (data.monument) {
  const result: FlightResult = {
    id: 1,
    destination: `${data.monument}, ${data.city}, ${data.country}`,
    price: `Confidence: ${(data.confidence * 100).toFixed(1)}%`,
    duration: data.description || 'Monument historique'
  }
  setFlightResults([result])
}
```

## 🎨 Composants Frontend

### `App.tsx`
Point d'entrée principal qui orchestre tous les composants.

### `useImageUpload.ts`
Hook personnalisé qui gère :
- État de l'image uploadée
- État d'analyse
- Communication avec le backend
- Gestion de la caméra

### `UploadArea.tsx`
Zone de glisser-déposer et bouton d'upload.

### `CameraDialog.tsx`
Modal pour capturer une photo via webcam.

### `ImagePreview.tsx`
Affichage de l'image sélectionnée.

### `FlightResults.tsx`
Affichage des résultats de reconnaissance (réutilisé pour les monuments).

## 🛠️ Composants Backend

### `ImageRecognitionResource.java`
Contrôleur REST qui expose les endpoints :
- `POST /api/image/recognize` - Reconnaissance d'image
- `GET /api/image/health` - Status de l'API

### `ClipMonumentService.java`
Service principal contenant :
- Chargement des modèles ONNX
- Prétraitement des images
- Génération d'embeddings
- Calcul de similarité
- Parsing des informations (monument, ville, pays)

### `MonumentMappingService.java`
Service auxiliaire pour enrichir les données (pas utilisé actuellement).

## 🔐 Configuration CORS

Le backend autorise les requêtes depuis le frontend :

```properties
# application.properties
quarkus.http.cors.origins=http://localhost:5173,http://localhost:3000
quarkus.http.cors.methods=GET,POST,PUT,DELETE,OPTIONS
quarkus.http.cors.headers=accept,authorization,content-type,x-requested-with
```

## 📊 Format de réponse API

### Success Response

```json
{
  "monument": "Tour Eiffel",
  "city": "Paris",
  "country": "France",
  "confidence": 0.9234567,
  "top5": [
    {
      "monument": "Tour Eiffel",
      "city": "Paris",
      "country": "France",
      "confidence": 0.9234567
    },
    {
      "monument": "Arc de Triomphe",
      "city": "Paris",
      "country": "France",
      "confidence": 0.0432123
    },
    // ... 3 autres résultats
  ]
}
```

### Error Response

```json
{
  "error": "Erreur lors de la reconnaissance",
  "message": "Format d'image non supporté"
}
```

## 🚀 Optimisations

### Backend
1. **Embeddings pré-calculés** - Les embeddings texte sont calculés au démarrage et mis en cache
2. **ONNX Runtime** - Inférence optimisée sans GPU nécessaire
3. **Modèles quantifiés** - Modèle texte quantifié pour réduire la taille

### Frontend
1. **Preview local** - `URL.createObjectURL()` pour affichage instantané
2. **FormData** - Upload efficace sans encodage base64
3. **États séparés** - Gestion claire des états d'UI

## 📦 Dépendances principales

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Material-UI** - Composants UI
- **Vite** - Build tool rapide

### Backend
- **Quarkus 3.x** - Framework Java moderne
- **ONNX Runtime** - Inférence des modèles AI
- **Jakarta RESTEasy** - API REST
- **Jackson** - Sérialisation JSON

## 🔄 Capture webcam

```typescript
// camera.ts
const startCamera = async (width: number, height: number) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width, height }
  })
  video.srcObject = stream
  await video.play()
}

const takeSnapshot = (): string => {
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  context.drawImage(video, 0, 0)
  return canvas.toDataURL('image/png')
}
```

La snapshot est convertie en File et envoyée au backend exactement comme un upload classique.
