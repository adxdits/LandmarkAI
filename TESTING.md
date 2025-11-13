# Guide de Test - Monument Recognition App

## 🧪 Test Rapide

### 1. Vérifier que le backend fonctionne

Ouvrez PowerShell et testez l'endpoint de santé :

```powershell
curl http://localhost:8080/api/image/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "model": "CLIP ViT-B/32",
  "monuments": 30,
  "ready": true
}
```

### 2. Tester la reconnaissance avec une image

#### Option A : Avec PowerShell (Windows)

```powershell
# Remplacez "chemin\vers\photo.jpg" par le chemin de votre image
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/image/recognize" `
    -Method Post `
    -Form @{file = Get-Item "chemin\vers\photo.jpg"}

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

#### Option B : Avec curl (si installé)

```powershell
curl -X POST http://localhost:8080/api/image/recognize -F "file=@chemin/vers/photo.jpg"
```

### Exemple de réponse :

```json
{
  "monument": "Tour Eiffel",
  "city": "Paris",
  "country": "France",
  "confidence": 0.92,
  "top5": [
    {
      "monument": "Tour Eiffel",
      "city": "Paris",
      "country": "France",
      "confidence": 0.92
    },
    {
      "monument": "Arc de Triomphe",
      "city": "Paris",
      "country": "France",
      "confidence": 0.04
    },
    ...
  ]
}
```

## 🖥️ Test via l'Interface Web

### Démarrage complet :

1. **Terminal 1** - Backend :
```powershell
.\start-backend.ps1
```

2. **Terminal 2** - Frontend :
```powershell
.\start-frontend.ps1
```

3. Ouvrez votre navigateur sur **http://localhost:5173**

### Fonctionnalités à tester :

#### 📁 Upload d'image :
- Cliquez sur la zone de téléchargement
- Sélectionnez une photo d'un monument
- L'image sera automatiquement analysée
- Les résultats s'affichent avec le monument, sa localisation et la confiance

#### 📷 Capture webcam :
- Cliquez sur "Prendre une photo"
- Autorisez l'accès à la caméra
- Prenez une photo d'un monument (écran, livre, photo imprimée)
- Cliquez sur "Capturer"
- L'analyse démarre automatiquement

## 🔍 Swagger UI

Le backend expose une documentation interactive Swagger :

**URL:** http://localhost:8080/swagger-ui

Vous pouvez y tester directement l'API depuis votre navigateur.

## 🐛 Résolution de problèmes

### Erreur : "Backend non disponible"
- Vérifiez que le backend tourne sur le port 8080
- Testez : `curl http://localhost:8080/api/image/health`

### Erreur : "Modèles CLIP non trouvés"
- Téléchargez les modèles ONNX (voir README.md)
- Vérifiez qu'ils sont dans `backend/src/main/resources/`

### Erreur : "Unable to access camera"
- Autorisez l'accès à la caméra dans votre navigateur
- Sur Chrome : cliquez sur l'icône 🔒 à gauche de l'URL
- Vérifiez que votre webcam fonctionne

### Port déjà utilisé
Backend (8080) :
```powershell
# Trouver le processus
netstat -ano | findstr :8080
# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

Frontend (5173) :
```powershell
# Trouver le processus
netstat -ano | findstr :5173
# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

## 📊 Monuments supportés

L'application reconnaît actuellement 30 monuments célèbres :
- **France :** Tour Eiffel, Arc de Triomphe, Notre-Dame, Louvre, Versailles, Mont Saint-Michel, etc.
- **Italie :** Colisée, Tour de Pise
- **UK :** Big Ben, Tower Bridge, Buckingham Palace
- **USA :** Statue de la Liberté, Empire State Building, Golden Gate Bridge
- **Autres :** Taj Mahal, Grande Muraille, Opéra de Sydney, Christ Rédempteur, Machu Picchu, Pyramides de Gizeh, etc.

## 🎯 Conseils pour de meilleurs résultats

1. **Utilisez des images claires** avec le monument bien visible
2. **Évitez les photos trop sombres** ou floues
3. **Le monument doit être le sujet principal** de la photo
4. **Photos de face** fonctionnent mieux que les angles obliques
5. **Formats supportés :** JPG, PNG, GIF
