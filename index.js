// index.js

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// 🔹 Initialize Firebase Admin SDK
// -----------------------------
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// -----------------------------
// 🔹 Test Route
// -----------------------------
app.get("/", (req, res) => {
  res.send("✅ Firebase Firestore backend is running successfully!");
});

// -----------------------------
// 🔹 Add Farmer (In your format)
// -----------------------------
app.post("/addFarmer", async (req, res) => {
  try {
    const { fullName, email, farmId, password } = req.body;

    // Check required fields
    if (!fullName || !email || !farmId || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Add to Firestore
    await db.collection("farmers").add({
      fullName,
      email,
      farmId,
      password,
      createdAt: new Date() // Firestore stores this as a timestamp
    });

    res.status(200).json({ message: "✅ Farmer data stored successfully!" });
  } catch (error) {
    console.error("❌ Error adding farmer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------
// 🔹 Fetch All Farmers
// -----------------------------
app.get("/farmers", async (req, res) => {
  try {
    const snapshot = await db.collection("farmers").get();
    const farmers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(farmers);
  } catch (error) {
    console.error("❌ Error fetching farmers:", error);
    res.status(500).send("Internal Server Error");
  }
});

// -----------------------------
// 🔹 Delete Farmer
// -----------------------------
app.delete("/deleteFarmer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("farmers").doc(id).delete();
    res.status(200).json({ message: "✅ Farmer deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting farmer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -----------------------------
// 🔹 Start Server
// -----------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
