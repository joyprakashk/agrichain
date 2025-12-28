import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase
const saPath = path.join(__dirname, "backend", "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function debugTrace() {
  console.log("🔍 Debugging trace IDs in Firebase...");
  
  // Check all farmers and their produce
  const farmersSnap = await db.collection("farmers").get();
  
  for (const farmerDoc of farmersSnap.docs) {
    const farmerData = farmerDoc.data();
    console.log(`\n👨‍🌾 Farmer: ${farmerData.fullName} (${farmerDoc.id})`);
    
    const produceSnap = await db.collection("farmers").doc(farmerDoc.id).collection("produce").get();
    
    produceSnap.forEach((produceDoc) => {
      const produceData = produceDoc.data();
      if (produceData.traceId) {
        console.log(`  🌾 ${produceData.produceName}: ${produceData.traceId}`);
      }
    });
  }
  
  // Check all consumers and their orders
  const consumersSnap = await db.collection("consumers").get();
  
  for (const consumerDoc of consumersSnap.docs) {
    console.log(`\n🧑‍💼 Consumer: ${consumerDoc.id}`);
    
    const ordersSnap = await db.collection("consumers").doc(consumerDoc.id).collection("orders").get();
    
    ordersSnap.forEach((orderDoc) => {
      const orderData = orderDoc.data();
      if (orderData.traceId) {
        console.log(`  📦 ${orderData.productName}: ${orderData.traceId}`);
      }
    });
  }
  
  process.exit(0);
}

debugTrace().catch(console.error);