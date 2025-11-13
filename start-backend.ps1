# Script pour démarrer le backend Quarkus
Write-Host "🚀 Démarrage du backend Monument Recognition..." -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\backend"

# Vérifier si les modèles ONNX existent
$visionModel = "src\main\resources\clip_vision.onnx"
$textModel = "src\main\resources\clip_text.onnx"

if (-not (Test-Path $visionModel) -or -not (Test-Path $textModel)) {
    Write-Host "❌ Modèles ONNX manquants!" -ForegroundColor Red
    Write-Host "Veuillez télécharger les modèles selon les instructions du README.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Modèles ONNX trouvés" -ForegroundColor Green
Write-Host "📦 Lancement de Quarkus en mode dev..." -ForegroundColor Cyan

.\mvnw.cmd quarkus:dev
