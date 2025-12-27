# CareerForge AI - Presentation PDF Generator
# This script helps you convert the presentation HTML to PDF

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CareerForge AI Presentation Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$htmlFile = "docs\generate-presentation-pdf.html"
$fullPath = Join-Path $PSScriptRoot $htmlFile

if (Test-Path $fullPath) {
    Write-Host "✓ Presentation HTML file found" -ForegroundColor Green
    Write-Host ""
    
    # Open in default browser
    Write-Host "Opening presentation in your default browser..." -ForegroundColor Yellow
    Start-Process $fullPath
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "How to Generate PDF:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Method 1: Browser Print (Easiest)" -ForegroundColor White
    Write-Host "  1. Press Ctrl+P in the opened browser window" -ForegroundColor Gray
    Write-Host "  2. Select 'Save as PDF' as destination" -ForegroundColor Gray
    Write-Host "  3. Set orientation to 'Landscape'" -ForegroundColor Gray
    Write-Host "  4. Click Save" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Method 2: Chrome Command Line" -ForegroundColor White
    $chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    $outputPdf = Join-Path $PSScriptRoot "docs\CareerForge-AI-Presentation.pdf"
    
    if (Test-Path $chromePath) {
        Write-Host "  Chrome detected. Run this command:" -ForegroundColor Gray
        Write-Host '  & "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --print-to-pdf=".\docs\CareerForge-AI-Presentation.pdf" ".\docs\generate-presentation-pdf.html"' -ForegroundColor Cyan
    } else {
        Write-Host "  Chrome not found at default location" -ForegroundColor Gray
    }
    Write-Host ""
    
    Write-Host "Method 3: Microsoft Edge" -ForegroundColor White
    $edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    if (Test-Path $edgePath) {
        Write-Host "  Edge detected. Run this command:" -ForegroundColor Gray
        Write-Host '  & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --print-to-pdf=".\docs\CareerForge-AI-Presentation.pdf" ".\docs\generate-presentation-pdf.html"' -ForegroundColor Cyan
    } else {
        Write-Host "  Edge not found at default location" -ForegroundColor Gray
    }
    
} else {
    Write-Host "✗ Error: HTML file not found at $htmlFile" -ForegroundColor Red
    Write-Host "  Current directory: $PSScriptRoot" -ForegroundColor Red
    Write-Host "  Looking for: $fullPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Additional Resources:" -ForegroundColor Yellow
Write-Host "  - Markdown version: docs\CareerForge-AI-Presentation.md" -ForegroundColor Gray
Write-Host "  - HTML version: docs\generate-presentation-pdf.html" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
