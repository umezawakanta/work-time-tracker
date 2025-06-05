$headers = @{
    'Content-Type' = 'application/json'
}

$body = @{
    name     = "テストユーザー"
    email    = "test@example.com"
    password = "testpassword123"
} | ConvertTo-Json

Write-Host "送信データ: $body"
Write-Host "URL: http://localhost:3001/api/auth/register"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -Headers $headers -Body $body -UseBasicParsing
    Write-Host "成功: $($response.StatusCode)"
    Write-Host "レスポンス: $($response.Content)"
}
catch {
    Write-Host "エラー: $($_.Exception.Message)"
    Write-Host "ステータスコード: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "エラーレスポンス: $responseBody"
        $reader.Close()
        $stream.Close()
    }
} 