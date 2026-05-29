$ErrorActionPreference = 'Stop'

$url = 'https://lukasjanbalek-bit.github.io/virtual-gallery-prototype/'

$chromeCandidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)
$chromePath = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if ($chromePath) {
  Start-Process -FilePath $chromePath -ArgumentList @('--new-window', $url)
} else {
  Start-Process $url
}
