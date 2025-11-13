# Script pour démarrer le frontend React
Write-Host "🚀 Démarrage du frontend Monument Recognition..." -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\frontend"

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Dépendances prêtes" -ForegroundColor Green
Write-Host "🌐 Lancement du serveur de développement Vite..." -ForegroundColor Cyan

npm run dev
