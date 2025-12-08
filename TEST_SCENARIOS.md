# AgriChain Blockchain Testing Scenarios

## 🧪 Test Scenario 1: Complete Order Flow

### Prerequisites
- Backend server running on port 8080
- Frontend server running on port 5173
- Contract deployed: `0x380837AA48429Af8142500715c9dDa4AA639e3a1`

### Steps
1. **Consumer Registration**
   - Navigate to `/consumerloginpage`
   - Register new consumer account
   - Verify login successful

2. **Browse Products**
   - Navigate to `/buyproduce`
   - Select a product from catalog
   - Click to view details

3. **Place Order**
   - Add product to cart
   - Proceed to checkout
   - Fill delivery address
   - Select payment method
   - Click "Place Order"

4. **Verify Blockchain Integration**
   - Check order success page shows QR code
   - Verify blockchain trace ID displayed
   - Confirm "Blockchain Verified" status

5. **Access Order History**
   - Navigate to consumer dashboard
   - View recent orders
   - Click "View QR Code" button
   - Verify QR modal displays correctly

## 🧪 Test Scenario 2: QR Code Verification

### Steps
1. **Get Trace ID**
   - From order success page or dashboard
   - Copy the blockchain hash

2. **Verify Trace**
   - Navigate to `/verify`
   - Paste trace ID in input field
   - Click "Verify" button

3. **Check Results**
   - Verify success message appears
   - Check product details match
   - Confirm farmer address shown
   - Verify timestamp is correct

## 🧪 Test Scenario 3: Error Handling

### Invalid Trace ID
- Enter invalid hash in verification
- Verify error message displays
- Check network error handling

### Missing Authentication
- Try accessing QR endpoint without login
- Verify 401 error handling

### Blockchain Service Down
- Test with invalid RPC URL
- Verify graceful degradation

## ✅ Expected Results

### Successful Order
- Unique blockchain hash generated
- QR code contains trace ID
- Order stored in Firestore with trace ID
- QR accessible only after authentication

### Successful Verification
- Blockchain data retrieved correctly
- Product details match order
- Farmer address verified
- Immutable timestamp confirmed

## 🔍 Debugging Tips

### Backend Logs
```bash
cd backend && npm start
# Watch for blockchain service initialization
# Check for order placement logs
# Monitor QR generation
```

### Frontend Console
- Check network requests in DevTools
- Verify API responses
- Monitor error messages

### Blockchain Explorer
- Visit [Sepolia Etherscan](https://sepolia.etherscan.io/)
- Search contract: `0x380837AA48429Af8142500715c9dDa4AA639e3a1`
- Verify transactions appear