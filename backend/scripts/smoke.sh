#!/usr/bin/env bash
# Smoke test for the Foodie API. Assumes the server is running
# (npm run dev) against a migrated + seeded database.
#
# Usage: ./scripts/smoke.sh [base_url]
set -euo pipefail

BASE="${1:-http://localhost:4000}"
EMAIL="smoke+$(date +%s)@test.dev"
PASS="password123"

# Extract a JSON field from stdin using node (no jq needed).
jget() { node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d)$1)}catch(e){console.log('')}})"; }

echo "== GET /health =="
curl -sf "$BASE/health" | jget ".status" | grep -q ok && echo "PASS health"

echo "== POST /api/auth/signup (customer) =="
SIGNUP=$(curl -sf -X POST "$BASE/api/auth/signup" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Smoke Tester\",\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"role\":\"CUSTOMER\"}")
TOKEN=$(echo "$SIGNUP" | jget ".token")
[ -n "$TOKEN" ] && echo "PASS signup"

echo "== POST /api/auth/login =="
LOGIN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN" | jget ".token")
[ -n "$TOKEN" ] && echo "PASS login"

echo "== GET /api/dishes =="
DISHES=$(curl -sf "$BASE/api/dishes?limit=20")
DISH_ID=$(echo "$DISHES" | jget ".data[0].id")
[ -n "$DISH_ID" ] && echo "PASS list dishes (first: $DISH_ID)"
# Order from Priya's Kitchen so maker@foodie.demo sees it as NEW
PRIYA_DISH=$(echo "$DISHES" | jget ".data.find(d=>d.kitchenId==='priya').id")
[ -n "$PRIYA_DISH" ] && DISH_ID="$PRIYA_DISH"

echo "== POST /api/orders (customer) =="
ORDER=$(curl -sf -X POST "$BASE/api/orders" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"items\":[{\"dishId\":\"$DISH_ID\",\"qty\":1}],\"paymentMethod\":\"Apple Pay\",\"pickupSlot\":\"5:00 PM - 7:00 PM\"}")
ORDER_ID=$(echo "$ORDER" | jget ".order.id")
[ -n "$ORDER_ID" ] && echo "PASS create order ($ORDER_ID)"

echo "== GET /api/orders/mine =="
curl -sf -H "Authorization: Bearer $TOKEN" "$BASE/api/orders/mine" \
  | jget ".length" | grep -qE '^[1-9]' && echo "PASS my orders"

echo "== maker login =="
MAKER_LOGIN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"maker@foodie.demo","password":"password123"}')
MAKER_TOKEN=$(echo "$MAKER_LOGIN" | jget ".token")
[ -n "$MAKER_TOKEN" ] && echo "PASS maker login"

echo "== GET /api/maker/orders?status=NEW =="
MAKER_ORDERS=$(curl -sf -H "Authorization: Bearer $MAKER_TOKEN" "$BASE/api/maker/orders?status=NEW")
MORDER_ID=$(echo "$MAKER_ORDERS" | jget "[0].id")
[ -n "$MORDER_ID" ] && echo "PASS maker orders (first NEW: $MORDER_ID)"

echo "== PATCH /api/maker/orders/:id accept =="
curl -sf -X PATCH "$BASE/api/maker/orders/$MORDER_ID" \
  -H "Authorization: Bearer $MAKER_TOKEN" -H 'Content-Type: application/json' \
  -d '{"action":"accept"}' | jget ".status" | grep -q ACTIVE && echo "PASS accept order"

echo "== GET /api/maker/earnings =="
curl -sf -H "Authorization: Bearer $MAKER_TOKEN" "$BASE/api/maker/earnings" \
  | jget ".summary.netCents" | grep -qE '^[0-9]+$' && echo "PASS earnings"

echo "== GET /api/maker/dashboard =="
curl -sf -H "Authorization: Bearer $MAKER_TOKEN" "$BASE/api/maker/dashboard" \
  | jget ".todaySalesCents" | grep -qE '^[0-9]+$' && echo "PASS dashboard"

echo
echo "All smoke tests passed."
