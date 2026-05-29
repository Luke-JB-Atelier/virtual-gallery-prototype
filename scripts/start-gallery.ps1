$ErrorActionPreference = 'Stop'

$project = 'C:\Users\lukas\Documents\Codex\2026-05-27\vy-e-mi-probl-m-s'
$port = 5189
$url = "http://127.0.0.1:$port/"

function Test-PortOpen {
  param([int]$Port)

  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connect = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
    if (-not $connect.AsyncWaitHandle.WaitOne(350)) {
      return $false
    }
    $client.EndConnect($connect)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

if (-not (Test-PortOpen -Port $port)) {
  Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    "Set-Location -LiteralPath '$project'; npm.cmd run dev -- --port $port --strictPort"
  )
  Start-Sleep -Seconds 2
}

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
