param([string]$PastaDestino)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$raizRepositorio = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $PastaDestino) { $PastaDestino = Join-Path $raizRepositorio 'output\acervo-bancas-1996-2026' }
$cabecalhos = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36' }
$pastaAcervoLocal = Join-Path $raizRepositorio 'public\acervo'
$itens = [System.Collections.Generic.List[object]]::new()

foreach ($arquivoManifesto in Get-ChildItem -LiteralPath $pastaAcervoLocal -Recurse -File -Filter 'manifesto.json' | Where-Object { $_.Directory.Name -match '^(pf|prf)-' }) {
  $grupo = $arquivoManifesto.Directory.Name
  $json = Get-Content -LiteralPath $arquivoManifesto.FullName -Raw
  foreach ($match in [regex]::Matches($json, '(?i)"fonte_(pdf|gabarito)"\s*:\s*"([^"]+)"')) {
    $tipo = $match.Groups[1].Value.ToLowerInvariant()
    $url = $match.Groups[2].Value -replace '\\/', '/'
    try { $uri = [uri]$url } catch { continue }
    $pathPdf = ($uri.AbsolutePath -split '/@@download/file')[0]
    $nome = [uri]::UnescapeDataString([System.IO.Path]::GetFileName($pathPdf))
    if ($nome -notmatch '(?i)\.pdf$') { $nome = "$grupo-$tipo.pdf" }
    $destino = Join-Path (Join-Path $PastaDestino "originais\CEBRASPE\$grupo") $nome
    $itens.Add([pscustomobject]@{
      banca='Cebraspe'; concurso=$grupo; tipo=$tipo; nome_arquivo=$nome
      url_origem=$url; pagina_edicao='manifesto público do acervo do concurso'
      caminho_local=$destino
    })
  }
}
$itens = @($itens | Sort-Object url_origem -Unique)
$resultados = @($itens | ForEach-Object -Parallel {
  $item = $_
  if (Test-Path -LiteralPath $item.caminho_local) {
    $f = Get-Item -LiteralPath $item.caminho_local
    if ($f.Length -gt 1000) { return [pscustomobject]@{ banca=$item.banca; concurso=$item.concurso; tipo=$item.tipo; nome_arquivo=$item.nome_arquivo; url_origem=$item.url_origem; pagina_edicao=$item.pagina_edicao; caminho_local=$item.caminho_local; bytes=$f.Length; status='já baixado'; erro='' } }
  }
  try {
    New-Item -ItemType Directory -Path (Split-Path -Parent $item.caminho_local) -Force | Out-Null
    Invoke-WebRequest -Uri $item.url_origem -Headers $using:cabecalhos -OutFile $item.caminho_local -TimeoutSec 180 -SkipCertificateCheck
    $f = Get-Item -LiteralPath $item.caminho_local
    if ($f.Length -lt 1000) { throw "Arquivo inesperadamente pequeno ($($f.Length) bytes)" }
    [pscustomobject]@{ banca=$item.banca; concurso=$item.concurso; tipo=$item.tipo; nome_arquivo=$item.nome_arquivo; url_origem=$item.url_origem; pagina_edicao=$item.pagina_edicao; caminho_local=$item.caminho_local; bytes=$f.Length; status='baixado'; erro='' }
  } catch {
    if (Test-Path -LiteralPath $item.caminho_local) { Remove-Item -LiteralPath $item.caminho_local -Force }
    [pscustomobject]@{ banca=$item.banca; concurso=$item.concurso; tipo=$item.tipo; nome_arquivo=$item.nome_arquivo; url_origem=$item.url_origem; pagina_edicao=$item.pagina_edicao; caminho_local=$item.caminho_local; bytes=0; status='falha'; erro=$_.Exception.Message }
  }
} -ThrottleLimit 6)
$manifesto = Join-Path $PastaDestino 'manifesto-cebraspe-pf-prf.csv'
$resultados | Sort-Object concurso,nome_arquivo | Export-Csv -LiteralPath $manifesto -NoTypeInformation -Encoding utf8
Write-Host "PDFs de concursos PF/PRF encontrados: $($itens.Count); baixados: $(@($resultados | Where-Object status -eq 'baixado').Count); falhas: $(@($resultados | Where-Object status -eq 'falha').Count)."
