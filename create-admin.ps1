$token = Read-Host "Enter ADMIN_BOOTSTRAP_TOKEN from Hostinger"
$email = Read-Host "Enter your current admin email"
$securePassword = Read-Host "Enter a NEW password (14-72 characters)" -AsSecureString
$password = [System.Net.NetworkCredential]::new("", $securePassword).Password

if ($password.Length -lt 14 -or $password.Length -gt 72) {
    Write-Host "Password must be 14-72 characters."
    exit
}

$body = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    Invoke-RestMethod `
        -Uri "https://mwamba.store/api/bootstrap-admin/reset-password" `
        -Method Post `
        -Headers @{ "x-admin-bootstrap-token" = $token } `
        -ContentType "application/json" `
        -Body $body
}
catch {
    Write-Host "Reset failed. Check the error below:"
    Write-Host $_.ErrorDetails.Message
}
finally {
    $password = $null
    $body = $null
    $token = $null
}