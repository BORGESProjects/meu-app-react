$estadoPath = Join-Path $env:TEMP 'aprovado-importador-processos.json'
if (Test-Path $estadoPath) {
    $estado = Get-Content $estadoPath | ConvertFrom-Json
    foreach ($id in @($estado.backend, $estado.frontend)) {
        if ($id -and (Get-Process -Id $id -ErrorAction SilentlyContinue)) { Stop-Process -Id $id }
    }
    Remove-Item -LiteralPath $estadoPath
}
Write-Host 'Importador local encerrado.' -ForegroundColor Green
