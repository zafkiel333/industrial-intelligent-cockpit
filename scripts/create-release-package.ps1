param(
    [string]$ReleaseId = (Get-Date -Format 'yyyyMMdd-HHmmss')
)

$ErrorActionPreference = 'Stop'

if ($ReleaseId -notmatch '^\d{8}-\d{6}$') {
    throw "ReleaseId must use yyyyMMdd-HHmmss format. Actual: $ReleaseId"
}

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $ProjectRoot

$RequiredSourceFiles = @(
    'dist-standalone/index.html',
    'dist-microapp/index.html',
    'dist-microapp/scene-library.js',
    'server.ts',
    'package.json',
    'package-lock.json',
    'src/remoteModelShowcase/modelCatalog.ts',
    'src/remoteModelShowcase/diagnosticEngine.ts',
    'src/remoteModelShowcase/connectionRegistry.ts',
    'src/remoteModelShowcase/types.ts'
)

foreach ($RelativePath in $RequiredSourceFiles) {
    if (-not (Test-Path -LiteralPath $RelativePath -PathType Leaf)) {
        throw "Required release file is missing: $RelativePath"
    }
}

$Package = "scene-library-release-$ReleaseId.tar.gz"
if (Test-Path -LiteralPath $Package) {
    throw "Release package already exists and will not be overwritten: $Package"
}

$PackageRoots = @(
    'dist-standalone',
    'dist-microapp',
    'server.ts',
    'package.json',
    'package-lock.json',
    'src/remoteModelShowcase'
)

& tar.exe -czf $Package @PackageRoots
if ($LASTEXITCODE -ne 0) {
    throw "tar failed to create the release package. Exit code: $LASTEXITCODE"
}

$PackageEntries = @(& tar.exe -tzf $Package)
if ($LASTEXITCODE -ne 0) {
    throw "tar failed to list the release package. Exit code: $LASTEXITCODE"
}

foreach ($RelativePath in $RequiredSourceFiles) {
    if ($PackageEntries -notcontains $RelativePath) {
        throw "Release package is missing a runtime file: $RelativePath"
    }
}

$ForbiddenEntries = @($PackageEntries | Where-Object {
    $_ -match '(^|/)(node_modules|\.git|\.env)(/|$)'
})
if ($ForbiddenEntries.Count -gt 0) {
    $ForbiddenEntries | ForEach-Object { Write-Host "FORBIDDEN_ENTRY=$_" }
    throw 'Release package contains a forbidden directory or file.'
}

$PackageInfo = Get-Item -LiteralPath $Package
$PackageHash = (Get-FileHash -LiteralPath $Package -Algorithm SHA256).Hash
$SourceCommit = (& git rev-parse HEAD).Trim()

Write-Host "RELEASE_ID=$ReleaseId"
Write-Host "SOURCE_COMMIT=$SourceCommit"
Write-Host "PACKAGE=$Package"
Write-Host "PACKAGE_SIZE_BYTES=$($PackageInfo.Length)"
Write-Host "PACKAGE_ENTRY_COUNT=$($PackageEntries.Count)"
Write-Host "PACKAGE_SHA256=$PackageHash"
Write-Host 'SERVER_RUNTIME_SOURCES_INCLUDED'
Write-Host 'LOCAL_RELEASE_PACKAGE_READY'
