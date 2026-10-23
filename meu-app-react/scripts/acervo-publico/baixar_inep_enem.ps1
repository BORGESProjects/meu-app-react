param(
  [int]$PrimeiroAno = 1998,
  [int]$UltimoAno = 2025,
  [string]$PastaDestino,
  [switch]$SomenteManifesto
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$raizRepositorio = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $PastaDestino) {
  $PastaDestino = Join-Path $raizRepositorio 'output\acervo-bancas-1996-2026'
}
$pastaOriginais = Join-Path $PastaDestino 'originais\INEP\ENEM'
$paginaBase = 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos'
$cabecalhos = @{
  'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'
}

New-Item -ItemType Directory -Path $pastaOriginais -Force | Out-Null
$arquivos = [System.Collections.Generic.List[object]]::new()

for ($ano = $PrimeiroAno; $ano -le $UltimoAno; $ano++) {
  $paginaAno = "$paginaBase/$ano"
  Write-Host "Lendo índice oficial do Enem $ano..."
  $pagina = Invoke-WebRequest -Uri $paginaAno -Headers $cabecalhos -TimeoutSec 45
  $urls = @($pagina.Links | Where-Object { $_.href -match '(?i)\.pdf(?:$|\?)' } | Select-Object -ExpandProperty href -Unique)
  $pastaAno = Join-Path $pastaOriginais $ano
  New-Item -ItemType Directory -Path $pastaAno -Force | Out-Null

  foreach ($url in $urls) {
    $uri = [uri]$url
    $nome = [uri]::UnescapeDataString([System.IO.Path]::GetFileName($uri.AbsolutePath))
    if (-not $nome) { continue }
    $caminho = Join-Path $pastaAno $nome
    $arquivos.Add([pscustomobject]@{
      banca = 'INEP'
      avaliacao = 'ENEM'
      ano = $ano
      nome_arquivo = $nome
      url_origem = $uri.AbsoluteUri
      pagina_edicao = $paginaAno
      caminho_local = $caminho
    })
  }
}

$itensUnicos = @($arquivos | Sort-Object ano, url_origem -Unique)
Write-Host "Encontrados $($itensUnicos.Count) PDFs oficiais. Iniciando downloads..."

if ($SomenteManifesto) {
  $resultados = @($itensUnicos | ForEach-Object {
    $item = $_
    $existente = Get-Item -LiteralPath $item.caminho_local -ErrorAction SilentlyContinue
    [pscustomobject]@{
      banca = $item.banca; avaliacao = $item.avaliacao; ano = $item.ano
      nome_arquivo = $item.nome_arquivo; url_origem = $item.url_origem
      pagina_edicao = $item.pagina_edicao; caminho_local = $item.caminho_local
      bytes = if ($existente) { $existente.Length } else { 0 }
      status = if ($existente -and $existente.Length -gt 0) { 'baixado' } else { 'não localizado' }
      erro = if ($existente) { '' } else { 'Arquivo indisponível no endereço oficial ou download não concluído.' }
    }
  })
  $pdf1998 = Join-Path $pastaOriginais '1998\ENEM_1998_PROVA_AMARELA.pdf'
  $gab1998 = Join-Path $pastaOriginais '1998\ENEM_1998_GAB_AMARELA.pdf'
  $resultados += [pscustomobject]@{
    banca = 'INEP'; avaliacao = 'ENEM'; ano = 1998; nome_arquivo = 'ENEM_1998_PROVA_AMARELA.pdf'
    url_origem = 'https://riep.inep.gov.br/bitstreams/75eeaaff-54d7-4320-9852-0a8d091d5a0a/download'
    pagina_edicao = 'https://riep.inep.gov.br/items/129c4ee7-69a1-4819-9e64-d05d03acffa1'
    caminho_local = $pdf1998; bytes = (Get-Item -LiteralPath $pdf1998 -ErrorAction SilentlyContinue).Length
    status = 'baixado'; erro = ''
  }
  $resultados += [pscustomobject]@{
    banca = 'INEP'; avaliacao = 'ENEM'; ano = 1998; nome_arquivo = 'ENEM_1998_GAB_AMARELA.pdf'
    url_origem = 'https://riep.inep.gov.br/bitstreams/6ba816e6-f8e7-4cb8-ac91-de7b617ec2f6/download'
    pagina_edicao = 'https://riep.inep.gov.br/items/129c4ee7-69a1-4819-9e64-d05d03acffa1'
    caminho_local = $gab1998; bytes = (Get-Item -LiteralPath $gab1998 -ErrorAction SilentlyContinue).Length
    status = 'baixado'; erro = ''
  }
  $manifesto = Join-Path $PastaDestino 'manifesto-inep-enem.csv'
  $resultados | Sort-Object ano, nome_arquivo, url_origem | Export-Csv -LiteralPath $manifesto -NoTypeInformation -Encoding utf8
  Write-Host "Manifesto reconstruído sem repetir downloads: $manifesto"
  return
}

$resultados = @($itensUnicos | ForEach-Object -Parallel {
  $item = $_
  $headers = $using:cabecalhos
  if (Test-Path -LiteralPath $item.caminho_local) {
    $existente = Get-Item -LiteralPath $item.caminho_local
    if ($existente.Length -gt 0) {
      return [pscustomobject]@{ banca = $item.banca; avaliacao = $item.avaliacao; ano = $item.ano; nome_arquivo = $item.nome_arquivo; url_origem = $item.url_origem; pagina_edicao = $item.pagina_edicao; caminho_local = $item.caminho_local; bytes = $existente.Length; status = 'já baixado'; erro = '' }
    }
  }
  try {
    Invoke-WebRequest -Uri $item.url_origem -Headers $headers -OutFile $item.caminho_local -TimeoutSec 180 -SkipCertificateCheck
    $arquivo = Get-Item -LiteralPath $item.caminho_local
    if ($arquivo.Length -lt 1000) { throw "Arquivo inesperadamente pequeno: $($arquivo.Length) bytes" }
    [pscustomobject]@{ banca = $item.banca; avaliacao = $item.avaliacao; ano = $item.ano; nome_arquivo = $item.nome_arquivo; url_origem = $item.url_origem; pagina_edicao = $item.pagina_edicao; caminho_local = $item.caminho_local; bytes = $arquivo.Length; status = 'baixado'; erro = '' }
  } catch {
    if (Test-Path -LiteralPath $item.caminho_local) { Remove-Item -LiteralPath $item.caminho_local -Force }
    [pscustomobject]@{ banca = $item.banca; avaliacao = $item.avaliacao; ano = $item.ano; nome_arquivo = $item.nome_arquivo; url_origem = $item.url_origem; pagina_edicao = $item.pagina_edicao; caminho_local = $item.caminho_local; bytes = 0; status = 'falha'; erro = $_.Exception.Message }
  }
} -ThrottleLimit 6)

$manifesto = Join-Path $PastaDestino 'manifesto-inep-enem.csv'
$resultados | Sort-Object ano, nome_arquivo | Export-Csv -LiteralPath $manifesto -NoTypeInformation -Encoding utf8
$baixados = @($resultados | Where-Object { $_.status -eq 'baixado' }).Count
$falhas = @($resultados | Where-Object { $_.status -eq 'falha' }).Count
$bytes = [long](($resultados | Measure-Object -Property bytes -Sum).Sum)
Write-Host "Finalizado: $baixados novos, $($resultados.Count - $baixados - $falhas) já existentes, $falhas falhas; $([math]::Round($bytes / 1GB, 2)) GB no total."
Write-Host "Manifesto: $manifesto"
