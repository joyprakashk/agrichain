// src/pages/QrScannerPage.jsx
import React, { useState } from 'react';
import { QrCode, Search, CheckCircle, Smartphone, Info } from 'lucide-react';
// import Navbar from '../components/Navbar'; 
// Note: Navbar is rendered globally in App.jsx

// --- Reusable Components for the Page ---

/**
 * Component for the two information cards at the bottom (How to Find QR Codes, Why Trace).
 * @param {object} props
 * @param {React.Component} props.icon - Lucide icon component.
 * @param {string} props.title - Card title.
 * @param {string} props.description - Card description.
 */
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

// We will rename the TracingInfoCard to InfoCard as the original InfoCard was used for the bottom features
// The component is now just QrScannerPage, and we will move the state and handler inside it.

// --- Main Page Component ---

const QrScannerPage = () => {
  const [batchId, setBatchId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available QR codes on component mount
  React.useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/qr-codes');
        if (response.ok) {
          const result = await response.json();
          const codes = result.qrCodes || [];
          
          // If no QR codes exist, generate a test one
          if (codes.length === 0) {
            const testResponse = await fetch('http://localhost:8080/api/test/qr');
            if (testResponse.ok) {
              const testResult = await testResponse.json();
              setQrCodes([{
                id: 'test-1',
                produceName: 'Test Organic Tomatoes',
                farmerName: 'Test Farmer',
                traceId: testResult.traceId,
                qrCode: testResult.qrCode,
                harvestDate: '2024-01-15',
                createdAt: new Date().toISOString()
              }]);
            }
          } else {
            setQrCodes(codes);
          }
        }
      } catch (error) {
        console.error('Error fetching QR codes:', error);
        // Generate a fallback test QR code
        try {
          const testResponse = await fetch('http://localhost:8080/api/test/qr');
          if (testResponse.ok) {
            const testResult = await testResponse.json();
            setQrCodes([{
              id: 'test-1',
              produceName: 'Test Organic Tomatoes',
              farmerName: 'Test Farmer',
              traceId: testResult.traceId,
              qrCode: testResult.qrCode,
              harvestDate: '2024-01-15',
              createdAt: new Date().toISOString()
            }]);
          }
        } catch (testError) {
          console.error('Error generating test QR:', testError);
        }
      }
    };

    fetchQRCodes();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!batchId.trim()) return;
    
    setLoading(true);
    try {
      // Navigate to verification page with the batch ID
      window.location.href = `#/verify?trace=${encodeURIComponent(batchId.trim())}`;
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScanner = () => {
    // For now, redirect to the verification page
    window.location.href = '#/verify';
  };

  const sampleBatches = [
    { id: 'BATCH001', name: 'Organic Tomatoes' },
    { id: 'BATCH002', name: 'Fresh Spinach' },
    { id: 'BATCH003', name: 'Premium Basmati Rice' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar is rendered in App.jsx */}

      <main className="container mx-auto px-4 flex flex-col items-center justify-start pt-8 pb-20">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Consumer Portal</h1>
          <p className="text-lg text-gray-600">
            Trace your food's journey from farm to fork. Scan QR codes or search batch IDs to
            verify authenticity and view complete supply chain history.
          </p>
        </div>

        {/* Tracing Section: Scanning and Manual Search */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-5xl">
          
          {/* Main Card Wrapper */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-6">
              <QrCode className="w-6 h-6 mr-2 text-green-600" /> Track Your Produce
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: QR Scan Area */}
              <div className="flex flex-col justify-between">
                <div className="border-2 border-dashed border-blue-300 p-8 rounded-lg text-center bg-blue-50/50 relative">
                  <Smartphone className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                  <p className="font-semibold text-blue-600 mb-1">Scan QR Code</p>
                  <p className="text-sm text-gray-500">
                    Point your camera at the QR code on the produce packaging.
                  </p>
                  {/* Visual marker for the scanning area */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    <div className="border-4 border-dashed border-blue-500 rounded-lg absolute inset-4"></div>
                  </div>
                </div>

                {/* Start Scanner Button */}
                <button
                  className="w-full btn-primary bg-blue-600 hover:bg-blue-700 mt-6 py-3 text-lg transition duration-300 flex items-center justify-center"
                  onClick={handleStartScanner}
                >
                  <Smartphone className="w-6 h-6 mr-2" /> Start QR Scanner
                </button>
              </div>
              
              {/* Right Column: Manual Search */}
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <Search className="w-5 h-5 mr-2" /> Manual Search
                </h3>
                <form onSubmit={handleSearch} className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Enter Batch ID or QR Code (e.g., BATCH001)"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !batchId.trim()}
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
                  >
                    <Search className="w-5 h-5 mr-2" /> 
                    {loading ? 'Searching...' : 'Search Batch'}
                  </button>
                </form>
                
                {/* Sample Batches */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex-grow">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Batch IDs to try:</h4>
                  <ul className="text-sm space-y-1">
                    {sampleBatches.map(batch => (
                      <li key={batch.id}>
                        <a href={`#qrscanner?batch=${batch.id}`} className="text-blue-600 hover:text-blue-800 transition duration-150 font-semibold">
                          {batch.id} - {batch.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available QR Codes Section */}
        {qrCodes.length > 0 && (
          <div className="w-full max-w-5xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Available QR Codes to Scan</h2>
              <p className="text-gray-600">These are live, scannable QR codes from registered produce</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="text-center mb-4">
                    <img 
                      src={item.qrCode} 
                      alt={`QR Code for ${item.produceName}`}
                      className="mx-auto border rounded-lg w-48 h-48"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">{item.produceName}</h3>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Farmer: {item.farmerName}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Harvest: {item.harvestDate}</span>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Blockchain Hash:</p>
                      <p className="text-xs font-mono text-gray-700 break-all">
                        {item.traceId}
                      </p>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => {
                          setBatchId(item.traceId);
                          handleSearch({ preventDefault: () => {} });
                        }}
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Verify This QR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Cards Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <InfoCard
            icon={QrCode}
            title="How to Find QR Codes"
            description="Look for QR codes on produce packaging, labels, or stickers. They're usually placed near the product name or nutrition information."
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
