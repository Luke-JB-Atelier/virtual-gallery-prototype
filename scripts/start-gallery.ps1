$ErrorActionPreference = 'Stop'

$project = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
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

function Test-CorrectGalleryServer {
  try {
    $marker = Invoke-RestMethod -UseBasicParsing -TimeoutSec 2 -Uri "http://127.0.0.1:$port/tipcore-gallery-runtime.json?tipcore_probe=1"
    return $marker.project -eq 'virtual-gallery-donor-card'
  } catch {
    return $false
  }
}

function Stop-WrongGalleryServer {
  if (Test-CorrectGalleryServer) { return }
  $lines = netstat -ano -p tcp | Select-String "127\.0\.0\.1:$port\s+\S+\s+LISTENING\s+(\d+)"
  foreach ($line in $lines) {
    $pidText = $line.Matches[0].Groups[1].Value
    if ($pidText) {
      try {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $pidText" -ErrorAction Stop
        $commandLine = [string]$process.CommandLine
        $isGalleryVite = $commandLine -match 'node_modules[\\/]+vite' -and $commandLine -match 'Virtual Gallery (Prototype|Donor Card)|virtual-gallery-prototype'
        if ($isGalleryVite) {
          taskkill.exe /PID $pidText /T /F | Out-Null
        }
      } catch {
      }
    }
  }
}

Stop-WrongGalleryServer

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
