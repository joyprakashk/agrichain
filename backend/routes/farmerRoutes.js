// routes/farmerRoutes.js
import express from "express";
import { db } from "../server.js";

const router = express.Router();

/**
 * 🧾 GET /api/farmers/dashboard/:email
 * Fetch farmer dashboard data from Firestore
 */
router.get("/dashboard/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const farmerDoc = await db.collection("farmers").doc(email).get();

    if (!farmerDoc.exists) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const farmerData = farmerDoc.data();
    return res.status(200).json(farmerData.dashboard || {});
  } catch (error) {
    console.error("❌ Error fetching dashboard:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

export default router;
