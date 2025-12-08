import React, { useState, useEffect } from 'react';
import { QrCode, Calendar, User } from 'lucide-react';

const QRCodesPage = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        // First try to get real QR codes
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
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <QrCode className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Blockchain QR Codes</h1>
          <p className="text-gray-600">Scan any QR code to verify produce authenticity on blockchain</p>
        </div>

        {qrCodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No QR codes generated yet.</p>
            <p className="text-sm text-gray-400 mb-6">Register produce to generate blockchain QR codes.</p>
            <button 
              onClick={() => window.location.href = '/#/register-produce'}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Register Produce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="text-center mb-4">
                  <img 
                    src={item.qrCode} 
                    alt={`QR Code for ${item.produceName}`}
                    className="mx-auto border rounded-lg"
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">{item.produceName}</h3>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{item.farmerName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
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
                        navigator.clipboard.writeText(item.traceId);
                        alert('Blockchain hash copied to clipboard!');
                      }}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Copy Hash
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodesPage;