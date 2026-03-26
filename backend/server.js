import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import multer from "multer";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import BlockchainService from "./blockchain.js";
import QRCode from "qrcode";
import { createServer } from "http";
import { Server } from "socket.io";
import adminRoutes from './routes/adminRoutes.js';
import os from 'os';

dotenv.config();

// Helper function to get local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '0.0.0.0';
}

// Initialize blockchain service
let blockchainService = null;
let blockchainInitialized = false;

const initBlockchain = async () => {
  try {
    if (process.env.CONTRACT_ADDRESS && process.env.SEPOLIA_RPC_URL && process.env.BLOCKCHAIN_PRIVATE_KEY) {
      console.log("🔗 Initializing blockchain with:");
      console.log("- Contract:", process.env.CONTRACT_ADDRESS);
      console.log("- RPC URL:", process.env.SEPOLIA_RPC_URL);

      blockchainService = new BlockchainService();
      const initialized = await blockchainService.initialize();
      
      if (initialized) {
        const provider = blockchainService.provider;
        const network = await provider.getNetwork();
        console.log("🌐 Connected to network:", network.name, "(chainId:", network.chainId, ")");
        
        const balance = await provider.getBalance(blockchainService.wallet.address);
        console.log("💰 Wallet balance:", ethers.formatEther(balance), "ETH");
        
        blockchainInitialized = true;
        console.log("✅ Blockchain service initialized successfully");
      } else {
        console.log("⚠️ Blockchain service initialization failed");
      }
    } else {
      console.log("⚠️ Blockchain env vars missing - running without blockchain");
    }
  } catch (err) {
    console.error("❌ Blockchain initialization failed:", err.message);
    blockchainInitialized = false;
  }
};

// Initialize blockchain service
initBlockchain();

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------
// 🔹 Load Firebase Service Account
// ----------------------------
let serviceAccount = null;
try {
  const saPath = path.join(__dirname, "serviceAccountKey.json");
  const raw = fs.readFileSync(saPath, "utf8");
  serviceAccount = JSON.parse(raw);
  console.log("✅ serviceAccountKey.json loaded successfully");
} catch (err) {
  console.error("❌ serviceAccountKey.json missing or invalid:", err);
  process.exit(1);
}

// ----------------------------
// 🔹 Initialize Firebase Admin
// ----------------------------
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized successfully");
} catch (err) {
  console.error("❌ Firebase initialization failed:", err);
  process.exit(1);
}

const db = admin.firestore();

// ----------------------------
// 🔹 Express Setup
// ----------------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// ----------------------------
// 🔹 Gmail Setup
// ----------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
});

// ----------------------------
// 🧩 Local Image Upload
// ----------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    const PORT = process.env.PORT || 8080;
    const localIp = getLocalIp();
    const imageUrl = `http://${localIp}:${PORT}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/admin', adminRoutes);

// ============================
// 🧪 TEST ENDPOINT
// ============================
app.get("/api/test", (req, res) => {
  res.status(200).json({ 
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      retailerRegister: "/api/retailer/register",
      retailerLogin: "/api/retailer/login",
      retailerDetails: "/api/retailer/:email",
      farmerRegister: "/api/farmers/register",
      farmerLogin: "/api/verifyToken",
      allProduce: "/api/market/all-produce",
      transferToRetailer: "/api/farmer/transfer-to-retailer"
    }
  });
});

// ============================
// 👨‍🌾 FARMER ROUTES
// ============================

// 🧾 Register Farmer
app.post("/api/farmers/register", async (req, res) => {
  try {
    const { fullName, aadhaar, email, password, walletAddress, farmerPrivateKey } = req.body;
    if (!fullName || !aadhaar || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const farmerRef = db.collection("farmers").doc(email);
    const farmerSnap = await farmerRef.get();
    if (farmerSnap.exists)
      return res.status(400).json({ message: "Farmer already exists" });

    // Register on blockchain if available
    let blockchainTx = null;
    if (blockchainService && blockchainInitialized && walletAddress && farmerPrivateKey) {
      try {
        blockchainTx = await blockchainService.registerFarmer(fullName, aadhaar, farmerPrivateKey);
        console.log("✅ Farmer registered on blockchain");
      } catch (blockchainError) {
        console.warn("⚠️ Blockchain registration failed:", blockchainError.message);
      }
    }

    await farmerRef.set({
      fullName,
      aadhaar,
      email,
      password,
      walletAddress: walletAddress || "",
      registeredAt: new Date().toISOString(),
      blockchainTxHash: blockchainTx ? blockchainTx.hash : null,
      dashboard: {
        totalBatches: 0,
        inTransit: 0,
        delivered: 0,
        successRate: "0%",
      },
    });

    res.status(200).json({ message: "Farmer registered successfully", blockchainTx });
  } catch (err) {
    console.error("❌ Error registering farmer:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🔑 Farmer Login
app.post("/api/verifyToken", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const farmerRef = db.collection("farmers").doc(email);
    const farmerSnap = await farmerRef.get();

    if (!farmerSnap.exists)
      return res.status(404).json({ message: "Farmer not found" });

    const farmerData = farmerSnap.data();
    if (farmerData.password !== password)
      return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      farmer: {
        email: farmerData.email,
        fullName: farmerData.fullName,
        walletAddress: farmerData.walletAddress,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🌾 Register Produce (Enhanced with Supply Chain)
app.post("/api/farmer/register-produce", async (req, res) => {
  try {
    const { email, produceName, quantity, harvestDate, imageUrl, price, category, sourceLocation, farmerPrivateKey } = req.body;
    if (!email || !produceName || !quantity || !harvestDate)
      return res.status(400).json({ message: "Missing fields" });

    const farmerRef = db.collection("farmers").doc(email);
    const farmerDoc = await farmerRef.get();
    if (!farmerDoc.exists)
      return res.status(404).json({ message: "Farmer not found" });

    const farmerData = farmerDoc.data();

    // Generate blockchain trace and QR code for produce
    let traceId = null;
    let qrCode = null;
    let blockchainOrder = null;

    if (blockchainService && blockchainInitialized && farmerPrivateKey) {
      try {
        const metadata = JSON.stringify({ 
          farmer: email, 
          harvestDate, 
          price, 
          category, 
          sourceLocation,
          farmerName: farmerData.fullName
        });
        
        blockchainOrder = await blockchainService.registerOrder(
          produceName,
          parseInt(quantity),
          metadata,
          farmerPrivateKey
        );
        
        traceId = blockchainOrder.traceId;
        qrCode = await blockchainService.generateSupplyChainQR(traceId);
        console.log("✅ Blockchain trace created for produce:", traceId);
      } catch (blockchainError) {
        console.error("⚠️ Blockchain failed for produce:", blockchainError.message);
      }
    }

    const produceDoc = await farmerRef.collection("produce").add({
      produceName,
      quantity: parseInt(quantity),
      harvestDate,
      price: price || "",
      category: category || "Uncategorized",
      imageUrl: imageUrl || "",
      sourceLocation: sourceLocation || null,
      status: "harvested",
      traceId: traceId ? traceId.toString() : null,
      qrCode: qrCode || null,
      createdAt: new Date().toISOString(),
      currentStage: "harvested",
      supplyChain: {
        harvested: {
          timestamp: new Date().toISOString(),
          location: sourceLocation || farmerData.farmLocation || "Farm",
          actor: farmerData.fullName,
          notes: "Harvested from farm"
        },
        packaged: null,
        inTransitToRetailer: null,
        receivedByRetailer: null,
        stored: null,
        listedForSale: null,
        purchased: null,
        delivered: null
      },
      retailerId: null,
      retailerDetails: null,
      availableForPurchase: false,
      blockchainTxHash: blockchainOrder?.receipt?.hash || null
    });

    const updatedTotal = (farmerData.dashboard?.totalBatches || 0) + 1;
    await farmerRef.update({
      "dashboard.totalBatches": updatedTotal,
    });

    res.status(200).json({
      message: "Produce registered successfully",
      produceId: produceDoc.id,
      traceId: traceId ? traceId.toString() : null,
      qrCode: qrCode || null
    });
  } catch (err) {
    console.error("❌ Produce registration error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 📊 Farmer Dashboard
app.post("/api/farmer/dashboard", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const farmerRef = db.collection("farmers").doc(email);
    const farmerDoc = await farmerRef.get();
    if (!farmerDoc.exists)
      return res.status(404).json({ message: "Farmer not found" });

    const produceSnap = await farmerRef.collection("produce").get();
    const produceList = produceSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const total = produceList.length;
    const delivered = produceList.filter((p) => p.status === "delivered").length;
    const inTransit = produceList.filter((p) => p.status === "inTransitToRetailer" || p.status === "transit_to_retailer").length;
    const successRate = total > 0 ? `${Math.round((delivered / total) * 100)}%` : "0%";

    const farmerData = {
      ...farmerDoc.data(),
      dashboard: { totalBatches: total, delivered, inTransit, successRate },
      batches: produceList,
    };

    res.status(200).json({ farmerData });
  } catch (err) {
    console.error("❌ Error fetching dashboard:", err);
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});

// 📦 Farmer updates produce to packaged
app.post("/api/farmer/update-packaged", async (req, res) => {
  try {
    const { email, produceId, farmerPrivateKey } = req.body;
    if (!email || !produceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const produceRef = db.collection("farmers").doc(email).collection("produce").doc(produceId);
    const produceDoc = await produceRef.get();
    
    if (!produceDoc.exists) {
      return res.status(404).json({ message: "Produce not found" });
    }

    const produceData = produceDoc.data();
    
    // Update blockchain
    let blockchainTx = null;
    if (blockchainService && blockchainInitialized && produceData.traceId && farmerPrivateKey) {
      try {
        blockchainTx = await blockchainService.updateToPackaged(produceData.traceId, farmerPrivateKey);
        console.log("✅ Blockchain updated: product packaged");
      } catch (blockchainError) {
        console.warn("⚠️ Blockchain update failed:", blockchainError.message);
      }
    }
    
    // Update Firestore
    await produceRef.update({
      status: "packaged",
      currentStage: "packaged",
      "supplyChain.packaged": {
        timestamp: new Date().toISOString(),
        actor: "Farmer",
        notes: "Produce packaged and ready for dispatch"
      },
      blockchainTxHash: blockchainTx?.hash || produceData.blockchainTxHash
    });
    
    res.status(200).json({ message: "Produce marked as packaged", blockchainTx });
  } catch (err) {
    console.error("❌ Error updating produce status:", err);
    res.status(500).json({ message: "Failed to update produce status" });
  }
});

// 🚚 Transfer produce to retailer (ADDED BETTER LOGGING)
app.post("/api/farmer/transfer-to-retailer", async (req, res) => {
  try {
    console.log("📦 Transfer to retailer request received");
    console.log("Request body:", req.body);
    
    const { email, produceId, retailerEmail, farmerPrivateKey } = req.body;
    
    // Log each field for debugging
    console.log("Fields:", {
      email: email || "MISSING",
      produceId: produceId || "MISSING",
      retailerEmail: retailerEmail || "MISSING",
      farmerPrivateKey: farmerPrivateKey ? "[SET]" : "[NOT SET]"
    });
    
    if (!email || !produceId || !retailerEmail) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        message: "Missing required fields",
        missing: {
          email: !email,
          produceId: !produceId,
          retailerEmail: !retailerEmail
        }
      });
    }
    
    // Get retailer details
    const retailerRef = db.collection("retailers").doc(retailerEmail);
    const retailerDoc = await retailerRef.get();
    
    if (!retailerDoc.exists) {
      console.log("❌ Retailer not found:", retailerEmail);
      return res.status(404).json({ message: "Retailer not found" });
    }
    
    const retailerData = retailerDoc.data();
    const produceRef = db.collection("farmers").doc(email).collection("produce").doc(produceId);
    const produceDoc = await produceRef.get();
    
    if (!produceDoc.exists) {
      console.log("❌ Produce not found:", produceId);
      return res.status(404).json({ message: "Produce not found" });
    }
    
    const produceData = produceDoc.data();
    
    // Update Firestore
    await produceRef.update({
      retailerId: retailerEmail,
      retailerDetails: {
        name: retailerData.name,
        transferredDate: new Date().toISOString(),
        status: "in_transit"
      },
      status: "in_transit_to_retailer",
      currentStage: "inTransitToRetailer",
      "supplyChain.inTransitToRetailer": {
        timestamp: new Date().toISOString(),
        retailer: retailerData.name,
        retailerAddress: retailerData.walletAddress,
        notes: "Produce dispatched to retailer"
      }
    });
    
    // Update retailer's received products count
    await retailerRef.update({
      totalProductsReceived: admin.firestore.FieldValue.increment(1)
    });
    
    console.log("✅ Product transferred successfully");
    res.status(200).json({ message: "Produce transferred to retailer successfully" });
  } catch (err) {
    console.error("❌ Error transferring to retailer:", err);
    res.status(500).json({ message: "Failed to transfer produce", error: err.message });
  }
});

// ============================
// 🏪 RETAILER ROUTES
// ============================

// Register Retailer
app.post("/api/retailer/register", async (req, res) => {
  try {
    console.log("📝 Retailer registration request received");
    const { name, email, phone, address, gstNumber, licenseNumber, ownerName, walletAddress, retailerPrivateKey, password } = req.body;
    
    if (!name || !email || !licenseNumber || !password) {
      return res.status(400).json({ 
        message: "Name, email, license number, and password are required",
        received: { name: !!name, email: !!email, licenseNumber: !!licenseNumber, password: !!password }
      });
    }
    
    const retailerRef = db.collection("retailers").doc(email);
    const retailerSnap = await retailerRef.get();
    
    if (retailerSnap.exists) {
      return res.status(400).json({ message: "Retailer already registered" });
    }
    
    // Register on blockchain
    let blockchainTx = null;
    let blockchainRetailerInfo = null;
    
    if (blockchainService && blockchainInitialized && walletAddress && retailerPrivateKey) {
      try {
        blockchainTx = await blockchainService.registerRetailer(name, licenseNumber, gstNumber || "", retailerPrivateKey);
        console.log("✅ Retailer registered on blockchain");
        blockchainRetailerInfo = await blockchainService.getRetailerInfo(walletAddress);
      } catch (blockchainError) {
        console.warn("⚠️ Blockchain registration failed:", blockchainError.message);
      }
    }
    
    const retailerData = {
      name,
      email,
      phone: phone || "",
      address: address || {},
      gstNumber: gstNumber || "",
      licenseNumber,
      ownerName: ownerName || "",
      walletAddress: walletAddress || "",
      password,
      isVerified: true,
      registeredAt: new Date().toISOString(),
      blockchainTxHash: blockchainTx ? blockchainTx.hash : null,
      blockchainInfo: blockchainRetailerInfo,
      totalProductsReceived: 0,
      totalProductsSold: 0,
      totalOrders: 0,
      rating: 0,
      totalRatings: 0,
      status: "active"
    };
    
    await retailerRef.set(retailerData);
    console.log("✅ Retailer saved to Firestore:", email);
    
    // Remove password from response
    const { password: _, ...retailerResponse } = retailerData;
    
    res.status(200).json({ 
      success: true,
      message: "Retailer registered successfully", 
      retailer: retailerResponse, 
      blockchainTx 
    });
  } catch (err) {
    console.error("❌ Retailer registration error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Retailer Login
app.post("/api/retailer/login", async (req, res) => {
  try {
    console.log("🔑 Retailer login request received for:", req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    
    const retailerRef = db.collection("retailers").doc(email);
    const retailerDoc = await retailerRef.get();
    
    if (!retailerDoc.exists) {
      return res.status(404).json({ message: "Retailer not found" });
    }
    
    const retailerData = retailerDoc.data();
    
    if (retailerData.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const { password: _, ...retailerResponse } = retailerData;
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    console.log("✅ Retailer login successful:", email);
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      retailer: retailerResponse,
      token: token
    });
  } catch (err) {
    console.error("❌ Retailer login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get Retailer Details
app.get("/api/retailer/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const retailerRef = db.collection("retailers").doc(email);
    const retailerDoc = await retailerRef.get();
    
    if (!retailerDoc.exists) {
      return res.status(404).json({ message: "Retailer not found" });
    }
    
    const retailerData = retailerDoc.data();
    const { password: _, ...retailerResponse } = retailerData;
    
    let blockchainInfo = null;
    if (blockchainService && blockchainInitialized && retailerData.walletAddress) {
      blockchainInfo = await blockchainService.getRetailerInfo(retailerData.walletAddress);
    }
    
    res.status(200).json({ retailer: retailerResponse, blockchainInfo });
  } catch (err) {
    console.error("❌ Error fetching retailer:", err);
    res.status(500).json({ message: "Failed to fetch retailer" });
  }
});

// Get All Retailers
app.get("/api/retailers/all", async (req, res) => {
  try {
    const retailersSnap = await db.collection("retailers").get();
    const retailers = [];
    retailersSnap.forEach(doc => {
      const data = doc.data();
      const { password: _, ...retailerData } = data;
      retailers.push({ id: doc.id, ...retailerData });
    });
    res.status(200).json({ retailers });
  } catch (err) {
    console.error("❌ Error fetching retailers:", err);
    res.status(500).json({ message: "Failed to fetch retailers" });
  }
});

// Get produce by retailer
app.get("/api/retailer/:email/produce", async (req, res) => {
  try {
    const { email } = req.params;
    const farmersSnap = await db.collection("farmers").get();
    const produceList = [];
    
    for (const farmerDoc of farmersSnap.docs) {
      const produceSnap = await db.collection("farmers")
        .doc(farmerDoc.id)
        .collection("produce")
        .where("retailerId", "==", email)
        .get();
      
      produceSnap.forEach(produceDoc => {
        produceList.push({
          id: produceDoc.id,
          farmerId: farmerDoc.id,
          farmerName: farmerDoc.data().fullName,
          ...produceDoc.data()
        });
      });
    }
    
    res.status(200).json({ produce: produceList });
  } catch (err) {
    console.error("❌ Error fetching retailer produce:", err);
    res.status(500).json({ message: "Failed to fetch produce" });
  }
});

// Retailer receives produce
app.post("/api/retailer/receive-produce", async (req, res) => {
  try {
    const { retailerEmail, produceId, farmerEmail, inspectionStatus, qualityNotes, storageLocation } = req.body;
    
    if (!retailerEmail || !produceId || !farmerEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const retailerRef = db.collection("retailers").doc(retailerEmail);
    const retailerDoc = await retailerRef.get();
    if (!retailerDoc.exists) {
      return res.status(404).json({ message: "Retailer not found" });
    }
    
    const retailerData = retailerDoc.data();
    const produceRef = db.collection("farmers").doc(farmerEmail).collection("produce").doc(produceId);
    const produceDoc = await produceRef.get();
    
    if (!produceDoc.exists) {
      return res.status(404).json({ message: "Produce not found" });
    }
    
    await produceRef.update({
      "retailerDetails.receivedDate": new Date().toISOString(),
      "retailerDetails.inspectionStatus": inspectionStatus || "passed",
      "retailerDetails.qualityNotes": qualityNotes || "",
      "retailerDetails.storageLocation": storageLocation || "",
      status: "received_by_retailer",
      currentStage: "receivedByRetailer",
      "supplyChain.receivedByRetailer": {
        timestamp: new Date().toISOString(),
        retailer: retailerData.name,
        inspectionStatus: inspectionStatus || "passed",
        qualityNotes: qualityNotes || "",
        storageLocation: storageLocation || ""
      }
    });
    
    res.status(200).json({ message: "Produce received successfully" });
  } catch (err) {
    console.error("❌ Error receiving produce:", err);
    res.status(500).json({ message: "Failed to receive produce" });
  }
});

// Retailer stores produce
app.post("/api/retailer/store-produce", async (req, res) => {
  try {
    const { retailerEmail, produceId, farmerEmail, storageConditions } = req.body;
    
    const produceRef = db.collection("farmers").doc(farmerEmail).collection("produce").doc(produceId);
    const produceDoc = await produceRef.get();
    
    if (!produceDoc.exists) {
      return res.status(404).json({ message: "Produce not found" });
    }
    
    await produceRef.update({
      status: "stored",
      currentStage: "storedInRetail",
      "supplyChain.stored": {
        timestamp: new Date().toISOString(),
        storageConditions: storageConditions || "Standard storage",
        notes: "Product stored in retail facility"
      }
    });
    
    res.status(200).json({ message: "Produce stored successfully" });
  } catch (err) {
    console.error("❌ Error storing produce:", err);
    res.status(500).json({ message: "Failed to store produce" });
  }
});

// Retailer lists produce for sale
app.post("/api/retailer/list-produce", async (req, res) => {
  try {
    const { retailerEmail, produceId, farmerEmail, price, unit, discountPrice } = req.body;
    
    if (!retailerEmail || !produceId || !farmerEmail || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const retailerRef = db.collection("retailers").doc(retailerEmail);
    const retailerDoc = await retailerRef.get();
    const retailerData = retailerDoc.data();
    
    const produceRef = db.collection("farmers").doc(farmerEmail).collection("produce").doc(produceId);
    const produceDoc = await produceRef.get();
    
    if (!produceDoc.exists) {
      return res.status(404).json({ message: "Produce not found" });
    }
    
    await produceRef.update({
      "retailerDetails.priceAtRetail": `₹${price}/${unit || 'kg'}`,
      "retailerDetails.discountPrice": discountPrice ? `₹${discountPrice}` : null,
      "retailerDetails.listedDate": new Date().toISOString(),
      currentStage: "listedForSale",
      availableForPurchase: true,
      price: price,
      unit: unit || 'kg',
      "supplyChain.listedForSale": {
        timestamp: new Date().toISOString(),
        price: price,
        unit: unit || 'kg',
        retailer: retailerData.name,
        discountPrice: discountPrice || null
      }
    });
    
    res.status(200).json({ message: "Produce listed for sale successfully" });
  } catch (err) {
    console.error("❌ Error listing produce:", err);
    res.status(500).json({ message: "Failed to list produce" });
  }
});

// ============================
// 🧑‍🤝‍🧑 CONSUMER ROUTES
// ============================
app.post("/api/consumer/register", async (req, res) => {
  try {
    const { phoneNumber, email, fullName, userType, location, coordinates, language } = req.body;
    if (!phoneNumber && !email)
      return res.status(400).json({ message: "Phone or Email required" });

    const consumerId = phoneNumber || email;
    const consumerRef = db.collection("consumers").doc(consumerId);
    const consumerSnap = await consumerRef.get();

    if (consumerSnap.exists) {
      return res.status(200).json({ message: "Consumer already exists", consumer: consumerSnap.data() });
    }

    const consumerData = {
      fullName: fullName || "",
      userType: userType || "",
      location: location || "",
      coordinates: coordinates || null,
      language: language || "",
      phoneNumber: phoneNumber || "",
      email: email || "",
      registeredAt: new Date().toISOString(),
    };

    await consumerRef.set(consumerData);
    res.status(200).json({ message: "Consumer registered successfully", consumer: consumerData });
  } catch (err) {
    console.error("❌ Consumer registration error:", err);
    res.status(500).json({ message: "Consumer registration failed" });
  }
});

// ============================
// 🧺 MARKET ROUTE — Fetch All Produce
// ============================
app.get("/api/market/all-produce", async (req, res) => {
  try {
    console.log("📡 Fetching all produce from market...");
    
    const farmersSnap = await db.collection("farmers").get();
    let allProduce = [];

    for (const farmerDoc of farmersSnap.docs) {
      const farmerEmail = farmerDoc.id;
      const farmerData = farmerDoc.data();

      const produceSnap = await db
        .collection("farmers")
        .doc(farmerEmail)
        .collection("produce")
        .get();

      produceSnap.forEach((produceDoc) => {
        allProduce.push({
          id: produceDoc.id,
          farmerEmail,
          farmerName: farmerData.fullName || "Unknown Farmer",
          ...produceDoc.data(),
        });
      });
    }

    console.log(`✅ Found ${allProduce.length} produce items`);
    res.status(200).json({ allProduce });
  } catch (err) {
    console.error("❌ Error fetching all produce:", err);
    res.status(500).json({ message: "Failed to fetch produce" });
  }
});

// Get all produce available for purchase
app.get("/api/market/available-produce", async (req, res) => {
  try {
    const farmersSnap = await db.collection("farmers").get();
    const availableProduce = [];
    
    for (const farmerDoc of farmersSnap.docs) {
      const produceSnap = await db.collection("farmers")
        .doc(farmerDoc.id)
        .collection("produce")
        .where("availableForPurchase", "==", true)
        .get();
      
      produceSnap.forEach(produceDoc => {
        availableProduce.push({
          id: produceDoc.id,
          farmerId: farmerDoc.id,
          farmerName: farmerDoc.data().fullName,
          ...produceDoc.data()
        });
      });
    }
    
    res.status(200).json({ produce: availableProduce });
  } catch (err) {
    console.error("❌ Error fetching available produce:", err);
    res.status(500).json({ message: "Failed to fetch produce" });
  }
});

// ============================
// 🔍 ENHANCED TRACE ENDPOINT
// ============================
app.get("/api/trace/:traceId", async (req, res) => {
  try {
    const { traceId } = req.params;
    console.log("🔍 Tracing ID:", traceId);
    
    const farmersSnap = await db.collection("farmers").get();
    
    for (const farmerDoc of farmersSnap.docs) {
      const farmerData = farmerDoc.data();
      const produceSnap = await db.collection("farmers")
        .doc(farmerDoc.id)
        .collection("produce")
        .where("traceId", "==", traceId)
        .get();
      
      if (!produceSnap.empty) {
        const produceDoc = produceSnap.docs[0];
        const produceData = produceDoc.data();
        
        let retailerInfo = null;
        if (produceData.retailerId) {
          const retailerDoc = await db.collection("retailers").doc(produceData.retailerId).get();
          if (retailerDoc.exists) {
            retailerInfo = retailerDoc.data();
          }
        }
        
        return res.status(200).json({
          traceId: traceId,
          farmer: farmerData.fullName,
          productName: produceData.produceName,
          quantity: produceData.quantity?.toString() || "0",
          harvestDate: produceData.harvestDate,
          currentStage: produceData.currentStage || "harvested",
          supplyChain: produceData.supplyChain || {},
          retailer: retailerInfo,
          retailerDetails: produceData.retailerDetails,
          priceAtRetail: produceData.retailerDetails?.priceAtRetail,
          availableForPurchase: produceData.availableForPurchase || false,
          verified: true
        });
      }
    }
    
    return res.status(200).json({
      traceId: traceId,
      farmer: "Demo Farmer",
      productName: "Demo Product",
      quantity: "10",
      currentStage: "harvested",
      verified: true,
      isDemo: true
    });
  } catch (err) {
    console.error("❌ Trace verification error:", err);
    res.status(500).json({ message: "Error verifying trace" });
  }
});

// ============================
// 📱 QR CODE ENDPOINTS
// ============================
app.get("/api/qr-codes", async (req, res) => {
  try {
    const farmersSnap = await db.collection("farmers").get();
    let allQRCodes = [];
    
    for (const farmerDoc of farmersSnap.docs) {
      const produceSnap = await db.collection("farmers")
        .doc(farmerDoc.id)
        .collection("produce")
        .where("qrCode", "!=", null)
        .get();
      
      produceSnap.forEach((produceDoc) => {
        const data = produceDoc.data();
        if (data.qrCode && data.traceId) {
          allQRCodes.push({
            id: produceDoc.id,
            produceName: data.produceName,
            farmerName: farmerDoc.data().fullName,
            traceId: data.traceId,
            qrCode: data.qrCode,
            harvestDate: data.harvestDate,
            currentStage: data.currentStage,
            price: data.retailerDetails?.priceAtRetail || data.price,
            createdAt: data.createdAt
          });
        }
      });
    }
    
    res.status(200).json({ qrCodes: allQRCodes });
  } catch (err) {
    console.error("❌ Error fetching QR codes:", err);
    res.status(500).json({ message: "Failed to fetch QR codes" });
  }
});

app.get("/api/test/qr", async (req, res) => {
  try {
    const testHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const qrCode = await QRCode.toDataURL(testHash, {
      width: 256,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    res.status(200).json({ message: "Test QR generated", traceId: testHash, qrCode });
  } catch (err) {
    console.error("❌ Test QR generation failed:", err);
    res.status(500).json({ message: "Failed to generate test QR" });
  }
});

// ============================
// 🔌 SOCKET.IO REAL-TIME TRACKING
// ============================
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const activeSimulations = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  
  socket.on("join_tracking", (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined: ${orderId}`);
  });
  
  socket.on("start_simulation", ({ orderId, source, destination }) => {
    if (!source || !destination) return;
    if (activeSimulations.has(orderId)) return;
    
    let step = 0;
    const totalSteps = 100;
    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const lat = source.lat + (destination.lat - source.lat) * progress;
      const lng = source.lng + (destination.lng - source.lng) * progress;
      
      io.to(orderId).emit("location_update", {
        position: { lat, lng },
        status: step < totalSteps ? "In Transit 🚚" : "Delivered ✅"
      });
      
      if (step >= totalSteps) {
        clearInterval(interval);
        activeSimulations.delete(orderId);
      }
    }, 500);
    
    activeSimulations.set(orderId, interval);
  });
  
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ============================
// 🚀 Start Server
// ============================
const PORT = process.env.PORT || 8080;
const localIp = getLocalIp();

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`📡 Local:   http://localhost:${PORT}`);
  console.log(`📡 Network: http://${localIp}:${PORT}`);
  console.log(`\n📱 Make sure your phone is on the same Wi-Fi network`);
  console.log(`🔗 Use the Network URL above to connect from your phone\n`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /api/test - Test endpoint`);
  console.log(`   GET  /api/market/all-produce - Get all produce`);
  console.log(`   GET  /api/market/available-produce - Get produce for sale`);
  console.log(`   POST /api/retailer/register - Register retailer`);
  console.log(`   POST /api/retailer/login - Retailer login`);
  console.log(`   POST /api/farmers/register - Register farmer`);
  console.log(`   POST /api/verifyToken - Farmer login`);
  console.log(`   POST /api/farmer/transfer-to-retailer - Transfer produce to retailer`);
});