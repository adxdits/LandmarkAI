# 🔗 Connexion Frontend-Backend - Résumé des modifications

## ✅ Modifications effectuées

### 1. Frontend - Hook `useImageUpload.ts`

**Fichier modifié :** `frontend/src/hooks/useImageUpload.ts`

#### Changements principaux :

1. **Ajout de la constante API_URL**
   ```typescript
   const API_URL = 'http://localhost:8080/api/image'
   ```

2. **Remplacement de `simulateAnalysis()` par `analyzeImage()`**
   - Fonction asynchrone qui fait un vrai appel HTTP au backend
   - Envoie l'image via FormData
   - Gère les erreurs de connexion
   - Parse la réponse JSON du backend

3. **Transformation des résultats**
   - Convertit la réponse du backend en format `FlightResult`
   - Affiche : Monument, Ville, Pays et niveau de confiance
   - Gère le cas "Monument non reconnu"
   - Affiche les erreurs de connexion

4. **Intégration dans les handlers existants**
   - `handleFileUpload()` appelle `analyzeImage(file)`
   - `handleTakeSnapshot()` appelle `analyzeImage(file)`

### 2. Backend - Service `ClipMonumentService.java`

**Fichier modifié :** `backend/src/main/java/com/myapp/services/ClipMonumentService.java`

#### Changements principaux :

1. **Méthode `parseMonumentInfo()`**
   - Parse le format "Monument, Ville" du fichier JSON
   - Extrait le nom du monument et la ville
   - Ajoute le pays via mapping

2. **Méthode `getCityCountry()`**
   - Map les villes vers leurs pays respectifs
   - 22 villes couvertes (Paris → France, Rome → Italie, etc.)

3. **Enrichissement de la réponse API**
   - Ajout des champs : `monument`, `city`, `country`
   - Structure identique pour le top 5
   - Facilite l'affichage côté frontend

### 3. Documentation

**Nouveaux fichiers créés :**

1. **`QUICKSTART.md`**
   - Guide de démarrage rapide
   - 3 étapes simples
   - Troubleshooting commun

2. **`ARCHITECTURE.md`**
   - Architecture complète de l'application
   - Diagrammes de flux
   - Documentation des composants

3. **`TESTING.md`**
   - Guide de test détaillé
   - Tests API avec curl/PowerShell
   - Tests via l'interface web
   - Swagger UI

4. **Scripts PowerShell :**
   - `start-backend.ps1` - Démarrage automatique du backend
   - `start-frontend.ps1` - Démarrage automatique du frontend

5. **`README.md` mis à jour**
   - Instructions de démarrage améliorées
   - Section "Utilisation" ajoutée

## 🔄 Flux de données complet

```
Utilisateur
    │
    ├─ Upload photo
    │  ou
    └─ Capture webcam
         │
         ▼
    useImageUpload.ts
    analyzeImage(file)
         │
         ▼
    FormData + Fetch POST
    → http://localhost:8080/api/image/recognize
         │
         ▼
    ImageRecognitionResource.java
    recognizeImage(@RestForm file)
         │
         ▼
    ClipMonumentService.java
    recognizeMonument(imageBytes)
         │
         ├─ Prétraitement image
         ├─ ONNX Vision Model
         ├─ Comparaison embeddings
         ├─ Calcul similarités
         └─ Parse info (monument, ville, pays)
         │
         ▼
    Response JSON
    {
      "monument": "Tour Eiffel",
      "city": "Paris",
      "country": "France",
      "confidence": 0.92
    }
         │
         ▼
    Frontend - Affichage
    FlightResults component
```

## 📊 Format de communication

### Request (Frontend → Backend)

```
POST http://localhost:8080/api/image/recognize
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

[binary image data]
--boundary--
```

### Response (Backend → Frontend)

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
    ...
  ]
}
```

## 🎯 Fonctionnalités activées

### ✅ Upload de photo
- ✅ Sélection de fichier
- ✅ Drag & drop (déjà supporté par le composant)
- ✅ Preview immédiat
- ✅ Envoi automatique au backend
- ✅ Affichage des résultats

### ✅ Capture webcam
- ✅ Ouverture de la caméra
- ✅ Preview vidéo en direct
- ✅ Capture snapshot
- ✅ Conversion en File
- ✅ Envoi automatique au backend
- ✅ Affichage des résultats

### ✅ Gestion d'erreurs
- ✅ Erreur de connexion backend
- ✅ Erreur de permission caméra
- ✅ Monument non reconnu
- ✅ Format image non supporté
- ✅ Messages d'erreur clairs

## 🚀 Pour démarrer

### Terminal 1 - Backend
```powershell
cd c:\Users\adama\Desktop\al_mounayar-hamani
.\start-backend.ps1
```

### Terminal 2 - Frontend
```powershell
cd c:\Users\adama\Desktop\al_mounayar-hamani
.\start-frontend.ps1
```

### Navigateur
```
http://localhost:5173
```

## 🧪 Tests de validation

### 1. Vérifier le backend
```powershell
curl http://localhost:8080/api/image/health
```

### 2. Tester la reconnaissance
```powershell
curl -X POST http://localhost:8080/api/image/recognize -F "file=@photo.jpg"
```

### 3. Tester l'interface
1. Ouvrir http://localhost:5173
2. Importer une photo de monument
3. Vérifier que les résultats s'affichent correctement

### 4. Tester la caméra
1. Cliquer sur "Prendre une photo"
2. Autoriser la caméra
3. Capturer une image
4. Vérifier l'analyse automatique

## 📝 Points importants

### Configuration CORS
Le backend autorise déjà les requêtes depuis le frontend :
```properties
quarkus.http.cors.origins=http://localhost:5173
```

### Type de l'image
Le frontend envoie le File original (pas de conversion base64).

### États de l'UI
- `isAnalyzing` = true pendant l'appel API
- Affichage du loader pendant l'analyse
- Résultats affichés dans `FlightResults` (réutilisé)

### Gestion mémoire
Les URLs créées avec `URL.createObjectURL()` sont nettoyées dans `handleClearImage()`.

## 🎨 Personnalisation possible

Si vous voulez changer l'affichage des résultats, modifiez :
- `frontend/src/hooks/useImageUpload.ts` (ligne ~37-49) - Transformation des données
- `frontend/src/components/FlightResults.tsx` - Composant d'affichage

Si vous voulez ajouter plus de monuments, modifiez :
- `backend/src/main/resources/monuments_tokens.json` - Liste des monuments

## ✨ Résultat final

L'application est maintenant **entièrement fonctionnelle** avec :
- ✅ Frontend React + TypeScript connecté
- ✅ Backend Quarkus + Java avec AI CLIP
- ✅ Upload de photos
- ✅ Capture webcam
- ✅ Reconnaissance en temps réel
- ✅ Affichage des résultats avec confiance
- ✅ Gestion d'erreurs complète
- ✅ Documentation complète
