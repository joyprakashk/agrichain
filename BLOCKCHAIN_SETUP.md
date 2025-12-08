# Blockchain Setup Guide

## Prerequisites
1. **MetaMask**: Install browser extension
2. **Sepolia ETH**: Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. **Infura Account**: Get RPC URL from [Infura](https://infura.io/)

## Step 1: Install Dependencies
```bash
cd blockchain
npm install
```

## Step 2: Configure Environment
```bash
# Copy and edit .env file
cp .env.example .env
```

Edit `.env` with your values:
- `SEPOLIA_RPC_URL`: Your Infura Sepolia endpoint
- `PRIVATE_KEY`: Your MetaMask private key (keep secret!)

## Step 3: Compile Contract
```bash
npm run compile
```

## Step 4: Deploy to Sepolia
```bash
npm run deploy
```

**Save the contract address from output!**

## Step 5: Update Backend
Add to `backend/.env`:
```
SEPOLIA_RPC_URL=your_infura_url
BLOCKCHAIN_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=deployed_contract_address
```

## Step 6: Test
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd agrichain-ui && npm run dev`
3. Place an order to test blockchain integration

## API Endpoints
- `POST /api/orders/place` - Place order with blockchain
- `GET /api/orders/:orderId/qr` - Get QR code (authenticated)
- `GET /api/trace/:traceId` - Verify blockchain trace (public)

## Security Notes
- Never commit private keys
- Use environment variables for all secrets
- QR codes contain trace IDs, not sensitive data
- Blockchain hashes are kept server-side only