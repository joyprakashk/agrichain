// Test script to register produce and generate QR codes
import fetch from 'node-fetch';

async function registerTestProduce() {
  try {
    // First register a test farmer
    const farmerData = {
      fullName: "Test Farmer",
      aadhaar: "123456789012",
      email: "testfarmer@example.com",
      password: "testpass123"
    };

    console.log('Registering test farmer...');
    const farmerResponse = await fetch('http://localhost:8080/api/farmers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerData)
    });

    if (!farmerResponse.ok) {
      console.log('Farmer might already exist, continuing...');
    }

    // Register test produce
    const produceData = {
      email: "testfarmer@example.com",
      produceName: "Organic Tomatoes",
      quantity: "50",
      harvestDate: "2024-01-15",
      price: "80",
      category: "Vegetables",
      imageUrl: ""
    };

    console.log('Registering test produce...');
    const produceResponse = await fetch('http://localhost:8080/api/farmer/register-produce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produceData)
    });

    const result = await produceResponse.json();
    console.log('Produce registration result:', result);

    if (result.qrCode) {
      console.log('✅ QR Code generated successfully!');
      console.log('Trace ID:', result.traceId);
    } else {
      console.log('⚠️ QR Code not generated - blockchain might be unavailable');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

registerTestProduce();