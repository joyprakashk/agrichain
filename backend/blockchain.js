import { ethers } from "ethers";
import QRCode from "qrcode";

// Complete Contract ABI for AgriChainTrace
const CONTRACT_ABI = [
  // Farmer Registration
  "function registerFarmer(string memory _name, string memory _aadhaarHash) external",
  "function getFarmer(address _farmer) external view returns (string memory name, string memory aadhaarHash, bool isVerified, uint256 registeredAt, uint256 totalProducts, uint256 totalDelivered)",
  "function isRegisteredFarmer(address) external view returns (bool)",
  
  // Retailer Registration
  "function registerRetailer(string memory _name, string memory _licenseNumber, string memory _gstNumber) external",
  "function getRetailer(address _retailer) external view returns (string memory name, string memory licenseNumber, string memory gstNumber, bool isVerified, uint256 registeredAt, uint256 totalProductsReceived, uint256 totalProductsSold, uint256 rating, uint256 totalRatings)",
  "function isRegisteredRetailer(address) external view returns (bool)",
  
  // Order Management
  "function registerOrder(string memory _productName, uint256 _quantity, string memory _metadata) external returns (bytes32)",
  "function getOrder(bytes32 _traceId) external view returns (bytes32 traceId, address farmer, address retailer, address consumer, string productName, uint256 quantity, uint256 timestamp, uint256 price, uint8 currentStage, string[] memory stageHistory, uint256[] memory stageTimestamps, string metadata)",
  "function getCurrentStageName(bytes32 _traceId) external view returns (string memory)",
  "function getStageCount(bytes32 _traceId) external view returns (uint256)",
  "function getStageByIndex(bytes32 _traceId, uint256 _index) external view returns (string memory, uint256)",
  "function isAvailableForPurchase(bytes32 _traceId) external view returns (bool)",
  "function getOrderStatus(bytes32 _traceId) external view returns (string memory)",
  
  // Supply Chain Actions
  "function updateToPackaged(bytes32 _traceId) external",
  "function transferToRetailer(bytes32 _traceId, address _retailer) external",
  "function receiveProduct(bytes32 _traceId, string memory _inspectionStatus) external",
  "function storeProduct(bytes32 _traceId) external",
  "function listProductForSale(bytes32 _traceId, uint256 _price) external",
  "function purchaseProduct(bytes32 _traceId) external payable",
  "function deliverProduct(bytes32 _traceId) external",
  "function completeOrder(bytes32 _traceId) external",
  
  // Query Functions
  "function getFarmerOrders(address _farmer) external view returns (bytes32[] memory)",
  "function getRetailerOrders(address _retailer) external view returns (bytes32[] memory)",
  
  // Events
  "event FarmerRegistered(address indexed farmer, string name, uint256 timestamp)",
  "event RetailerRegistered(address indexed retailer, string name, string licenseNumber, uint256 timestamp)",
  "event OrderRegistered(bytes32 indexed traceId, address indexed farmer, string productName, uint256 timestamp)",
  "event OrderTransferredToRetailer(bytes32 indexed traceId, address indexed retailer, uint256 timestamp)",
  "event OrderReceivedByRetailer(bytes32 indexed traceId, address indexed retailer, string inspectionStatus, uint256 timestamp)",
  "event OrderListedForSale(bytes32 indexed traceId, address indexed retailer, uint256 price, uint256 timestamp)",
  "event OrderPurchased(bytes32 indexed traceId, address indexed consumer, uint256 price, uint256 timestamp)",
  "event StageUpdated(bytes32 indexed traceId, uint8 newStage, uint256 timestamp)",
  "event OrderDelivered(bytes32 indexed traceId, address indexed consumer, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Check if already initialized
      if (this.initialized && this.provider && this.contract) {
        return true;
      }
      
      // Initialize provider
      const rpcUrl = process.env.SEPOLIA_RPC_URL;
      if (!rpcUrl) {
        console.error("❌ SEPOLIA_RPC_URL not set");
        return false;
      }
      
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize wallet
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
      if (!privateKey) {
        console.error("❌ BLOCKCHAIN_PRIVATE_KEY not set");
        return false;
      }
      
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Initialize contract
      const contractAddress = process.env.CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.error("❌ CONTRACT_ADDRESS not set");
        return false;
      }
      
      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.wallet);
      this.initialized = true;
      
      console.log("✅ Blockchain service initialized successfully");
      console.log(`   Contract: ${contractAddress}`);
      console.log(`   Wallet: ${this.wallet.address}`);
      
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize blockchain service:", error.message);
      return false;
    }
  }

  // ============================
  // FARMER REGISTRATION
  // ============================
  
  async registerFarmer(name, aadhaarHash, farmerPrivateKey) {
    try {
      await this.initialize();
      
      const farmerWallet = new ethers.Wallet(farmerPrivateKey, this.provider);
      const contractWithFarmer = this.contract.connect(farmerWallet);
      
      const tx = await contractWithFarmer.registerFarmer(name, aadhaarHash);
      const receipt = await tx.wait();
      
      console.log(`✅ Farmer registered: ${name} (${farmerWallet.address})`);
      console.log(`   Transaction: ${receipt.hash}`);
      
      return receipt;
    } catch (error) {
      console.error("❌ Error registering farmer:", error.message);
      throw error;
    }
  }
  
  async getFarmerInfo(farmerAddress) {
    try {
      await this.initialize();
      
      const farmerInfo = await this.contract.getFarmer(farmerAddress);
      return {
        name: farmerInfo[0],
        aadhaarHash: farmerInfo[1],
        isVerified: farmerInfo[2],
        registeredAt: new Date(Number(farmerInfo[3]) * 1000).toISOString(),
        totalProducts: Number(farmerInfo[4]),
        totalDelivered: Number(farmerInfo[5])
      };
    } catch (error) {
      console.error("❌ Error getting farmer info:", error.message);
      return null;
    }
  }
  
  async isFarmerRegistered(farmerAddress) {
    try {
      await this.initialize();
      return await this.contract.isRegisteredFarmer(farmerAddress);
    } catch (error) {
      console.error("❌ Error checking farmer registration:", error.message);
      return false;
    }
  }

  // ============================
  // RETAILER REGISTRATION
  // ============================
  
  async registerRetailer(name, licenseNumber, gstNumber, retailerPrivateKey) {
    try {
      await this.initialize();
      
      const retailerWallet = new ethers.Wallet(retailerPrivateKey, this.provider);
      const contractWithRetailer = this.contract.connect(retailerWallet);
      
      const tx = await contractWithRetailer.registerRetailer(name, licenseNumber, gstNumber);
      const receipt = await tx.wait();
      
      console.log(`✅ Retailer registered: ${name} (${retailerWallet.address})`);
      console.log(`   Transaction: ${receipt.hash}`);
      
      return receipt;
    } catch (error) {
      console.error("❌ Error registering retailer:", error.message);
      throw error;
    }
  }
  
  async getRetailerInfo(retailerAddress) {
    try {
      await this.initialize();
      
      const retailerInfo = await this.contract.getRetailer(retailerAddress);
      return {
        name: retailerInfo[0],
        licenseNumber: retailerInfo[1],
        gstNumber: retailerInfo[2],
        isVerified: retailerInfo[3],
        registeredAt: new Date(Number(retailerInfo[4]) * 1000).toISOString(),
        totalProductsReceived: Number(retailerInfo[5]),
        totalProductsSold: Number(retailerInfo[6]),
        rating: Number(retailerInfo[7]),
        totalRatings: Number(retailerInfo[8])
      };
    } catch (error) {
      console.error("❌ Error getting retailer info:", error.message);
      return null;
    }
  }
  
  async isRetailerRegistered(retailerAddress) {
    try {
      await this.initialize();
      return await this.contract.isRegisteredRetailer(retailerAddress);
    } catch (error) {
      console.error("❌ Error checking retailer registration:", error.message);
      return false;
    }
  }

  // ============================
  // ORDER MANAGEMENT
  // ============================
  
  async registerOrder(productName, quantity, metadata, farmerPrivateKey) {
    try {
      await this.initialize();
      
      const farmerWallet = new ethers.Wallet(farmerPrivateKey, this.provider);
      const contractWithFarmer = this.contract.connect(farmerWallet);
      
      console.log("🔗 Registering order:", { productName, quantity });
      
      const tx = await contractWithFarmer.registerOrder(productName, quantity, metadata);
      console.log("📝 Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);
      
      // Extract trace ID from the OrderRegistered event
      const orderRegisteredEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed && parsed.name === 'OrderRegistered';
        } catch {
          return false;
        }
      });
      
      if (orderRegisteredEvent) {
        const parsed = this.contract.interface.parseLog(orderRegisteredEvent);
        const traceId = parsed.args.traceId;
        console.log("✅ Blockchain order registered:", traceId);
        return { traceId, receipt };
      }
      
      throw new Error("OrderRegistered event not found in transaction receipt");
    } catch (error) {
      console.error("❌ Blockchain registration failed:", error.message);
      throw new Error(`Blockchain registration failed: ${error.message}`);
    }
  }
  
  async getOrderDetails(traceId) {
    try {
      await this.initialize();
      
      const result = await this.contract.getOrder(traceId);
      return {
        traceId: result[0],
        farmer: result[1],
        retailer: result[2],
        consumer: result[3],
        productName: result[4],
        quantity: Number(result[5]),
        timestamp: new Date(Number(result[6]) * 1000).toISOString(),
        price: Number(result[7]),
        currentStage: Number(result[8]),
        stageHistory: result[9],
        stageTimestamps: result[10].map(ts => new Date(Number(ts) * 1000).toISOString()),
        metadata: result[11]
      };
    } catch (error) {
      console.error("❌ Blockchain query error:", error.message);
      throw error;
    }
  }
  
  async getOrderStatus(traceId) {
    try {
      await this.initialize();
      return await this.contract.getOrderStatus(traceId);
    } catch (error) {
      console.error("❌ Error getting order status:", error.message);
      return null;
    }
  }
  
  async isAvailableForPurchase(traceId) {
    try {
      await this.initialize();
      return await this.contract.isAvailableForPurchase(traceId);
    } catch (error) {
      console.error("❌ Error checking availability:", error.message);
      return false;
    }
  }
  
  async getSupplyChainEvents(traceId) {
    try {
      await this.initialize();
      
      const count = await this.contract.getStageCount(traceId);
      const events = [];
      
      for (let i = 0; i < count; i++) {
        const event = await this.contract.getStageByIndex(traceId, i);
        events.push({
          name: event[0],
          timestamp: new Date(Number(event[1]) * 1000).toISOString()
        });
      }
      
      return events;
    } catch (error) {
      console.error("❌ Error getting supply chain events:", error.message);
      return [];
    }
  }
  
  async getFarmerOrders(farmerAddress) {
    try {
      await this.initialize();
      const orders = await this.contract.getFarmerOrders(farmerAddress);
      return orders;
    } catch (error) {
      console.error("❌ Error getting farmer orders:", error.message);
      return [];
    }
  }
  
  async getRetailerOrders(retailerAddress) {
    try {
      await this.initialize();
      const orders = await this.contract.getRetailerOrders(retailerAddress);
      return orders;
    } catch (error) {
      console.error("❌ Error getting retailer orders:", error.message);
      return [];
    }
  }

  // ============================
  // SUPPLY CHAIN ACTIONS
  // ============================
  
  async updateToPackaged(traceId, farmerPrivateKey) {
    try {
      await this.initialize();
      
      const farmerWallet = new ethers.Wallet(farmerPrivateKey, this.provider);
      const contractWithFarmer = this.contract.connect(farmerWallet);
      
      const tx = await contractWithFarmer.updateToPackaged(traceId);
      const receipt = await tx.wait();
      
      console.log(`✅ Product packaged: ${traceId}`);
      return receipt;
    } catch (error) {
      console.error("❌ Error updating to packaged:", error.message);
      throw error;
    }
  }
  
  async transferToRetailer(traceId, retailerAddress, farmerPrivateKey) {
    try {
      await this.initialize();
      
      const farmerWallet = new ethers.Wallet(farmerPrivateKey, this.provider);
      const contractWithFarmer = this.contract.connect(farmerWallet);
      
      const tx = await contractWithFarmer.transferToRetailer(traceId, retailerAddress);
      const receipt = await tx.wait();
      
      console.log(`✅ Product transferred to retailer: ${retailerAddress}`);
      return receipt;
    } catch (error) {
      console.error("❌ Error transferring to retailer:", error.message);
      throw error;
    }
  }
  
  async receiveProduct(traceId, inspectionStatus, retailerPrivateKey) {
    try {
      await this.initialize();
      
      const retailerWallet = new ethers.Wallet(retailerPrivateKey, this.provider);
      const contractWithRetailer = this.contract.connect(retailerWallet);
      
      const tx = await contractWithRetailer.receiveProduct(traceId, inspectionStatus);
      const receipt = await tx.wait();
      
      console.log(`✅ Product received by retailer: ${traceId}`);
      return receipt;
    } catch (error) {
      console.error("❌ Error receiving product:", error.message);
      throw error;
    }
  }
  
  async storeProduct(traceId, retailerPrivateKey) {
    try {
      await this.initialize();
      
      const retailerWallet = new ethers.Wallet(retailerPrivateKey, this.provider);
      const contractWithRetailer = this.contract.connect(retailerWallet);
      
      const tx = await contractWithRetailer.storeProduct(traceId);
      const receipt = await tx.wait();
      
      console.log(`✅ Product stored: ${traceId}`);
      return receipt;
    } catch (error) {
      console.error("❌ Error storing product:", error.message);
      throw error;
    }
  }
  
  async listProductForSale(traceId, price, retailerPrivateKey) {
    try {
      await this.initialize();
      
      const retailerWallet = new ethers.Wallet(retailerPrivateKey, this.provider);
      const contractWithRetailer = this.contract.connect(retailerWallet);
      
      const tx = await contractWithRetailer.listProductForSale(traceId, price);
      const receipt = await tx.wait();
      
      console.log(`✅ Product listed for sale: ${traceId} at ${price} wei`);
      return receipt;
    } catch (error) {
      console.error("❌ Error listing product for sale:", error.message);
      throw error;
    }
  }
  
  async purchaseProduct(traceId, consumerPrivateKey, price) {
    try {
      await this.initialize();
      
      const consumerWallet = new ethers.Wallet(consumerPrivateKey, this.provider);
      const contractWithConsumer = this.contract.connect(consumerWallet);
      
      const tx = await contractWithConsumer.purchaseProduct(traceId, {
        value: price,
        gasLimit: 3000000
      });
      const receipt = await tx.wait();
      
      console.log(`✅ Product purchased: ${traceId}`);
      return receipt;
    } catch (error) {
      console.error("❌ Error purchasing product:", error.message);
      throw error;
    }
  }
  
  async deliverProduct(traceId, actorPrivateKey) {
    try {
      await this.initialize();
      
      const actorWallet = new ethers.Wallet(actorPrivateKey, this.provider);
      const contractWithActor = this.contract.connect(actorWallet);
      
      const tx = await contractWithActor.deliverProduct(traceId);
      const receipt = await tx.wait();
      
      console.log(`✅ Product delivered: ${traceId}`);
      return receipt;
    } catch (error) {
      console.error("❌ Error delivering product:", error.message);
      throw error;
    }
  }
  
  async completeOrder(traceId, farmerPrivateKey) {
    try {
      await this.initialize();
      
      const farmerWallet = new ethers.Wallet(farmerPrivateKey, this.provider);
      const contractWithFarmer = this.contract.connect(farmerWallet);
      
      const tx = await contractWithFarmer.completeOrder(traceId);
      const receipt = await tx.wait();
      
      console.log(`✅ Order completed: ${traceId}`);
      return receipt;
    } catch (error) {
      console.error("❌ Error completing order:", error.message);
      throw error;
    }
  }

  // ============================
  // QR CODE GENERATION
  // ============================
  
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
  
  async generateSupplyChainQR(traceId) {
    try {
      // Generate QR with full supply chain data URL
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const qrData = `${baseUrl}/#/verify/${traceId}`;
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
}

export default BlockchainService;