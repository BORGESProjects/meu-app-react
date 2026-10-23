param([string]$PastaDestino)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$raizRepositorio = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $PastaDestino) { $PastaDestino = Join-Path $raizRepositorio 'output\acervo-bancas-1996-2026' }
$paginaOficial = 'https://www.ime.eb.mil.br/vestibular-e-concursos/cfg-ensino-medio/provas-anteriores-cfg'
$cabecalhos = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36' }
$pagina = Invoke-WebRequest -Uri $paginaOficial -Headers $cabecalhos -TimeoutSec 60 -SkipCertificateCheck
$itens = foreach ($link in $pagina.Links) {
  if ($link.href -notmatch '(?i)\.pdf(?:$|\?)') { continue }
  if ($link.href -notmatch '(?i)(2019-2020|2020-2021|2021-2022|2022-2023|2023-2024|2024-2025|2025-2026)') { continue }
  $uri = [uri]::new([uri]$paginaOficial, $link.href)
  $ano = [regex]::Match($uri.AbsolutePath, '(20\d{2}-20\d{2})').Groups[1].Value
  if (-not $ano) { continue }
  $nome = [uri]::UnescapeDataString([System.IO.Path]::GetFileName($uri.AbsolutePath))
  $pastaAno = Join-Path (Join-Path $PastaDestino 'originais\EXERCITO\IME\CFG') $ano
  New-Item -ItemType Directory -Path $pastaAno -Force | Out-Null
  [pscustomobject]@{
    banca='Exército Brasileiro'; concurso='IME CFG'; ano=$ano; nome_arquivo=$nome
    url_origem=$uri.AbsoluteUri; pagina_edicao=$paginaOficial
    caminho_local=(Join-Path $pastaAno $nome)
  }
}
$itens = @($itens | Sort-Object url_origem -Unique)
$resultados = @($itens | ForEach-Object -Parallel {
  $item = $_
  if (Test-Path -LiteralPath $item.caminho_local) {
    $f = Get-Item -LiteralPath $item.caminho_local
    if ($f.Length -gt 1000) { return [pscustomobject]@{ banca=$item.banca; concurso=$item.concurso; ano=$item.ano; nome_arquivo=$item.nome_arquivo; url_origem=$item.url_origem; pagina_edicao=$item.pagina_edicao; caminho_local=$item.caminho_local; bytes=$f.Length; status='já baixado'; erro='' } }
  }
  try {
    Invoke-WebRequest -Uri $item.url_origem -Headers $using:cabecalhos -OutFile $item.caminho_local -TimeoutSec 180 -SkipCertificateCheck
    $f = Get-Item -LiteralPath $item.caminho_local
    if ($f.Length -lt 1000) { throw "Arquivo inesperadamente pequeno ($($f.Length) bytes)" }
    [pscustomobject]@{ banca=$item.banca; concurso=$item.concurso; ano=$item.ano; nome_arquivo=$item.nome_arquivo; url_origem=$item.url_origem; pagina_edicao=$item.pagina_edicao; caminho_local=$item.caminho_local; bytes=$f.Length; status='baixado'; erro='' }
  } catch {
    if (Test-Path -LiteralPath $item.caminho_local) { Remove-Item -LiteralPath $item.caminho_local -Force }
    [pscustomobject]@{ banca=$item.banca; concurso=$item.concurso; ano=$item.ano; nome_arquivo=$item.nome_arquivo; url_origem=$item.url_origem; pagina_edicao=$item.pagina_edicao; caminho_local=$item.caminho_local; bytes=0; status='falha'; erro=$_.Exception.Message }
  }
} -ThrottleLimit 5)
$manifesto = Join-Path $PastaDestino 'manifesto-exercito-ime.csv'
$resultados | Sort-Object ano, nome_arquivo | Export-Csv -LiteralPath $manifesto -NoTypeInformation -Encoding utf8
Write-Host "PDFs encontrados: $($itens.Count); baixados: $(@($resultados | Where-Object status -eq 'baixado').Count); falhas: $(@($resultados | Where-Object status -eq 'falha').Count)."
Write-Host "Manifesto: $manifesto"
