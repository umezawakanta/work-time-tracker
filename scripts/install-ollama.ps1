# Ollama Windows インストールスクリプト
# PowerShell管理者権限で実行してください

Write-Host "🦙 Ollama インストールスクリプト" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 管理者権限チェック
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️  このスクリプトは管理者権限で実行する必要があります" -ForegroundColor Yellow
    Write-Host "PowerShellを管理者として実行してから、再度このスクリプトを実行してください" -ForegroundColor Yellow
    exit 1
}

# Ollamaのダウンロード
Write-Host "📥 Ollamaをダウンロード中..." -ForegroundColor Green
$ollamaUrl = "https://ollama.com/download/OllamaSetup.exe"
$installerPath = "$env:TEMP\OllamaSetup.exe"

try {
    Invoke-WebRequest -Uri $ollamaUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ ダウンロード完了" -ForegroundColor Green
}
catch {
    Write-Host "❌ ダウンロードに失敗しました: $_" -ForegroundColor Red
    exit 1
}

# Ollamaのインストール
Write-Host "📦 Ollamaをインストール中..." -ForegroundColor Green
try {
    Start-Process -FilePath $installerPath -ArgumentList "/silent" -Wait
    Write-Host "✅ インストール完了" -ForegroundColor Green
}
catch {
    Write-Host "❌ インストールに失敗しました: $_" -ForegroundColor Red
    exit 1
}

# インストーラーのクリーンアップ
Remove-Item $installerPath -Force -ErrorAction SilentlyContinue

# Ollamaのパスを環境変数に追加（必要に応じて）
$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama"
if (Test-Path $ollamaPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$ollamaPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$ollamaPath", "User")
        Write-Host "✅ PATHに追加しました" -ForegroundColor Green
    }
}

# Ollamaサービスの起動確認
Write-Host ""
Write-Host "🔍 Ollamaサービスの状態を確認中..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
    Write-Host "✅ Ollamaサービスが正常に起動しています" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Ollamaサービスがまだ起動していません" -ForegroundColor Yellow
    Write-Host "手動で起動する場合: ollama serve" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Ollamaのインストールが完了しました！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "1. モデルをダウンロード: ollama pull llama3.2:3b" -ForegroundColor White
Write-Host "2. モデルの動作確認: ollama run llama3.2:3b 'Hello, world!'" -ForegroundColor White
Write-Host "3. Work Time Trackerで「ローカルLLM (Ollama)」を選択" -ForegroundColor White
Write-Host ""
