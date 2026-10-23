$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$out = [IO.Path]::GetFullPath((Join-Path $workspace 'output\acervo-bancas-1996-2026'))
$origRoot = [IO.Path]::GetFullPath((Join-Path $out 'originais'))
$textRoot = [IO.Path]::GetFullPath((Join-Path $out 'textos'))
$rootPrefix = $out.TrimEnd('\') + '\'

foreach ($path in @($out, $origRoot, $textRoot)) {
    $full = [IO.Path]::GetFullPath($path)
    if (-not $full.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -and $full -ne $out) {
        throw "Caminho fora do diretório do acervo: $full"
    }
}

$longDirs = Get-ChildItem -LiteralPath $origRoot -Recurse -File -Filter '*.pdf' |
    Where-Object { $_.FullName.Length -gt 225 } |
    Group-Object { $_.Directory.FullName } |
    ForEach-Object { $_.Name } |
    Sort-Object -Unique

$manifestFiles = Get-ChildItem -LiteralPath $out -File -Filter 'manifesto*.csv'
$changed = 0
foreach ($oldDir in $longDirs) {
    $oldFull = [IO.Path]::GetFullPath($oldDir)
    if (-not $oldFull.StartsWith($origRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Origem fora de originais/: $oldFull"
    }
    $relative = [IO.Path]::GetRelativePath($origRoot, $oldFull)
    $parent = Split-Path -Parent $oldFull
    $digest = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($relative))).Substring(0, 10)
    $newFull = Join-Path $parent "CONC_$digest"
    $newFull = [IO.Path]::GetFullPath($newFull)
    if (-not $newFull.StartsWith($origRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Destino fora de originais/: $newFull"
    }
    if (Test-Path -LiteralPath $newFull) { throw "Destino já existe; operação interrompida: $newFull" }

    $oldRelative = [IO.Path]::GetRelativePath($origRoot, $oldFull)
    $newRelative = [IO.Path]::GetRelativePath($origRoot, $newFull)
    $oldText = [IO.Path]::GetFullPath((Join-Path $textRoot $oldRelative))
    $newText = [IO.Path]::GetFullPath((Join-Path $textRoot $newRelative))
    foreach ($path in @($oldText, $newText)) {
        if (-not $path.StartsWith($textRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
            throw "Caminho de texto fora de textos/: $path"
        }
    }

    Move-Item -LiteralPath $oldFull -Destination $newFull
    if (Test-Path -LiteralPath $oldText) {
        if (Test-Path -LiteralPath $newText) { throw "Destino de textos já existe: $newText" }
        Move-Item -LiteralPath $oldText -Destination $newText
    }

    $oldOrigSlash = ('originais\' + $oldRelative).Replace('\', '/')
    $newOrigSlash = ('originais\' + $newRelative).Replace('\', '/')
    $oldOrigBack = 'originais\' + $oldRelative
    $newOrigBack = 'originais\' + $newRelative
    $oldTextSlash = ('textos\' + $oldRelative).Replace('\', '/')
    $newTextSlash = ('textos\' + $newRelative).Replace('\', '/')
    $oldTextBack = 'textos\' + $oldRelative
    $newTextBack = 'textos\' + $newRelative
    $oldAbsoluteSlash = $oldFull.Replace('\', '/')
    $newAbsoluteSlash = $newFull.Replace('\', '/')
    $oldAbsoluteTextSlash = $oldText.Replace('\', '/')
    $newAbsoluteTextSlash = $newText.Replace('\', '/')

    foreach ($manifest in $manifestFiles) {
        $raw = [IO.File]::ReadAllText($manifest.FullName)
        $raw = $raw.Replace($oldAbsoluteSlash, $newAbsoluteSlash)
        $raw = $raw.Replace($oldFull, $newFull)
        $raw = $raw.Replace($oldAbsoluteTextSlash, $newAbsoluteTextSlash)
        $raw = $raw.Replace($oldText, $newText)
        $raw = $raw.Replace($oldOrigSlash, $newOrigSlash)
        $raw = $raw.Replace($oldOrigBack, $newOrigBack)
        $raw = $raw.Replace($oldTextSlash, $newTextSlash)
        $raw = $raw.Replace($oldTextBack, $newTextBack)
        [IO.File]::WriteAllText($manifest.FullName, $raw, [Text.UTF8Encoding]::new($true))
    }

    if (Test-Path -LiteralPath $newText) {
        $oldHeader = $oldRelative.Replace('\', '/')
        $newHeader = $newRelative.Replace('\', '/')
        Get-ChildItem -LiteralPath $newText -Recurse -File -Filter '*.txt' | ForEach-Object {
            $content = [IO.File]::ReadAllText($_.FullName)
            $content = $content.Replace($oldHeader, $newHeader)
            [IO.File]::WriteAllText($_.FullName, $content, [Text.UTF8Encoding]::new($false))
        }
    }
    $changed++
}

"Diretórios encurtados: $changed"
