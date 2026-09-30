$ErrorActionPreference = 'Stop'
$modelo = 'qwen3:4b-instruct'
trap { Write-Host $_.Exception.Message -ForegroundColor Red; Read-Host 'Pressione Enter para fechar'; exit 1 }

function Encontrar-Ollama {
    $comando = Get-Command ollama -ErrorAction SilentlyContinue
    if ($comando) { return $comando.Source }
    $comum = Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama.exe'
    if (Test-Path $comum) { return $comum }
    return $null
}

Write-Host 'Configurando o Importador Local AP Aprovado...' -ForegroundColor Cyan
$ollama = Encontrar-Ollama
if (-not $ollama) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw 'O instalador do Windows (winget) não foi encontrado. Instale o Ollama em https://ollama.com/download/windows e execute este arquivo novamente.'
    }
    Write-Host 'Instalando o mecanismo de IA local...' -ForegroundColor Yellow
    winget install --id Ollama.Ollama --exact --accept-package-agreements --accept-source-agreements
    $ollama = Encontrar-Ollama
    if (-not $ollama) { throw 'O Ollama foi instalado, mas ainda não foi localizado. Reinicie o Windows e execute este arquivo novamente.' }
}

if (-not (Get-Process ollama -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $ollama -ArgumentList 'serve' -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

Write-Host "Baixando o modelo especializado ($modelo, aproximadamente 2,5 GB)..." -ForegroundColor Yellow
& $ollama pull $modelo
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível baixar o modelo local.' }

$config = Join-Path $PSScriptRoot 'backend\application-local.properties'
$configurarBanco = -not (Test-Path $config)
if (-not $configurarBanco) {
    $resposta = Read-Host 'A conexão do banco já existe. Deseja informá-la novamente? (S/N)'
    $configurarBanco = $resposta.Trim().ToUpperInvariant() -eq 'S'
}
if ($configurarBanco) {
    Write-Host 'Agora conecte o importador ao mesmo banco usado pelo site.' -ForegroundColor Cyan
    $jdbc = Read-Host 'Cole a DATABASE_URL no formato jdbc:postgresql://servidor:5432/postgres'
    $usuario = Read-Host 'DATABASE_USERNAME'
    $senhaSegura = Read-Host 'DATABASE_PASSWORD' -AsSecureString
    $senha = [System.Net.NetworkCredential]::new('', $senhaSegura).Password
    @(
        "spring.datasource.url=$jdbc"
        "spring.datasource.username=$usuario"
        "spring.datasource.password=$senha"
    ) | Set-Content -LiteralPath $config -Encoding utf8
}

Write-Host 'Configuração concluída. Use iniciar-importador-local.ps1 para abrir o programa.' -ForegroundColor Green
