# 🧪 Test Complete Profile Access Flow
# This script tests the entire authentication and profile access flow

Write-Host "🚀 CareerForge AI - Profile Access Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v1"
$email = "vamsikiran198@gmail.com"
$password = "Vamsi$93525"

# Step 1: Check Server Health
Write-Host "Step 1: Checking server health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Server is NOT running!" -ForegroundColor Red
    Write-Host "   Please run: npm run dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Step 2: Login
Write-Host "Step 2: Logging in..." -ForegroundColor Yellow
Write-Host "   Email: $email" -ForegroundColor Gray
Write-Host "   Password: $password" -ForegroundColor Gray

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    
    if ($loginResponse.status -eq "success") {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        $token = $loginResponse.data.token
        Write-Host "   User: $($loginResponse.data.user.name)" -ForegroundColor Gray
        Write-Host "   Email: $($loginResponse.data.user.email)" -ForegroundColor Gray
        Write-Host "   Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        Write-Host "   $($loginResponse.message)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Login request failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

# Step 3: Verify Token
Write-Host "Step 3: Verifying token..." -ForegroundColor Yellow
try {
    $verifyOutput = node debug-token.js $token 2>&1 | Out-String
    
    if ($verifyOutput -match "Token signature is VALID") {
        Write-Host "✅ Token is valid!" -ForegroundColor Green
        
        if ($verifyOutput -match "NOT expired") {
            Write-Host "✅ Token is not expired" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Token might be expired" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Token verification failed!" -ForegroundColor Red
        Write-Host "$verifyOutput" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "⚠️ Could not verify token (debug-token.js might not exist)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 4: Test Profile Access
Write-Host "Step 4: Testing profile access..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method Get -Headers $headers -ErrorAction Stop
    
    if ($profileResponse.status -eq "success") {
        Write-Host "✅ Profile access successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 User Profile:" -ForegroundColor Cyan
        Write-Host "   ID: $($profileResponse.data.id)" -ForegroundColor Gray
        Write-Host "   Name: $($profileResponse.data.name)" -ForegroundColor Gray
        Write-Host "   Email: $($profileResponse.data.email)" -ForegroundColor Gray
        Write-Host "   Roles: $($profileResponse.data.roles -join ', ')" -ForegroundColor Gray
        Write-Host "   Email Verified: $($profileResponse.data.emailVerified)" -ForegroundColor Gray
        Write-Host "   Created: $($profileResponse.data.createdAt)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎉 All tests passed! Your authentication is working correctly!" -ForegroundColor Green
    } else {
        Write-Host "❌ Profile access failed!" -ForegroundColor Red
        Write-Host "   $($profileResponse.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Profile access failed!" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Yellow
        
        switch ($statusCode) {
            401 { Write-Host "   → Token is invalid or missing" -ForegroundColor Yellow }
            403 { Write-Host "   → Token is malformed or expired" -ForegroundColor Yellow }
            500 { Write-Host "   → Server error (check server logs)" -ForegroundColor Yellow }
            default { Write-Host "   → Unexpected error" -ForegroundColor Yellow }
        }
    }
    
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    
    # Show troubleshooting tips
    Write-Host "💡 Troubleshooting Tips:" -ForegroundColor Cyan
    Write-Host "   1. Check server logs for detailed error message" -ForegroundColor Gray
    Write-Host "   2. Verify database is working: node check-users.js" -ForegroundColor Gray
    Write-Host "   3. Check JWT_SECRET in .env file" -ForegroundColor Gray
    Write-Host "   4. Try regenerating Prisma client: npx prisma generate" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📖 For detailed troubleshooting, see: FIX_PROFILE_ERROR.md" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ Test Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   - Copy the token above and use it in Postman" -ForegroundColor Gray
Write-Host "   - Save it in Postman Environment as 'token' variable" -ForegroundColor Gray
Write-Host "   - Test other endpoints with this token" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Token for Postman:" -ForegroundColor Cyan
Write-Host "$token" -ForegroundColor Green
Write-Host ""
