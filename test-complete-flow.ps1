# 🧪 Complete Authentication Flow Test
# Tests: Health → Register → Login → Profile Access

Write-Host ""
Write-Host "🚀 CareerForge AI - Complete Authentication Flow Test" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v1"
$email = "vamsikiran198@gmail.com"
$password = "Vamsi$93525"
$name = "Vamsi Kiran"

$testsPassed = 0
$testsFailed = 0

# Function to display test result
function Show-TestResult {
    param($testName, $success, $details = "")
    if ($success) {
        Write-Host "✅ $testName" -ForegroundColor Green
        if ($details) { Write-Host "   $details" -ForegroundColor Gray }
        $script:testsPassed++
    } else {
        Write-Host "❌ $testName" -ForegroundColor Red
        if ($details) { Write-Host "   $details" -ForegroundColor Yellow }
        $script:testsFailed++
    }
    Write-Host ""
}

# ========================================
# TEST 1: Server Health Check
# ========================================
Write-Host "📋 Test 1: Server Health Check" -ForegroundColor Yellow
Write-Host "   Endpoint: GET /health" -ForegroundColor Gray
Write-Host ""

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get -ErrorAction Stop
    
    if ($health.status -eq "success") {
        Show-TestResult "Server is running" $true "Environment: $($health.environment)"
    } else {
        Show-TestResult "Server health check" $false "Unexpected status: $($health.status)"
        exit 1
    }
} catch {
    Show-TestResult "Server health check" $false "Server is not running. Please run: npm run dev"
    exit 1
}

# ========================================
# TEST 2: User Registration
# ========================================
Write-Host "📋 Test 2: User Registration (with STUDENT+ADMIN roles)" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /api/v1/auth/register" -ForegroundColor Gray
Write-Host "   Email: $email" -ForegroundColor Gray
Write-Host ""

$registerBody = @{
    name = $name
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $registerBody -ErrorAction Stop
    
    if ($registerResponse.status -eq "success") {
        $roles = $registerResponse.data.user.roles
        $hasStudentRole = $roles -contains "STUDENT"
        $hasAdminRole = $roles -contains "ADMIN"
        
        if ($hasStudentRole -and $hasAdminRole) {
            Show-TestResult "User registered with STUDENT+ADMIN roles" $true "Roles: $($roles -join ', ')"
        } elseif ($hasStudentRole) {
            Show-TestResult "User registered but missing ADMIN role" $false "Only has: $($roles -join ', ')"
        } else {
            Show-TestResult "User registered with incorrect roles" $false "Roles: $($roles -join ', ')"
        }
    } else {
        Show-TestResult "User registration" $false $registerResponse.message
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    
    if ($errorResponse.message -match "already exists") {
        Write-Host "⚠️  User already exists - this is OK, will test login instead" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Show-TestResult "User registration" $false $errorResponse.message
    }
}

# ========================================
# TEST 3: User Login
# ========================================
Write-Host "📋 Test 3: User Login" -ForegroundColor Yellow
Write-Host "   Endpoint: POST /api/v1/auth/login" -ForegroundColor Gray
Write-Host "   Email: $email" -ForegroundColor Gray
Write-Host ""

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    
    if ($loginResponse.status -eq "success") {
        $token = $loginResponse.data.token
        $user = $loginResponse.data.user
        $roles = $user.roles
        
        # Check if user has both roles
        $hasStudentRole = $roles -contains "STUDENT"
        $hasAdminRole = $roles -contains "ADMIN"
        
        if ($hasStudentRole -and $hasAdminRole) {
            Show-TestResult "Login successful with STUDENT+ADMIN roles" $true "User: $($user.name) | Roles: $($roles -join ', ')"
        } elseif ($hasStudentRole) {
            Write-Host "⚠️  Login successful but user only has STUDENT role" -ForegroundColor Yellow
            Write-Host "   This means the user was created before the role fix." -ForegroundColor Gray
            Write-Host "   SOLUTION: Delete user and re-register to get ADMIN role." -ForegroundColor Cyan
            Write-Host ""
            Show-TestResult "Login (needs role update)" $false "Only has: $($roles -join ', ')"
        } else {
            Show-TestResult "Login with incorrect roles" $false "Roles: $($roles -join ', ')"
        }
        
        # Save token for next test
        $script:authToken = $token
        
        Write-Host "   Token (first 50 chars): $($token.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host ""
    } else {
        Show-TestResult "User login" $false $loginResponse.message
        exit 1
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    Show-TestResult "User login" $false $errorResponse.message
    exit 1
}

# ========================================
# TEST 4: Get User Profile
# ========================================
Write-Host "📋 Test 4: Get User Profile" -ForegroundColor Yellow
Write-Host "   Endpoint: GET /api/v1/users/profile" -ForegroundColor Gray
Write-Host "   Authorization: Bearer Token" -ForegroundColor Gray
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $authToken"
    "Content-Type" = "application/json"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/users/profile" -Method Get -Headers $headers -ErrorAction Stop
    
    if ($profileResponse.status -eq "success") {
        $profile = $profileResponse.data
        $roles = $profile.roles
        
        Show-TestResult "Profile access successful" $true "ID: $($profile.id)"
        
        Write-Host "   📋 User Profile Details:" -ForegroundColor Cyan
        Write-Host "      ID: $($profile.id)" -ForegroundColor Gray
        Write-Host "      Name: $($profile.name)" -ForegroundColor Gray
        Write-Host "      Email: $($profile.email)" -ForegroundColor Gray
        Write-Host "      Roles: $($roles -join ', ')" -ForegroundColor Gray
        Write-Host "      Email Verified: $($profile.emailVerified)" -ForegroundColor Gray
        Write-Host "      Created: $($profile.createdAt)" -ForegroundColor Gray
        Write-Host ""
        
        # Check roles one more time
        $hasStudentRole = $roles -contains "STUDENT"
        $hasAdminRole = $roles -contains "ADMIN"
        
        if ($hasStudentRole -and $hasAdminRole) {
            Write-Host "   ✅ User has BOTH STUDENT and ADMIN roles!" -ForegroundColor Green
        } elseif ($hasStudentRole) {
            Write-Host "   ⚠️  User only has STUDENT role (missing ADMIN)" -ForegroundColor Yellow
            Write-Host "   💡 To fix: Delete this user and register again" -ForegroundColor Cyan
        }
        Write-Host ""
    } else {
        Show-TestResult "Profile access" $false $profileResponse.message
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    
    Show-TestResult "Profile access" $false "Status $statusCode | $($errorResponse.message)"
    
    Write-Host "   💡 Troubleshooting:" -ForegroundColor Cyan
    Write-Host "      - Check server logs for detailed error" -ForegroundColor Gray
    Write-Host "      - Verify JWT_SECRET in .env file" -ForegroundColor Gray
    Write-Host "      - Try: npx prisma generate" -ForegroundColor Gray
    Write-Host ""
}

# ========================================
# TEST 5: Verify Token
# ========================================
Write-Host "📋 Test 5: Token Verification" -ForegroundColor Yellow
Write-Host "   Running: debug-token.js" -ForegroundColor Gray
Write-Host ""

if (Test-Path "debug-token.js") {
    try {
        $tokenOutput = node debug-token.js $authToken 2>&1 | Out-String
        
        if ($tokenOutput -match "Token signature is VALID") {
            Show-TestResult "Token is valid" $true
        } else {
            Show-TestResult "Token verification" $false "See output above"
        }
        
        # Show relevant token info
        if ($tokenOutput -match "NOT expired") {
            Write-Host "   ✅ Token is not expired" -ForegroundColor Green
        } elseif ($tokenOutput -match "EXPIRED") {
            Write-Host "   ❌ Token is expired" -ForegroundColor Red
        }
        Write-Host ""
    } catch {
        Write-Host "   ⚠️  Could not verify token" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "   ℹ️  debug-token.js not found, skipping token verification" -ForegroundColor Gray
    Write-Host ""
}

# ========================================
# TEST SUMMARY
# ========================================
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ✅ Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "   ❌ Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 All tests passed! Your authentication flow is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Token for Postman:" -ForegroundColor Cyan
    Write-Host "$authToken" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Copy the token above" -ForegroundColor Gray
    Write-Host "   2. Open Postman → Environments" -ForegroundColor Gray
    Write-Host "   3. Save it in the 'token' variable" -ForegroundColor Gray
    Write-Host "   4. Test other endpoints with this token" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  Some tests failed. Review the errors above." -ForegroundColor Yellow
    Write-Host ""
    
    if ($testsFailed -eq 1 -and $testsPassed -ge 3) {
        Write-Host "💡 If only the roles test failed:" -ForegroundColor Cyan
        Write-Host "   The user was created before the role fix was implemented." -ForegroundColor Gray
        Write-Host ""
        Write-Host "   To fix, run these commands:" -ForegroundColor Yellow
        Write-Host "   1. node delete-user.js $email" -ForegroundColor Gray
        Write-Host "   2. Run this test script again" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
