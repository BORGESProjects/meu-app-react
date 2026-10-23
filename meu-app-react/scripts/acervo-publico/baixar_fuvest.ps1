param(
  [int]$PrimeiroAno = 1996,
  [int]$UltimoAno = 2026,
  [string]$PastaDestino
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$raizRepositorio = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if (-not $PastaDestino) {
  $PastaDestino = Join-Path $raizRepositorio 'output\acervo-bancas-1996-2026'
}
$pastaOriginais = Join-Path $PastaDestino 'originais\FUVEST'
$padraoLinkPdf = '(?is)<a\b[^>]*href=["'']([^"'']+\.pdf(?:\?[^"'']*)?)["''][^>]*>(.*?)</a>'
$cabecalhos = @{
  'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'
}

New-Item -ItemType Directory -Path $pastaOriginais -Force | Out-Null
$arquivos = [System.Collections.Generic.List[object]]::new()

for ($ano = $PrimeiroAno; $ano -le $UltimoAno; $ano++) {
  $paginaAno = if ($ano -le 2021) { "https://acervo.fuvest.br/fuvest/$ano/" } else { "https://www.fuvest.br/acervo-vestibular-$ano/" }
  Write-Host "Lendo provas Fuvest $ano..."
  try {
    $pagina = Invoke-WebRequest -Uri $paginaAno -Headers $cabecalhos -SkipCertificateCheck -TimeoutSec 45
  } catch {
    Write-Warning "Página oficial indisponível para ${ano}: $($_.Exception.Message)"
    continue
  }

  $pastaAno = Join-Path $pastaOriginais $ano
  New-Item -ItemType Directory -Path $pastaAno -Force | Out-Null
  foreach ($match in [regex]::Matches($pagina.Content, $padraoLinkPdf)) {
    $href = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
    $rotulo = [System.Net.WebUtility]::HtmlDecode(($match.Groups[2].Value -replace '<[^>]+>', ' ' -replace '\s+', ' ')).Trim()
    $uri = [uri]::new([uri]$paginaAno, $href)
    $nome = [uri]::UnescapeDataString([System.IO.Path]::GetFileName($uri.AbsolutePath))
    if (-not $nome) { continue }
    $rotuloBusca = "$rotulo $nome"
    if ($rotuloBusca -match '(?i)manual|nota[s]? de corte|inscrit|convocad|matr[ií]cul|estat[ií]st|an[aá]lise|question[aá]rio|carreira|desempenho|local|chamada|treineiro|relat[oó]rio|candidato|qase') { continue }
    if ($ano -ge 2022 -and ($nome -notmatch [string]$ano -or $nome -notmatch '(?i)prova|gabarito|resposta')) { continue }
    if (-not $rotulo) { $rotulo = $nome }
    $arquivos.Add([pscustomobject]@{
      banca = 'FUVEST'
      concurso = 'Vestibular USP'
      ano = $ano
      documento = $rotulo
      nome_arquivo = $nome
      url_origem = $uri.AbsoluteUri
      pagina_edicao = $paginaAno
      caminho_local = (Join-Path $pastaAno $nome)
    })
  }
}

$itensUnicos = @($arquivos | Sort-Object ano, url_origem -Unique)
Write-Host "Encontrados $($itensUnicos.Count) PDFs de prova/gabarito. Iniciando downloads..."

$resultados = @($itensUnicos | ForEach-Object -Parallel {
  $item = $_
  $headers = $using:cabecalhos
  if (Test-Path -LiteralPath $item.caminho_local) {
    $existente = Get-Item -LiteralPath $item.caminho_local
    if ($existente.Length -gt 0) {
      return [pscustomobject]@{ banca = $item.banca; concurso = $item.concurso; ano = $item.ano; documento = $item.documento; nome_arquivo = $item.nome_arquivo; url_origem = $item.url_origem; pagina_edicao = $item.pagina_edicao; caminho_local = $item.caminho_local; bytes = $existente.Length; status = 'já baixado'; erro = '' }
    }
  }
  try {
    Invoke-WebRequest -Uri $item.url_origem -Headers $headers -OutFile $item.caminho_local -TimeoutSec 180 -SkipCertificateCheck
    $arquivo = Get-Item -LiteralPath $item.caminho_local
    if ($arquivo.Length -lt 1000) { throw "Arquivo inesperadamente pequeno: $($arquivo.Length) bytes" }
    [pscustomobject]@{ banca = $item.banca; concurso = $item.concurso; ano = $item.ano; documento = $item.documento; nome_arquivo = $item.nome_arquivo; url_origem = $item.url_origem; pagina_edicao = $item.pagina_edicao; caminho_local = $item.caminho_local; bytes = $arquivo.Length; status = 'baixado'; erro = '' }
  } catch {
    if (Test-Path -LiteralPath $item.caminho_local) { Remove-Item -LiteralPath $item.caminho_local -Force }
    [pscustomobject]@{ banca = $item.banca; concurso = $item.concurso; ano = $item.ano; documento = $item.documento; nome_arquivo = $item.nome_arquivo; url_origem = $item.url_origem; pagina_edicao = $item.pagina_edicao; caminho_local = $item.caminho_local; bytes = 0; status = 'falha'; erro = $_.Exception.Message }
  }
} -ThrottleLimit 5)

$manifesto = Join-Path $PastaDestino 'manifesto-fuvest.csv'
$anteriores = if (Test-Path -LiteralPath $manifesto) { @(Import-Csv -LiteralPath $manifesto) } else { @() }
$consolidado = @($anteriores + $resultados | Sort-Object ano, url_origem -Unique)
$consolidado | Sort-Object ano, nome_arquivo | Export-Csv -LiteralPath $manifesto -NoTypeInformation -Encoding utf8
$baixados = @($resultados | Where-Object { $_.status -eq 'baixado' }).Count
$falhas = @($resultados | Where-Object { $_.status -eq 'falha' }).Count
$bytes = [long](($resultados | Measure-Object -Property bytes -Sum).Sum)
Write-Host "Finalizado: $baixados novos, $($resultados.Count - $baixados - $falhas) já existentes, $falhas falhas; $([math]::Round($bytes / 1GB, 2)) GB no total."
Write-Host "Manifesto: $manifesto"
