import { ethers } from "ethers";
import QRCode from "qrcode";

const CONTRACT_ABI = [
  "function registerOrder(string memory _productName, uint256 _quantity, string memory _orderData) external",
  "function getOrder(bytes32 _traceId) external view returns (tuple(bytes32 traceId, address farmer, string productName, uint256 quantity, uint256 timestamp, string status, bool exists))",
  "function updateStatus(bytes32 _traceId, string memory _newStatus) external",
  "function orderCount() external view returns (uint256)",
  "event OrderRegistered(bytes32 indexed traceId, address indexed farmer, string productName, uint256 quantity)"
];

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
  }

  async registerOrder(productName, quantity, orderData) {
    try {
      console.log("🔗 Registering order:", { productName, quantity });
      
      // Generate trace ID before transaction
      const traceId = ethers.keccak256(
        ethers.toUtf8Bytes(`${productName}-${quantity}-${Date.now()}-${Math.random()}`)
      );
      
      const tx = await this.contract.registerOrder(productName, quantity, orderData);
      console.log("📝 Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);
      
      // Return the generated trace ID
      return traceId;
    } catch (error) {
      console.error("❌ Blockchain registration failed:", error.message);
      throw new Error(`Blockchain registration failed: ${error.message}`);
    }
  }

  async generateQRCode(traceId) {
    try {
      // QR contains the blockchain hash directly for scanning
      const qrData = traceId.toString();
      return await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error("QR generation error:", error);
      throw error;
    }
  }

  async getOrderDetails(traceId) {
    try {
      const result = await this.contract.getOrder(traceId);
      return {
        traceId: result.traceId,
        farmer: result.farmer,
        productName: result.productName,
        quantity: result.quantity,
        timestamp: result.timestamp,
        status: result.status,
        exists: result.exists
      };
    } catch (error) {
      console.error("Blockchain query error:", error);
      throw error;
    }
  }
}

export default BlockchainService;