// src/pages/QrScannerPage.jsx
import React, { useState } from 'react';
import { QrCode, Search, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';
import { ENDPOINTS } from '../config/api';

const getReachableOrigin = () => {
  const { hostname, protocol, port } = window.location;
  
  console.log("=== Scanner Debug ===");
  console.log("Hostname:", hostname);
  console.log("VITE_LAN_IP:", import.meta.env.VITE_LAN_IP);
  
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  
  // Vite uses import.meta.env
  const lanIp = import.meta.env.VITE_LAN_IP;
  if (lanIp) return `${protocol}//${lanIp}${port ? ':' + port : ''}`;
  return null;
};

const InfoCard = ({ icon: Icon, title, description, iconColor = 'text-green-600' }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex space-x-4">
    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-green-50 ${iconColor}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const QrScannerPage = () => {
  const [batchId, setBatchId] = useState('');
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const reachableOrigin = getReachableOrigin();

  React.useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        console.log('📡 Fetching QR codes from:', ENDPOINTS.QR_CODES);
        const response = await fetch(ENDPOINTS.QR_CODES);
        if (response.ok) {
          const result = await response.json();
          const codes = result.qrCodes || [];
          if (codes.length === 0) {
            await loadTestQR();
          } else {
            setQrCodes(codes);
          }
        } else {
          await loadTestQR();
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        await loadTestQR();
      }
    };

    const loadTestQR = async () => {
      try {
        console.log('📡 Fetching test QR from:', ENDPOINTS.TEST_QR);
        const testResponse = await fetch(ENDPOINTS.TEST_QR);
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          setQrCodes([{
            id: 'test-1',
            produceName: 'Test Organic Tomatoes',
            farmerName: 'Test Farmer',
            farmLocation: 'Nashik, Maharashtra',
            certifications: 'Organic Certified',
            quantity: '50',
            unit: 'kg',
            traceId: testResult.traceId,
            qrCode: testResult.qrCode,
            harvestDate: '2024-01-15',
            createdAt: new Date().toISOString(),
          }]);
        }
      } catch (err) {
        console.error('Error generating test QR:', err);
      }
    };

    fetchQRCodes();
  }, []);

  const buildVerifyUrl = (traceId) => {
    let base;
    if (reachableOrigin) {
      base = reachableOrigin + window.location.pathname;
    } else {
      const fallbackIp = import.meta.env.VITE_LAN_IP;
      if (fallbackIp) {
        base = `http://${fallbackIp}:3000`;
      } else {
        base = window.location.origin + window.location.pathname;
      }
    }
    return `${base}#/verify/${encodeURIComponent(traceId)}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!batchId.trim()) return;
    window.location.href = `#/verify/${encodeURIComponent(batchId.trim())}`;
  };

  const handleVerifyQR = (traceId) => {
    window.location.href = `#/verify/${encodeURIComponent(traceId)}`;
  };

  const sampleBatches = [
    { id: 'BATCH001', name: 'Organic Tomatoes' },
    { id: 'BATCH002', name: 'Fresh Spinach' },
    { id: 'BATCH003', name: 'Premium Basmati Rice' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 flex flex-col items-center justify-start pt-8 pb-20">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Consumer Portal</h1>
          <p className="text-lg text-gray-600">
            Trace your food's journey from farm to fork. Scan QR codes or search batch IDs to
            verify authenticity and view complete supply chain history.
          </p>
        </div>

        {/* LAN IP warning */}
        {!reachableOrigin && !import.meta.env.VITE_LAN_IP && (
          <div className="w-full max-w-2xl mb-6 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-xl text-left">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Phones can't open <code>localhost</code> QR codes</p>
              <p>
                Add your computer's LAN IP to <code>.env</code>:<br />
                <code className="bg-yellow-100 px-1 rounded">VITE_LAN_IP=192.168.x.x</code>
                <br />Then restart the dev server so QR codes encode a URL your phone can reach.
              </p>
            </div>
          </div>
        )}

        {/* Tracking card */}
        <div className="w-full max-w-5xl mb-16">
          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-6">
              <QrCode className="w-6 h-6 mr-2 text-green-600" /> Track Your Produce
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: QR Scan Area */}
              <div className="flex flex-col justify-between">
                <div className="border-2 border-dashed border-blue-300 p-8 rounded-lg text-center bg-blue-50/50 relative">
                  <Smartphone className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                  <p className="font-semibold text-blue-600 mb-1">Scan QR Code</p>
                  <p className="text-sm text-gray-500">
                    Point your camera at the QR code on the produce packaging.
                    It will open the full verification page automatically — including farmer name,
                    location, certifications, and supply chain status.
                  </p>
                  <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    <div className="border-4 border-dashed border-blue-500 rounded-lg absolute inset-4" />
                  </div>
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 py-3 text-lg font-semibold rounded-lg transition duration-300 flex items-center justify-center gap-2"
                  onClick={() => (window.location.href = '#/verify')}
                >
                  <Smartphone className="w-6 h-6" /> Start QR Scanner
                </button>
              </div>

              {/* Right: Manual Search */}
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Search className="w-5 h-5 mr-2" /> Manual Search
                </h3>
                <form onSubmit={handleSearch} className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Enter Batch ID or blockchain hash…"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !batchId.trim()}
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    {loading ? 'Searching…' : 'Search & Verify'}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex-grow">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Batch IDs to try:</h4>
                  <ul className="text-sm space-y-1">
                    {sampleBatches.map((batch) => (
                      <li key={batch.id}>
                        <button
                          onClick={() => handleVerifyQR(batch.id)}
                          className="text-blue-600 hover:text-blue-800 transition font-semibold"
                        >
                          {batch.id} – {batch.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available QR Codes */}
        {qrCodes.length > 0 && (
          <div className="w-full max-w-5xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Available QR Codes to Scan</h2>
              <p className="text-gray-600">
                Click "View Full Details" to see all farmer &amp; product information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((item, index) => {
                const verifyUrl = buildVerifyUrl(item.traceId);
                const qrSrc = (reachableOrigin || import.meta.env.VITE_LAN_IP)
                  ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`
                  : item.qrCode;

                return (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="text-center mb-4">
                      {qrSrc ? (
                        <img
                          src={qrSrc}
                          alt={`QR Code for ${item.produceName}`}
                          className="mx-auto border rounded-lg w-48 h-48"
                        />
                      ) : (
                        <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <p className="text-xs text-gray-400 text-center px-2">Set VITE_LAN_IP in .env to generate scannable QR</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Scan → opens full details</p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-gray-800">{item.produceName}</h3>
                      <p className="text-sm text-gray-600">👨‍🌾 Farmer: {item.farmerName}</p>
                      {item.farmLocation && (
                        <p className="text-sm text-gray-600">📍 {item.farmLocation}</p>
                      )}
                      {item.certifications && (
                        <p className="text-sm text-gray-600">🌿 {item.certifications}</p>
                      )}
                      {item.quantity && (
                        <p className="text-sm text-gray-600">📦 {item.quantity} {item.unit || 'kg'}</p>
                      )}
                      <p className="text-sm text-gray-600">🗓 Harvest: {item.harvestDate}</p>

                      <div className="mt-4 text-center">
                        <button
                          onClick={() => handleVerifyQR(item.traceId)}
                          className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          View Full Details →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <InfoCard
            icon={QrCode}
            title="How to Find QR Codes"
            description="Look for QR codes on produce packaging, labels, or stickers. Scanning opens a full verification page with all farmer and product details."
            iconColor="text-blue-600"
          />
          <InfoCard
            icon={CheckCircle}
            title="Why Trace Your Food?"
            description="Food traceability helps ensure safety, authenticity, and sustainability. Know exactly where your food comes from and how it was handled."
            iconColor="text-green-600"
          />
        </div>
      </main>
    </div>
  );
};

export default QrScannerPage;