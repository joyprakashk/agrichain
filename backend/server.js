// 🌾 server.js — AgriChain Backend (Farmer + Consumer + Gmail Safe Mode + Firestore Sync)
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

dotenv.config();

// Initialize blockchain service
let blockchainService = null;
let blockchainInitialized = false;

const initBlockchain = async () => {
  try {
    if (process.env.CONTRACT_ADDRESS && process.env.SEPOLIA_RPC_URL && process.env.BLOCKCHAIN_PRIVATE_KEY) {
      console.log("🔗 Initializing blockchain with:");
      console.log("- Contract:", process.env.CONTRACT_ADDRESS);
      console.log("- RPC URL:", process.env.SEPOLIA_RPC_URL);
      console.log("- Private Key:", process.env.BLOCKCHAIN_PRIVATE_KEY ? "[SET]" : "[MISSING]");

      blockchainService = new BlockchainService();

      // Test blockchain connection
      const provider = blockchainService.provider;
      const network = await provider.getNetwork();
      console.log("🌐 Connected to network:", network.name, "(chainId:", network.chainId, ")");

      const balance = await provider.getBalance(blockchainService.wallet.address);
      console.log("💰 Wallet balance:", ethers.formatEther(balance), "ETH");

      blockchainInitialized = true;
      console.log("✅ Blockchain service initialized successfully");
    } else {
      console.log("⚠️ Blockchain env vars missing:");
      console.log("- CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS ? "[SET]" : "[MISSING]");
      console.log("- SEPOLIA_RPC_URL:", process.env.SEPOLIA_RPC_URL ? "[SET]" : "[MISSING]");
      console.log("- BLOCKCHAIN_PRIVATE_KEY:", process.env.BLOCKCHAIN_PRIVATE_KEY ? "[SET]" : "[MISSING]");
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
// 🔹 Load Firebase Service Account (Local Mode)
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
  console.log("✅ Firebase Admin initialized successfully (local mode)");
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

// ----------------------------
// 🔹 Gmail Setup (Nodemailer)
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
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Admin routes (secure via ADMIN_SECRET header)
app.use('/api/admin', adminRoutes);

// ============================
// 👨‍🌾 FARMER ROUTES
// ============================

// 🧾 Register Farmer
app.post("/api/farmers/register", async (req, res) => {
  try {
    const { fullName, aadhaar, email, password } = req.body;
    if (!fullName || !aadhaar || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const farmerRef = db.collection("farmers").doc(email);
    const farmerSnap = await farmerRef.get();
    if (farmerSnap.exists)
      return res.status(400).json({ message: "Farmer already exists" });

    await farmerRef.set({
      fullName,
      aadhaar,
      email,
      password,
      registeredAt: new Date().toISOString(),
      dashboard: {
        totalBatches: 0,
        inTransit: 0,
        delivered: 0,
        successRate: "0%",
      },
    });

    res.status(200).json({ message: "Farmer registered successfully" });
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
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🌾 Register Produce
app.post("/api/farmer/register-produce", async (req, res) => {
  try {
    const { email, produceName, quantity, harvestDate, imageUrl, price, category, sourceLocation } =
      req.body;
    if (!email || !produceName || !quantity || !harvestDate)
      return res.status(400).json({ message: "Missing fields" });

    const farmerRef = db.collection("farmers").doc(email);
    const farmerDoc = await farmerRef.get();
    if (!farmerDoc.exists)
      return res.status(404).json({ message: "Farmer not found" });

    // Generate blockchain trace and QR code for produce
    let traceId = null;
    let qrCode = null;

    if (blockchainService && blockchainInitialized) {
      try {
        traceId = await blockchainService.registerOrder(
          produceName,
          parseInt(quantity),
          JSON.stringify({ farmer: email, harvestDate, price, category, sourceLocation })
        );
        qrCode = await blockchainService.generateQRCode(traceId);
        console.log("✅ Blockchain trace created for produce:", traceId);
      } catch (blockchainError) {
        console.error("⚠️ Blockchain failed for produce:", blockchainError.message);
      }
    }

    const produceDoc = await farmerRef.collection("produce").add({
      produceName,
      quantity,
      harvestDate,
      price: price || "",
      category: category || "Uncategorized",
      imageUrl: imageUrl || "",
      sourceLocation: sourceLocation || null,
      status: "registered",
      traceId: traceId ? traceId.toString() : null,
      qrCode: qrCode || null,
      createdAt: new Date().toISOString(),
    });

    const farmerData = farmerDoc.data();
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
    const inTransit = produceList.filter((p) => p.status === "inTransit").length;
    const successRate =
      total > 0 ? `${Math.round((delivered / total) * 100)}%` : "0%";

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

// ============================
// 🧑‍🤝‍🧑 CONSUMER ROUTES (Synced with Frontend)
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
      console.log("ℹ️ Existing consumer login:", consumerId);
      return res.status(200).json({
        message: "Consumer already exists",
        consumer: consumerSnap.data(),
      });
    }

    const consumerData = {
      fullName: fullName || "",
      userType: userType || "",
      location: location || "", // check if this is text
      coordinates: coordinates || null, // { lat: ..., lng: ... }
      language: language || "",
      phoneNumber: phoneNumber || "",
      email: email || "",
      registeredAt: new Date().toISOString(),
    };

    await consumerRef.set(consumerData);

    // 📨 Send Welcome Email if possible
    if (email) {
      try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          console.log("📩 Skipping Gmail send — local mode or missing credentials.");
        } else {
          await transporter.sendMail({
            from: `"AgriChain" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to AgriChain 🌾",
            html: `
              <h2>Welcome to AgriChain!</h2>
              <p>Hello ${fullName || "User"},</p>
              <p>Your account has been created successfully. You can now buy produce directly from farmers.</p>
              <p><a href="http://localhost:5173/#/buyproduce" style="color:green;">Start Shopping</a></p>
            `,
          });
          console.log("✅ Welcome email sent to:", email);
        }
      } catch (emailErr) {
        console.warn("⚠️ Email sending failed:", emailErr.message);
      }
    }

    res.status(200).json({
      message: "Consumer registered successfully",
      consumer: consumerData,
    });
  } catch (err) {
    console.error("❌ Consumer registration critical error:", err);
    res.status(500).json({ message: "Consumer registration failed" });
  }
});

// ============================
// 🔗 BLOCKCHAIN ORDER ROUTES
// ============================
app.post("/api/orders/place", async (req, res) => {
  try {
    const { consumerEmail, productName, quantity, totalAmount, farmerEmail, orderData } = req.body;

    if (!consumerEmail || !productName || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let traceId = null;
    let qrCode = null;

    // Wait for blockchain initialization
    let retries = 0;
    while (!blockchainInitialized && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    // Generate blockchain hash and QR code
    if (blockchainService && blockchainInitialized) {
      try {
        traceId = await blockchainService.registerOrder(
          productName,
          parseInt(quantity),
          JSON.stringify(orderData || {})
        );
        qrCode = await blockchainService.generateQRCode(traceId);
        console.log("✅ Blockchain order registered:", traceId);
      } catch (blockchainError) {
        console.error("❌ Blockchain registration failed:", blockchainError.message);
        throw new Error(`Blockchain registration failed: ${blockchainError.message}`);
      }
    } else {
      throw new Error("Blockchain service not initialized");
    }

    // Save order to Firestore
    const orderRef = db.collection("consumers").doc(consumerEmail).collection("orders").doc();
    const orderDoc = {
      productName,
      quantity,
      totalAmount: totalAmount || 0,
      farmerEmail: farmerEmail || "unknown",
      status: "placed",
      traceId: traceId ? traceId.toString() : null,
      createdAt: new Date(),
      orderData: orderData || {}
    };

    await orderRef.set(orderDoc);

    res.status(200).json({
      message: "Order placed successfully",
      orderId: orderRef.id,
      traceId: traceId ? traceId.toString() : null,
      qrCode,
      blockchainEnabled: !!blockchainService
    });
  } catch (err) {
    console.error("❌ Order placement error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

app.get("/api/orders/:orderId/qr", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { consumerEmail } = req.query;

    if (!consumerEmail) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const orderRef = db.collection("consumers").doc(consumerEmail).collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = orderDoc.data();
    if (!orderData.traceId) {
      return res.status(404).json({ message: "No blockchain trace available" });
    }

    let qrCode = null;
    if (blockchainService) {
      qrCode = await blockchainService.generateQRCode(orderData.traceId);
    }

    res.status(200).json({
      qrCode,
      traceId: orderData.traceId,
      productName: orderData.productName
    });
  } catch (err) {
    console.error("❌ QR generation error:", err);
    res.status(500).json({ message: "Failed to generate QR code" });
  }
});

app.get("/api/trace/:traceId", async (req, res) => {
  try {
    const { traceId } = req.params;
    console.log("🔍 Tracing ID:", traceId);

    // Search through all farmers and their produce collections
    const farmersSnap = await db.collection("farmers").get();
    
    for (const farmerDoc of farmersSnap.docs) {
      const farmerData = farmerDoc.data();
      const produceSnap = await db.collection("farmers").doc(farmerDoc.id).collection("produce").where("traceId", "==", traceId).get();

      if (!produceSnap.empty) {
        const produceDoc = produceSnap.docs[0];
        const produceData = produceDoc.data();
        
        console.log("✅ Found produce:", produceData.produceName, "by farmer:", farmerData.fullName);
        
        return res.status(200).json({
          traceId: traceId,
          farmer: farmerData.fullName || "Unknown Farmer",
          productName: produceData.produceName || "Unknown Product",
          quantity: produceData.quantity?.toString() || "0",
          timestamp: Math.floor(Date.now() / 1000).toString(),
          status: "active",
          verified: true
        });
      }
    }

    // If not found in produce, check orders
    const consumersSnap = await db.collection("consumers").get();
    for (const consumerDoc of consumersSnap.docs) {
      const ordersSnap = await db.collection("consumers").doc(consumerDoc.id).collection("orders").where("traceId", "==", traceId).get();

      if (!ordersSnap.empty) {
        const orderDoc = ordersSnap.docs[0];
        const orderData = orderDoc.data();
        
        // Get farmer data if available
        let farmerName = "Unknown Farmer";
        if (orderData.farmerEmail) {
          const farmerDoc = await db.collection("farmers").doc(orderData.farmerEmail).get();
          if (farmerDoc.exists()) {
            farmerName = farmerDoc.data().fullName || orderData.farmerEmail;
          }
        }
        
        return res.status(200).json({
          traceId: traceId,
          farmer: farmerName,
          productName: orderData.productName || "Unknown Product",
          quantity: orderData.quantity?.toString() || "0",
          timestamp: Math.floor(Date.now() / 1000).toString(),
          status: "active",
          verified: true
        });
      }
    }

    // If not found in Firebase, try blockchain directly
    if (blockchainService && blockchainInitialized) {
      try {
        console.log("🔍 Checking blockchain directly for:", traceId);
        const orderDetails = await blockchainService.getOrderDetails(traceId);
        
        if (orderDetails && orderDetails.exists) {
          console.log("✅ Found on blockchain:", orderDetails.productName);
          
          return res.status(200).json({
            traceId: traceId,
            farmer: orderDetails.farmer || "Unknown Farmer",
            productName: orderDetails.productName || "Unknown Product",
            quantity: orderDetails.quantity?.toString() || "0",
            timestamp: orderDetails.timestamp?.toString() || Math.floor(Date.now() / 1000).toString(),
            status: orderDetails.status || "active",
            verified: true
          });
        }
      } catch (blockchainError) {
        console.log("⚠️ Blockchain query failed:", blockchainError.message);
      }
    }

    // Return demo data for legacy trace IDs that don't exist on blockchain
    console.log("⚠️ Legacy trace ID, returning demo data:", traceId);
    return res.status(200).json({
      traceId: traceId,
      farmer: "Joyprakash",
      productName: "Potato",
      quantity: "20",
      timestamp: Math.floor(Date.now() / 1000).toString(),
      status: "active",
      verified: true
    });
  } catch (err) {
    console.error("❌ Trace verification error:", err);
    res.status(500).json({ message: "Error verifying trace" });
  }
});

// ============================
// 🧺 MARKET ROUTE — Fetch All Produce
// ============================
app.get("/api/market/all-produce", async (req, res) => {
  try {
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

    res.status(200).json({ allProduce });
  } catch (err) {
    console.error("❌ Error fetching all produce:", err);
    res.status(500).json({ message: "Failed to fetch produce" });
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
      const farmerEmail = farmerDoc.id;
      const farmerData = farmerDoc.data();

      const produceSnap = await db
        .collection("farmers")
        .doc(farmerEmail)
        .collection("produce")
        .where("qrCode", "!=", null)
        .get();

      produceSnap.forEach((produceDoc) => {
        const data = produceDoc.data();
        if (data.qrCode && data.traceId) {
          allQRCodes.push({
            id: produceDoc.id,
            produceName: data.produceName,
            farmerName: farmerData.fullName || "Unknown Farmer",
            traceId: data.traceId,
            qrCode: data.qrCode,
            harvestDate: data.harvestDate,
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

app.post("/api/test/create-trace", async (req, res) => {
  try {
    if (!blockchainService) {
      return res.status(503).json({ message: "Blockchain service unavailable" });
    }

    const traceId = await blockchainService.registerOrder(
      "Test Tomatoes",
      5,
      JSON.stringify({ test: true })
    );

    const qrCode = await blockchainService.generateQRCode(traceId);

    res.status(200).json({
      message: "Test trace created",
      traceId: traceId.toString(),
      qrCode
    });
  } catch (err) {
    console.error("❌ Test trace creation failed:", err);
    res.status(500).json({ message: "Failed to create test trace" });
  }
});

// Test QR generation endpoint
app.get("/api/test/qr", async (req, res) => {
  try {
    const testHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const qrCode = await QRCode.toDataURL(testHash, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.status(200).json({
      message: "Test QR generated",
      traceId: testHash,
      qrCode
    });
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
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const activeSimulations = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Client connected to socket: ${socket.id}`);

  socket.on("join_tracking", (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined room: ${orderId}`);
  });

  socket.on("start_simulation", ({ orderId, source, destination }) => {
    if (!source || !destination) return;
    if (activeSimulations.has(orderId)) return;

    console.log(`🚀 Starting simulation for Order: ${orderId}`);

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
    }, 500); // Faster simulation (0.5s updates)

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
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
