# ✅ Checklist de vérification

## Avant de démarrer

### Prérequis installés
- [ ] Java 21+ (`java -version`)
- [ ] Maven (`mvn -version`)
- [ ] Node.js 18+ (`node -version`)
- [ ] npm (`npm -version`)

### Modèles ONNX présents
- [ ] `backend/src/main/resources/clip_vision.onnx` (85 MB)
- [ ] `backend/src/main/resources/clip_text.onnx` (62 MB)
- [ ] `backend/src/main/resources/monuments_tokens.json`

## Démarrage

### Backend (Terminal 1)
```powershell
cd backend
.\mvnw.cmd quarkus:dev
```

Attendez ces messages :
- [ ] `✓ Tokens pré-calculés chargés`
- [ ] `✓ Text embeddings précalculés`
- [ ] `✓ CLIP chargé - 30 monuments`
- [ ] `Listening on: http://localhost:8080`

### Frontend (Terminal 2)
```powershell
cd frontend
npm install  # Première fois seulement
npm run dev
```

Attendez ce message :
- [ ] `➜  Local:   http://localhost:5173/`

## Tests de validation

### 1. Test backend - Health check
```powershell
curl http://localhost:8080/api/image/health
```

Résultat attendu :
```json
{
  "status": "OK",
  "model": "CLIP ViT-B/32",
  "monuments": 30,
  "ready": true
}
```
- [ ] ✅ Backend répond correctement

### 2. Test frontend - Interface

Ouvrez http://localhost:5173 dans votre navigateur

Vérifiez que vous voyez :
- [ ] Header "Monument Recognition"
- [ ] Zone d'upload "Drag & drop your image here"
- [ ] Bouton "Prendre une photo"
- [ ] Footer

### 3. Test upload d'image

Dans l'interface web :
1. [ ] Cliquez sur la zone d'upload
2. [ ] Sélectionnez une photo de monument
3. [ ] L'image s'affiche en preview
4. [ ] Un loader "Analyzing image..." apparaît
5. [ ] Les résultats s'affichent après 2-3 secondes

Vérifiez que les résultats contiennent :
- [ ] Nom du monument
- [ ] Ville et pays
- [ ] Niveau de confiance (en %)

### 4. Test capture webcam

Dans l'interface web :
1. [ ] Cliquez sur "Prendre une photo"
2. [ ] Une fenêtre modale s'ouvre
3. [ ] Le navigateur demande l'autorisation caméra
4. [ ] Autorisez l'accès
5. [ ] Le flux vidéo de la caméra s'affiche
6. [ ] Positionnez une photo de monument devant la caméra
7. [ ] Cliquez sur "Capturer"
8. [ ] La modal se ferme
9. [ ] L'image capturée s'affiche
10. [ ] L'analyse démarre automatiquement
11. [ ] Les résultats s'affichent

### 5. Test de la console développeur

Ouvrez la console du navigateur (F12) :
- [ ] Aucune erreur critique
- [ ] Les appels à `http://localhost:8080/api/image/recognize` réussissent (Status 200)
- [ ] Les réponses JSON sont bien formées

### 6. Test avec différents monuments

Testez avec des photos de différents monuments :

**France :**
- [ ] Tour Eiffel
- [ ] Arc de Triomphe
- [ ] Notre-Dame

**International :**
- [ ] Statue de la Liberté
- [ ] Big Ben
- [ ] Taj Mahal
- [ ] Colisée

Vérifiez que :
- [ ] Les résultats sont cohérents
- [ ] La confiance est > 50% pour des photos claires
- [ ] Le top 5 affiche des monuments similaires

## Tests d'erreurs

### Erreur de connexion backend

1. [ ] Arrêtez le backend (Ctrl+C dans le terminal backend)
2. [ ] Uploadez une image dans le frontend
3. [ ] Vérifiez qu'un message d'erreur clair s'affiche
4. [ ] Redémarrez le backend
5. [ ] Uploadez à nouveau
6. [ ] Vérifiez que ça fonctionne

### Erreur de permission caméra

1. [ ] Dans les paramètres du navigateur, bloquez l'accès à la caméra
2. [ ] Cliquez sur "Prendre une photo"
3. [ ] Vérifiez qu'un message d'erreur s'affiche
4. [ ] Réautorisez la caméra
5. [ ] Réessayez

### Image non supportée

1. [ ] Essayez d'uploader un fichier texte (.txt)
2. [ ] Vérifiez qu'une erreur appropriée est affichée

## Configuration CORS

Vérifiez dans `backend/src/main/resources/application.properties` :
- [ ] `quarkus.http.cors.origins=http://localhost:5173`
- [ ] CORS activé pour POST

## Fichiers modifiés

### Frontend
- [ ] `frontend/src/hooks/useImageUpload.ts` - Connexion au backend
  - Fonction `analyzeImage()` ajoutée
  - Appels au backend dans `handleFileUpload()` et `handleTakeSnapshot()`

### Backend
- [ ] `backend/src/main/java/com/myapp/services/ClipMonumentService.java`
  - Méthode `parseMonumentInfo()` ajoutée
  - Méthode `getCityCountry()` ajoutée
  - Réponse enrichie avec ville et pays

### Documentation
- [ ] `README.md` - Mis à jour
- [ ] `QUICKSTART.md` - Créé
- [ ] `ARCHITECTURE.md` - Créé
- [ ] `TESTING.md` - Créé
- [ ] `CHANGES.md` - Créé
- [ ] `start-backend.ps1` - Créé
- [ ] `start-frontend.ps1` - Créé

## Performance

### Backend
- [ ] Démarrage en moins de 30 secondes
- [ ] Première reconnaissance en moins de 5 secondes
- [ ] Reconnaissances suivantes en moins de 3 secondes

### Frontend
- [ ] Chargement de la page en moins de 2 secondes
- [ ] Upload instantané (< 1 seconde)
- [ ] Affichage des résultats en moins de 5 secondes

## Logs

### Backend - Messages attendus
```
✓ Tokens pré-calculés chargés
✓ Text embeddings précalculés
✓ CLIP chargé - 30 monuments
Listening on: http://localhost:8080
Taille image reçue: XXXXX bytes
Image chargée: WIDTHxHEIGHT
```

### Frontend - Console
```
POST http://localhost:8080/api/image/recognize 200 OK
```

## Swagger UI

- [ ] Ouvrez http://localhost:8080/swagger-ui
- [ ] L'interface Swagger s'affiche
- [ ] L'endpoint POST `/api/image/recognize` est documenté
- [ ] Vous pouvez tester directement depuis Swagger

## 🎉 Validation finale

Si tous les tests ci-dessus passent :
- ✅ **Le frontend est correctement relié au backend**
- ✅ **L'upload de photos fonctionne**
- ✅ **La capture webcam fonctionne**
- ✅ **La reconnaissance d'images fonctionne**
- ✅ **L'affichage des résultats est correct**

**Félicitations ! Votre application est pleinement fonctionnelle ! 🚀**

## Prochaines étapes possibles

Améliorations futures :
- [ ] Ajouter plus de monuments (modifier `monuments_tokens.json`)
- [ ] Améliorer l'affichage des résultats
- [ ] Ajouter des photos d'exemple pour chaque monument
- [ ] Historique des reconnaissances
- [ ] Export des résultats
- [ ] Mode sombre
