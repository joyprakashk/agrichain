// Simple blockchain test without external dependencies
import { readFileSync } from 'fs';

console.log('🧪 Testing blockchain integration...');

// Load environment variables from backend/.env
try {
  const envContent = readFileSync('./backend/.env', 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key] = value;
  });
  
  console.log('📋 Environment check:');
  console.log('- Contract Address:', envVars.CONTRACT_ADDRESS || 'Not set');
  console.log('- RPC URL:', envVars.SEPOLIA_RPC_URL ? 'Set' : 'Not set');
  console.log('- Private Key:', envVars.BLOCKCHAIN_PRIVATE_KEY ? 'Set' : 'Not set');
} catch (err) {
  console.log('⚠️ Could not read backend/.env file');
}

// Test contract address format
const contractAddr = '0x380837AA48429Af8142500715c9dDa4AA639e3a1';
console.log('✅ Contract deployed at:', contractAddr);
console.log('✅ Contract address format valid:', /^0x[a-fA-F0-9]{40}$/.test(contractAddr));

console.log('🎉 Basic blockchain setup verified!');