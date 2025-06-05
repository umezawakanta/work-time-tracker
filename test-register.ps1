$body = @{
    name     = "テストユーザー"
    email    = "test@example.com"
    password = "testpassword123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -ContentType "application/json" -Body $body
    Write-Host "登録成功: $($response | ConvertTo-Json)"
}
catch {
    Write-Host "登録エラー: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "エラー詳細: $responseBody"
    }
} 