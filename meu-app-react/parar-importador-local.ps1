$estadoPath = Join-Path $env:TEMP 'aprovado-importador-processos.json'
if (Test-Path $estadoPath) {
    $estado = Get-Content $estadoPath | ConvertFrom-Json
    foreach ($id in @($estado.backend, $estado.frontend)) {
        if ($id -and (Get-Process -Id $id -ErrorAction SilentlyContinue)) {
            try { Stop-Process -Id $id -Force -ErrorAction Stop }
            catch { Write-Host "Não foi possível encerrar o processo $id. Feche a janela correspondente pelo Gerenciador de Tarefas." -ForegroundColor Yellow }
        }
    }
    Remove-Item -LiteralPath $estadoPath
}
Write-Host 'Importador local encerrado.' -ForegroundColor Green
