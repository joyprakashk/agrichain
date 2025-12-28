import dotenv from "dotenv";
import BlockchainService from "./blockchain.js";

dotenv.config();

async function testBlockchain() {
  console.log("🧪 Testing blockchain service...");
  
  try {
    const blockchainService = new BlockchainService();
    
    console.log("📝 Registering test order...");
    const traceId = await blockchainService.registerOrder(
      "Test Potato",
      10,
      JSON.stringify({ test: true, timestamp: Date.now() })
    );
    
    console.log("✅ Trace ID returned:", traceId);
    console.log("📏 Length:", traceId.length, "chars");
    console.log("🔍 Type:", typeof traceId);
    
    // Test QR generation
    const qrCode = await blockchainService.generateQRCode(traceId);
    console.log("📱 QR Code generated:", qrCode ? "✅" : "❌");
    
    // Test blockchain query
    console.log("🔍 Querying blockchain for trace ID...");
    const orderDetails = await blockchainService.getOrderDetails(traceId);
    console.log("📋 Order details:", orderDetails);
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
  
  process.exit(0);
}

testBlockchain();