Write-Host "Testing Agri-AI Backend API..." -ForegroundColor Green

# Test 1: Check if server is running
Write-Host "`n1. Testing server status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/" -Method GET
    Write-Host "✓ Server is running: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running or not accessible" -ForegroundColor Red
    exit
}

# Test 2: Seed database
Write-Host "`n2. Seeding database..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/seed-data/" -Method POST
    Write-Host "✓ Database seeded: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to seed database" -ForegroundColor Red
}

# Test 3: Check products
Write-Host "`n3. Checking products..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "http://localhost:8000/products/" -Method GET
    Write-Host "✓ Found $($products.Count) products in database" -ForegroundColor Green
    
    # Show first few products
    $products | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - $($_.name) ($($_.type)) - ₹$($_.price)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Failed to fetch products" -ForegroundColor Red
}

# Test 4: Health check
Write-Host "`n4. Health check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
    Write-Host "✓ Backend is healthy" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed" -ForegroundColor Red
}

Write-Host "`n🎉 Backend testing complete!" -ForegroundColor Green
Write-Host "You can now:" -ForegroundColor White
Write-Host "1. Open http://localhost:8000/docs to see API documentation" -ForegroundColor Cyan
Write-Host "2. Start your frontend with: npm run dev" -ForegroundColor Cyan
Write-Host "3. Test disease detection by uploading images" -ForegroundColor Cyan