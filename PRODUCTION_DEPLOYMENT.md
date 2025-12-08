# AgriChain Production Deployment Guide

## 🚀 Production Environment Setup

### 1. Backend Production Configuration

#### Environment Variables (.env.production)
```bash
# Server Configuration
PORT=8080
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/agrichain-prod

# Email Service (Production Gmail)
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password

# Blockchain Configuration (Mainnet)
SEPOLIA_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
BLOCKCHAIN_PRIVATE_KEY=YOUR_PRODUCTION_PRIVATE_KEY
CONTRACT_ADDRESS=YOUR_DEPLOYED_MAINNET_CONTRACT_ADDRESS
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Security
JWT_SECRET=your-super-secure-jwt-secret-256-bits
CORS_ORIGIN=https://your-domain.com
```

#### Firebase Production Setup
1. Create production Firebase project
2. Generate new service account key
3. Replace `serviceAccountKey.json` with production credentials
4. Update Firestore security rules for production

### 2. Frontend Production Configuration

#### Update API URLs
```javascript
// src/config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.your-domain.com' 
  : 'http://localhost:8080';

export default API_BASE_URL;
```

#### Build Configuration
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Blockchain Mainnet Deployment

#### Deploy Smart Contract to Mainnet
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network mainnet
```

#### Update Contract Configuration
- Replace `CONTRACT_ADDRESS` with mainnet deployment address
- Update `SEPOLIA_RPC_URL` to mainnet RPC URL
- Use production private key with sufficient ETH for gas fees

### 4. Server Deployment Options

#### Option A: AWS EC2 + PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "agrichain-backend"
pm2 startup
pm2 save
```

#### Option B: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

#### Option C: Vercel/Netlify
- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy to Railway/Render/Heroku

### 5. Database Production Setup

#### MongoDB Atlas Configuration
1. Create production cluster
2. Configure IP whitelist
3. Set up database users with proper permissions
4. Enable backup and monitoring

#### Firestore Production Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Farmers can only access their own data
    match /farmers/{farmerId} {
      allow read, write: if request.auth != null && request.auth.token.email == farmerId;
    }
    
    // Consumers can only access their own orders
    match /consumers/{consumerId}/orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Security Hardening

#### Backend Security
```javascript
// Add to server.js
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

#### Environment Security
- Use AWS Secrets Manager or similar for sensitive data
- Enable HTTPS/SSL certificates
- Configure proper CORS policies
- Implement API authentication middleware

### 7. Monitoring & Logging

#### Application Monitoring
```javascript
// Add logging middleware
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Blockchain Monitoring
- Monitor contract events
- Track gas usage
- Set up alerts for failed transactions

### 8. Performance Optimization

#### Frontend Optimization
- Enable code splitting
- Implement lazy loading
- Optimize images and assets
- Use CDN for static files

#### Backend Optimization
- Implement Redis caching
- Database query optimization
- Connection pooling
- Load balancing

### 9. Backup & Recovery

#### Database Backups
- Automated MongoDB Atlas backups
- Firestore export scheduling
- Regular backup testing

#### Code & Configuration Backups
- Git repository with production branch
- Environment variable backups
- Smart contract source code backup

### 10. Deployment Checklist

- [ ] Update all environment variables
- [ ] Deploy smart contract to mainnet
- [ ] Configure production Firebase project
- [ ] Set up production database
- [ ] Configure SSL certificates
- [ ] Test all API endpoints
- [ ] Verify blockchain integration
- [ ] Test QR code generation
- [ ] Configure monitoring and alerts
- [ ] Set up backup procedures
- [ ] Update DNS records
- [ ] Perform security audit

## 🔧 Quick Production Setup Commands

```bash
# 1. Backend Setup
cd backend
cp .env .env.production
# Edit .env.production with production values
npm install --production
npm start

# 2. Frontend Setup  
cd ../agrichain-ui
npm install
npm run build
npm run preview

# 3. Blockchain Setup
cd ../blockchain
npm install
npx hardhat run scripts/deploy.cjs --network mainnet
```

## 📞 Support & Maintenance

- Monitor application logs daily
- Check blockchain transaction status
- Update dependencies regularly
- Perform security audits quarterly
- Backup verification monthly

---
**Note**: Always test thoroughly in staging environment before production deployment.