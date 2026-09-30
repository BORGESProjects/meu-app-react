$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$modelo = 'qwen3:4b-instruct'
trap { Write-Host $_.Exception.Message -ForegroundColor Red; Read-Host 'Pressione Enter para fechar'; exit 1 }

function Testar-PortaLocal([int]$porta) {
    $cliente = [System.Net.Sockets.TcpClient]::new()
    try {
        $tentativa = $cliente.ConnectAsync('127.0.0.1', $porta)
        return $tentativa.Wait(700) -and $cliente.Connected
    } catch { return $false }
    finally { $cliente.Dispose() }
}

$comando = Get-Command ollama -ErrorAction SilentlyContinue
$ollama = if ($comando) { $comando.Source } else { Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama.exe' }
if (-not (Test-Path $ollama)) {
    throw 'A IA local ainda não está instalada. Execute configurar-importador-local.ps1 primeiro.'
}
if (-not (Get-Process ollama -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $ollama -ArgumentList 'serve' -WindowStyle Hidden
    Start-Sleep -Seconds 3
}
$modelos = (& $ollama list | Out-String)
if ($modelos -notmatch [regex]::Escape($modelo)) {
    throw "O modelo $modelo ainda não está instalado. Execute configurar-importador-local.ps1 primeiro."
}

$backend = Join-Path $raiz 'backend'
$portaWeb = 41731
$enderecoWeb = "http://127.0.0.1:$portaWeb"
$env:FRONTEND_URL = $enderecoWeb
$frontendLog = Join-Path $env:TEMP 'aprovado-frontend.log'
$backendLog = Join-Path $env:TEMP 'aprovado-backend.log'
$api = $null
$web = $null
if (-not (Testar-PortaLocal 8080)) {
    $api = Start-Process -FilePath (Join-Path $backend 'mvnw.cmd') -ArgumentList 'spring-boot:run' -WorkingDirectory $backend -WindowStyle Hidden -RedirectStandardOutput $backendLog -RedirectStandardError "$backendLog.err" -PassThru
}
if (-not (Testar-PortaLocal $portaWeb)) {
    $web = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c',"npm run dev -- --host 127.0.0.1 --port $portaWeb --strictPort" -WorkingDirectory $raiz -WindowStyle Hidden -RedirectStandardOutput $frontendLog -RedirectStandardError "$frontendLog.err" -PassThru
}

$estadoPath = Join-Path $env:TEMP 'aprovado-importador-processos.json'
$anterior = if (Test-Path $estadoPath) { Get-Content $estadoPath | ConvertFrom-Json } else { $null }
$estado = @{
    backend = if ($api) { $api.Id } elseif ($anterior) { $anterior.backend } else { $null }
    frontend = if ($web) { $web.Id } elseif ($anterior) { $anterior.frontend } else { $null }
} | ConvertTo-Json
$estado | Set-Content $estadoPath
if ($api -or $web) { Start-Sleep -Seconds 8 }
if ($api -and $api.HasExited) {
    $detalhes = if (Test-Path $backendLog) { Get-Content $backendLog -Raw } else { '' }
    if ($detalhes -match 'password authentication failed') {
        throw 'A senha do banco foi recusada. Execute configurar-importador-local.ps1 novamente, responda S e informe a senha atual do banco Supabase.'
    }
    throw "O servidor local não iniciou. Consulte o registro em $backendLog"
}
if ($web -and $web.HasExited) { throw "A interface local não iniciou. Consulte o registro em $frontendLog" }
Start-Process $enderecoWeb
Write-Host 'Importador aberto. Para encerrá-lo, execute parar-importador-local.ps1.' -ForegroundColor Green
