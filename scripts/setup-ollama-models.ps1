# Ollama モデルセットアップスクリプト
# Ollamaインストール後に実行

Write-Host "🦙 Ollama モデルセットアップ" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Ollamaの存在確認
try {
    $ollamaVersion = ollama --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Ollamaが見つかりません"
    }
    Write-Host "✅ Ollama検出: $ollamaVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Ollamaがインストールされていません" -ForegroundColor Red
    Write-Host "先に install-ollama.ps1 を実行してください" -ForegroundColor Yellow
    exit 1
}

# サービスの確認
Write-Host "🔍 Ollamaサービスの状態を確認中..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
    Write-Host "✅ Ollamaサービスが起動しています" -ForegroundColor Green
    
    if ($response.models.Count -gt 0) {
        Write-Host ""
        Write-Host "📦 インストール済みモデル:" -ForegroundColor Cyan
        foreach ($model in $response.models) {
            Write-Host "  - $($model.name) ($('{0:N2}' -f ($model.size / 1GB)) GB)" -ForegroundColor White
        }
    }
}
catch {
    Write-Host "⚠️  Ollamaサービスが起動していません" -ForegroundColor Yellow
    Write-Host "サービスを起動中..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "モデルを選択してください:" -ForegroundColor Yellow
Write-Host "1. llama3.2:3b (推奨 - 2GB, バランス型)" -ForegroundColor White
Write-Host "2. phi3:mini (超軽量 - 2.3GB)" -ForegroundColor White
Write-Host "3. mistral:7b (高精度 - 4.1GB)" -ForegroundColor White
Write-Host "4. qwen2.5:7b (日本語特化 - 4.4GB)" -ForegroundColor White
Write-Host "5. gemma2:2b (Google製 - 1.7GB)" -ForegroundColor White
Write-Host "6. カスタム (モデル名を入力)" -ForegroundColor White
Write-Host "0. スキップ" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "選択 (0-6)"

$modelName = switch ($choice) {
    "1" { "llama3.2:3b" }
    "2" { "phi3:mini" }
    "3" { "mistral:7b" }
    "4" { "qwen2.5:7b" }
    "5" { "gemma2:2b" }
    "6" { 
        Read-Host "モデル名を入力"
    }
    "0" { 
        Write-Host "モデルのダウンロードをスキップしました" -ForegroundColor Yellow
        exit 0
    }
    default { 
        Write-Host "無効な選択です" -ForegroundColor Red
        exit 1
    }
}

# モデルのダウンロード
Write-Host ""
Write-Host "📥 モデル '$modelName' をダウンロード中..." -ForegroundColor Green
Write-Host "（サイズによっては数分かかる場合があります）" -ForegroundColor Gray

try {
    ollama pull $modelName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ モデルのダウンロードが完了しました！" -ForegroundColor Green
    }
    else {
        throw "ダウンロードに失敗しました"
    }
}
catch {
    Write-Host "❌ モデルのダウンロードに失敗しました: $_" -ForegroundColor Red
    exit 1
}

# モデルのテスト
Write-Host ""
Write-Host "🧪 モデルをテスト中..." -ForegroundColor Yellow
$testPrompt = "こんにちは。今日の天気はどうですか？"

try {
    $testResponse = ollama run $modelName $testPrompt 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ モデルの動作確認完了" -ForegroundColor Green
        Write-Host ""
        Write-Host "テスト結果:" -ForegroundColor Cyan
        Write-Host $testResponse -ForegroundColor Gray
    }
}
catch {
    Write-Host "⚠️  モデルのテストに失敗しました" -ForegroundColor Yellow
}

# .envファイルの更新
Write-Host ""
$updateEnv = Read-Host "Work Time Trackerの.envファイルを更新しますか？ (y/n)"
if ($updateEnv -eq 'y' -or $updateEnv -eq 'Y') {
    $envPath = Join-Path (Get-Location) ".env"
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        if ($envContent -notmatch "VITE_OLLAMA_MODEL") {
            Add-Content $envPath "`n# Ollama Model Configuration`nVITE_OLLAMA_MODEL=$modelName"
            Write-Host "✅ .envファイルを更新しました" -ForegroundColor Green
        }
        else {
            Write-Host "ℹ️  VITE_OLLAMA_MODELは既に設定されています" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⚠️  .envファイルが見つかりません" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 セットアップ完了！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Work Time Trackerでの使用方法:" -ForegroundColor Yellow
Write-Host "1. タスク管理センター → 4象限タブを開く" -ForegroundColor White
Write-Host "2. AIプロバイダーで「🦙 ローカルLLM (Ollama)」を選択" -ForegroundColor White
Write-Host "3. 「再分析」ボタンをクリック" -ForegroundColor White
Write-Host ""
