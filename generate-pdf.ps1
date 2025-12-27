# CareerForge AI - Presentation PDF Generator
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CareerForge AI Presentation Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$htmlFile = "docs\generate-presentation-pdf.html"
$fullPath = Join-Path $PSScriptRoot $htmlFile

if (Test-Path $fullPath) {
    Write-Host "Success: Presentation HTML file found" -ForegroundColor Green
    Write-Host ""
    
    # Open in default browser
    Write-Host "Opening presentation in your default browser..." -ForegroundColor Yellow
    Start-Process $fullPath
    
    Write-Host ""
    Write-Host "To generate PDF, press Ctrl+P in the browser and:" -ForegroundColor White
    Write-Host "  1. Select 'Save as PDF' as destination" -ForegroundColor Gray
    Write-Host "  2. Set orientation to 'Landscape'" -ForegroundColor Gray
    Write-Host "  3. Click Save" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "Error: HTML file not found" -ForegroundColor Red
    Write-Host "Looking for: $fullPath" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files created:" -ForegroundColor Yellow
Write-Host "  - Markdown: docs\CareerForge-AI-Presentation.md" -ForegroundColor Gray
Write-Host "  - HTML: docs\generate-presentation-pdf.html" -ForegroundColor Gray
Write-Host "  - README: docs\PRESENTATION_README.md" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
