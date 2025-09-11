#!/bin/bash

echo "Testing all pages..."

# Test homepage
echo -n "Testing homepage (/)... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
echo ""

# Test dashboard
echo -n "Testing dashboard (/dashboard)... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard
echo ""

# Test signin
echo -n "Testing signin (/signin)... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/signin
echo ""

# Test test-payment
echo -n "Testing test-payment (/test-payment)... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/test-payment
echo ""

# Test pricing
echo -n "Testing pricing (/pricing)... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/pricing
echo ""

# Test admin-enhanced
echo -n "Testing admin-enhanced (/admin-enhanced)... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin-enhanced
echo ""

# Test session API
echo -n "Testing session API (/api/auth/session)... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/session
echo ""

echo "All tests completed!"