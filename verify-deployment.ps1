# CareerForge AI - Deployment Verification Script
# Run this after deployment to verify everything works

param(
    [Parameter(Mandatory=$true)]
    [string]$FrontendUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl
)

$ErrorActionPreference = "Continue"

Write-Host "🔍 CareerForge AI - Deployment Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Yellow
Write-Host "Backend:  $BackendUrl" -ForegroundColor Yellow
Write-Host ""

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host " ❌ FAIL (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:failed++
            return $false
        }
    } catch {
        Write-Host " ❌ FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:failed++
        return $false
    }
}

Write-Host "📡 Testing Backend API..." -ForegroundColor Cyan
Write-Host ""

# Test backend health
Test-Endpoint -Name "Backend Health" -Url "$BackendUrl/health"
Test-Endpoint -Name "API Health" -Url "$BackendUrl/api/v1/health"

Write-Host ""
Write-Host "🌐 Testing Frontend..." -ForegroundColor Cyan
Write-Host ""

# Test frontend
Test-Endpoint -Name "Frontend Homepage" -Url "$FrontendUrl"
Test-Endpoint -Name "Frontend Assets" -Url "$FrontendUrl/assets" -ExpectedStatus 404

Write-Host ""
Write-Host "🔐 Testing Authentication Endpoints..." -ForegroundColor Cyan
Write-Host ""

# Test auth endpoints (should return 400 without data, not 500)
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/v1/auth/login" -Method Post -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Testing: Login Endpoint... ✅ PASS (validation working)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "Testing: Login Endpoint... ❌ FAIL" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Results:" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 All tests passed! Deployment is successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Register a test user at $FrontendUrl"
    Write-Host "2. Test AI chat functionality"
    Write-Host "3. Complete the deployment checklist"
    Write-Host ""
} else {
    Write-Host "⚠️  Some tests failed. Please check:" -ForegroundColor Yellow
    Write-Host "1. Verify environment variables in Railway/Vercel"
    Write-Host "2. Check CORS_ORIGIN includes frontend URL"
    Write-Host "3. Check VITE_API_URL points to backend URL"
    Write-Host "4. Review deployment logs for errors"
    Write-Host ""
}

Write-Host "📚 For detailed troubleshooting, see:" -ForegroundColor Cyan
Write-Host "   COMPLETE_DEPLOYMENT_GUIDE.md#troubleshooting"
Write-Host ""

# Return exit code based on failures
exit $failed
