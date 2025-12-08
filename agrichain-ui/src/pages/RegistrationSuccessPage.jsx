import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, QrCode } from "lucide-react";
import axios from "axios";

const RegistrationSuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [produceData, setProduceData] = useState(state?.produceData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLatestProduce = async () => {
      const email = localStorage.getItem("farmerEmail");
      if (!produceData && email) {
        try {
          setLoading(true);
          const response = await axios.post(
            "http://localhost:8080/api/farmer/dashboard",
            { email }
          );
          const allBatches = response.data.farmerData.batches;
          if (allBatches && allBatches.length > 0) {
            setProduceData(allBatches[allBatches.length - 1]);
          }
        } catch (err) {
          console.error("❌ Error fetching produce details:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchLatestProduce();
  }, [produceData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 max-w-lg w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Produce Registered Successfully!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your produce has been added to your dashboard.
        </p>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-300">Loading details...</p>
        ) : (
          produceData && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-left">
              <p className="text-gray-800 dark:text-gray-100">
                <strong>Produce Name:</strong> {produceData.produceName}
              </p>
              <p className="text-gray-800 dark:text-gray-100">
                <strong>Quantity:</strong> {produceData.quantity} kg
              </p>
              <p className="text-gray-800 dark:text-gray-100">
                <strong>Harvest Date:</strong> {produceData.harvestDate}
              </p>
              {produceData.imageUrl && (
                <img
                  src={produceData.imageUrl}
                  alt="Produce"
                  className="mt-4 w-full rounded-lg shadow"
                />
              )}
              
              {/* QR Code Section */}
              {produceData.qrCode && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <QrCode className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      Blockchain QR Code
                    </h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img 
                      src={produceData.qrCode} 
                      alt="Blockchain QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Scan this QR code to verify authenticity on blockchain
                  </p>
                  {produceData.traceId && (
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-600 rounded text-xs">
                      <p className="text-gray-500 dark:text-gray-400">Blockchain Hash:</p>
                      <p className="font-mono text-gray-700 dark:text-gray-300 break-all">
                        {produceData.traceId}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {!produceData.qrCode && produceData.traceId && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    ⚠️ QR code generation in progress. Check QR Codes page in a moment.
                  </p>
                </div>
              )}
            </div>
          )
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/qr-codes")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center"
          >
            <QrCode className="w-5 h-5 mr-2" />
            View All QR Codes
          </button>
          <button
            onClick={() => navigate("/farmerdashboard")}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessPage;
