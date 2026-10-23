$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$out = [IO.Path]::GetFullPath((Join-Path $workspace 'output\acervo-bancas-1996-2026'))
$origRoot = [IO.Path]::GetFullPath((Join-Path $out 'originais'))
$rootPrefix = $out.TrimEnd('\') + '\'
if (-not $origRoot.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw "Pasta de originais fora do acervo: $origRoot" }
$validExtensions = @('.pdf','.zip','.doc','.docx','.odt','.rtf','.txt','.png','.jpg','.jpeg','.tif','.tiff','.rar')
$candidates = Get-ChildItem -LiteralPath $origRoot -Recurse -File |
    Where-Object { $_.Extension.ToLowerInvariant() -notin $validExtensions }
$manifests = Get-ChildItem -LiteralPath $out -File -Filter 'manifesto*.csv'
$replacements = [Collections.Generic.Dictionary[string,string]]::new([StringComparer]::OrdinalIgnoreCase)
$rows = [Collections.Generic.List[object]]::new()
foreach ($file in $candidates) {
    $stream = [IO.File]::OpenRead($file.FullName)
    $buffer = [byte[]]::new(5)
    $read = $stream.Read($buffer, 0, 5)
    $stream.Dispose()
    if ($read -ne 5 -or [Text.Encoding]::ASCII.GetString($buffer) -ne '%PDF-') { continue }

    $oldFull = [IO.Path]::GetFullPath($file.FullName)
    if (-not $oldFull.StartsWith($origRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "Origem fora de originais/: $oldFull" }
    $relative = [IO.Path]::GetRelativePath($origRoot, $oldFull)
    $board = $relative.Split([IO.Path]::DirectorySeparatorChar)[0]
    $digest = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($relative))).Substring(0, 16)
    $newDir = [IO.Path]::GetFullPath((Join-Path (Join-Path $origRoot $board) '_caminhos-curtos'))
    $newFull = [IO.Path]::GetFullPath((Join-Path $newDir ($digest + '.pdf')))
    if (-not $newDir.StartsWith($origRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) -or
        -not $newFull.StartsWith($origRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Destino fora de originais/: $newFull"
    }
    if (Test-Path -LiteralPath $newFull) { throw "Destino já existe: $newFull" }
    New-Item -ItemType Directory -Path $newDir -Force | Out-Null
    Move-Item -LiteralPath $oldFull -Destination $newFull
    $newRelative = [IO.Path]::GetRelativePath($origRoot, $newFull)
    $replacements[$oldFull] = $newFull
    $replacements[$oldFull.Replace('\', '/')] = $newFull.Replace('\', '/')
    $replacements[('originais\' + $relative)] = ('originais\' + $newRelative)
    $replacements[('originais\' + $relative).Replace('\', '/')] = ('originais\' + $newRelative).Replace('\', '/')

    $banca = switch ($board.ToUpperInvariant()) {
        'EXERCITO' { 'Exército Brasileiro' }
        'INEP' { 'INEP' }
        'IBFC' { 'IBFC' }
        default { $board }
    }
    $page = switch ($board.ToUpperInvariant()) {
        'EXERCITO' { 'https://www.ime.eb.mil.br/vestibular-e-concursos/cfg-ensino-medio/provas-anteriores-cfg' }
        'INEP' { 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/saeb/documentos-edicoes-antigas' }
        'IBFC' { 'https://concursos.ibfc.org.br/index/3/' }
        default { '' }
    }
    $rows.Add([pscustomobject]@{
        banca = $banca; concurso = $file.Directory.Name; ano = ''; tipo = 'PDF recuperado pela assinatura do arquivo'
        nome_arquivo = $digest + '.pdf'; url_origem = ''; pagina_origem = $page
        caminho_local = ('originais/' + $newRelative.Replace('\', '/')); bytes = $file.Length
        status = 'PDF identificado e recuperado'; erro = 'A origem direta não pôde ser reconstituída após a extração do pacote público.'
    })
}
$pattern = '(' + (($replacements.Keys | Sort-Object { $_.Length } -Descending | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')'
$evaluator = [Text.RegularExpressions.MatchEvaluator]{ param($match) $replacements[$match.Value] }
foreach ($manifest in $manifests) {
    $raw = [IO.File]::ReadAllText($manifest.FullName)
    $raw = [regex]::Replace($raw, $pattern, $evaluator)
    [IO.File]::WriteAllText($manifest.FullName, $raw, [Text.UTF8Encoding]::new($true))
}
$rows | Export-Csv -LiteralPath (Join-Path $out 'manifesto-pdfs-recuperados.csv') -NoTypeInformation -Encoding utf8
"PDFs recuperados: $($rows.Count)"
