$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$out = [IO.Path]::GetFullPath((Join-Path $workspace 'output\acervo-bancas-1996-2026'))
$origRoot = [IO.Path]::GetFullPath((Join-Path $out 'originais'))
$textRoot = [IO.Path]::GetFullPath((Join-Path $out 'textos'))
$rootPrefix = $out.TrimEnd('\') + '\'
foreach ($root in @($out, $origRoot, $textRoot)) {
    $resolved = [IO.Path]::GetFullPath($root)
    if ($resolved -ne $out -and -not $resolved.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Diretório fora do acervo: $resolved"
    }
}

$manifestFiles = Get-ChildItem -LiteralPath $out -File -Filter 'manifesto*.csv'
$longFiles = Get-ChildItem -LiteralPath $origRoot -Recurse -File -Filter '*.pdf' |
    Where-Object { $_.FullName.Length -gt 225 }
$moved = 0
$replacements = [Collections.Generic.Dictionary[string,string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($file in $longFiles) {
    $oldFull = [IO.Path]::GetFullPath($file.FullName)
    if (-not $oldFull.StartsWith($origRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Origem fora de originais/: $oldFull"
    }
    $relative = [IO.Path]::GetRelativePath($origRoot, $oldFull)
    $parts = $relative.Split([IO.Path]::DirectorySeparatorChar)
    $board = $parts[0]
    $digest = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($relative))).Substring(0, 16)
    $newDir = [IO.Path]::GetFullPath((Join-Path (Join-Path $origRoot $board) '_caminhos-curtos'))
    $newFull = [IO.Path]::GetFullPath((Join-Path $newDir ($digest + $file.Extension.ToLowerInvariant())))
    if (-not $newDir.StartsWith($origRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) -or
        -not $newFull.StartsWith($origRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Destino fora de originais/: $newFull"
    }
    if (Test-Path -LiteralPath $newFull) { throw "Destino já existe: $newFull" }

    $oldText = [IO.Path]::GetFullPath((Join-Path $textRoot ([IO.Path]::ChangeExtension($relative, '.txt'))))
    $newText = [IO.Path]::GetFullPath((Join-Path (Join-Path $textRoot $board) ("_caminhos-curtos\" + $digest + '.txt')))
    foreach ($path in @($oldText, $newText)) {
        if (-not $path.StartsWith($textRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
            throw "Caminho de texto fora de textos/: $path"
        }
    }

    New-Item -ItemType Directory -Path $newDir -Force | Out-Null
    Move-Item -LiteralPath $oldFull -Destination $newFull
    if (Test-Path -LiteralPath $oldText) {
        $newTextDir = Split-Path -Parent $newText
        New-Item -ItemType Directory -Path $newTextDir -Force | Out-Null
        Move-Item -LiteralPath $oldText -Destination $newText
        $oldHeader = $relative.Replace('\', '/')
        $newRelative = [IO.Path]::GetRelativePath($origRoot, $newFull)
        $newHeader = $newRelative.Replace('\', '/')
        $content = [IO.File]::ReadAllText($newText)
        [IO.File]::WriteAllText($newText, $content.Replace($oldHeader, $newHeader), [Text.UTF8Encoding]::new($false))
    }

    $newRelative = [IO.Path]::GetRelativePath($origRoot, $newFull)
    $oldOrigBack = 'originais\' + $relative
    $newOrigBack = 'originais\' + $newRelative
    $oldTextBack = 'textos\' + [IO.Path]::ChangeExtension($relative, '.txt')
    $newTextRelative = [IO.Path]::GetRelativePath($textRoot, $newText)
    $newTextBack = 'textos\' + $newTextRelative
    $replacements[$oldFull] = $newFull
    $replacements[$oldFull.Replace('\', '/')] = $newFull.Replace('\', '/')
    $replacements[$oldOrigBack] = $newOrigBack
    $replacements[$oldOrigBack.Replace('\', '/')] = $newOrigBack.Replace('\', '/')
    $replacements[$oldText] = $newText
    $replacements[$oldText.Replace('\', '/')] = $newText.Replace('\', '/')
    $replacements[$oldTextBack] = $newTextBack
    $replacements[$oldTextBack.Replace('\', '/')] = $newTextBack.Replace('\', '/')
    $moved++
}
$pattern = '(' + (($replacements.Keys | Sort-Object { $_.Length } -Descending | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')'
$evaluator = [Text.RegularExpressions.MatchEvaluator]{ param($match) $replacements[$match.Value] }
foreach ($manifest in $manifestFiles) {
    $raw = [IO.File]::ReadAllText($manifest.FullName)
    $raw = [regex]::Replace($raw, $pattern, $evaluator)
    [IO.File]::WriteAllText($manifest.FullName, $raw, [Text.UTF8Encoding]::new($true))
}
"Arquivos PDF reposicionados: $moved"
