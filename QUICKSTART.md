# 🚀 Quick Start Guide

## Démarrage en 3 étapes

### Étape 1 : Vérifier les modèles ONNX

Les modèles CLIP doivent être présents dans `backend/src/main/resources/` :
- ✅ `clip_vision.onnx` (85 MB)
- ✅ `clip_text.onnx` (62 MB)

Si manquants, voir les instructions dans le fichier `README.md` principal.

### Étape 2 : Démarrer le backend

**Option A - Script PowerShell (Recommandé):**
```powershell
.\start-backend.ps1
```

**Option B - Manuel:**
```powershell
cd backend
.\mvnw.cmd quarkus:dev
```

Attendez le message : `✓ CLIP chargé - 30 monuments`

Le backend est prêt quand vous voyez :
```
Listening on: http://localhost:8080
```

### Étape 3 : Démarrer le frontend

**Dans un NOUVEAU terminal PowerShell :**

**Option A - Script PowerShell (Recommandé):**
```powershell
.\start-frontend.ps1
```

**Option B - Manuel:**
```powershell
cd frontend
npm install  # Première fois seulement
npm run dev
```

Le frontend est prêt quand vous voyez :
```
  ➜  Local:   http://localhost:5173/
```

### Étape 4 : Tester l'application

1. Ouvrez votre navigateur sur **http://localhost:5173**
2. Importez une photo de monument OU prenez une photo avec la caméra
3. Attendez 2-3 secondes
4. Les résultats s'affichent ! 🎉

## 🎯 Test rapide avec curl

Vérifiez que le backend fonctionne :

```powershell
curl http://localhost:8080/api/image/health
```

Réponse attendue :
```json
{"status":"OK","model":"CLIP ViT-B/32","monuments":30,"ready":true}
```

## 📱 Utilisation

### 📁 Import de photo
1. Cliquez sur la zone "Drag & drop your image here"
2. OU cliquez pour ouvrir le sélecteur de fichiers
3. Choisissez une photo de monument
4. L'analyse démarre automatiquement

### 📷 Capture caméra
1. Cliquez sur "Prendre une photo"
2. Autorisez l'accès à la caméra (demandé par le navigateur)
3. Positionnez une image de monument devant la caméra
4. Cliquez sur "Capturer"
5. L'analyse démarre automatiquement

## ❓ Problèmes courants

### "Backend non disponible"
→ Vérifiez que le backend tourne sur http://localhost:8080

### "Modèles CLIP non trouvés"
→ Téléchargez les modèles ONNX (voir README.md)

### "Unable to access camera"
→ Autorisez l'accès caméra dans votre navigateur

### Port déjà utilisé (8080 ou 5173)
```powershell
# Trouver et arrêter le processus
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

## 🌐 URLs importantes

- **Frontend :** http://localhost:5173
- **Backend API :** http://localhost:8080/api/image/recognize
- **Health Check :** http://localhost:8080/api/image/health
- **Swagger UI :** http://localhost:8080/swagger-ui

## 📚 Documentation complète

- `README.md` - Vue d'ensemble et installation
- `ARCHITECTURE.md` - Architecture détaillée
- `TESTING.md` - Guide de test complet

## 🎨 Monuments supportés (30)

🇫🇷 **France:** Tour Eiffel, Arc de Triomphe, Notre-Dame, Sacré-Cœur, Louvre, Versailles, Mont Saint-Michel, Château de Chambord, Pont du Gard, Carcassonne

🇮🇹 **Italie:** Colisée, Tour de Pise

🇬🇧 **Royaume-Uni:** Big Ben, Tower Bridge, Palais de Buckingham

🇺🇸 **États-Unis:** Statue de la Liberté, Empire State Building, Golden Gate Bridge

🌍 **Monde:** Taj Mahal, Grande Muraille de Chine, Opéra de Sydney, Christ Rédempteur, Machu Picchu, Pyramides de Gizeh, Petra, Acropole, Sagrada Familia, Alhambra, Neuschwanstein

## 💡 Tips

- Utilisez des photos claires et bien éclairées
- Le monument doit être le sujet principal de la photo
- Les vues de face fonctionnent mieux
- Formats supportés : JPG, PNG, GIF
- Confidence > 50% = reconnaissance fiable
