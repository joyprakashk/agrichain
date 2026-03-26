import React, { useState, useEffect } from 'react';
import { QrCode, Calendar, User, Copy, CheckCheck, AlertTriangle } from 'lucide-react';
import { ENDPOINTS } from '../config/api';

/**
 * Returns the base URL that a phone on the same Wi-Fi can reach.
 * - In production (not localhost) → use window.location.origin as-is.
 * - On localhost → use VITE_LAN_IP from .env file
 */
const getReachableOrigin = () => {
  const { hostname, protocol, port } = window.location;
  
  // Debug log to check what's being read
  console.log("=== QR Code Debug ===");
  console.log("Hostname:", hostname);
  console.log("VITE_LAN_IP:", import.meta.env.VITE_LAN_IP);
  console.log("Current port:", port);
  
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Already on a network IP or deployed URL
    return window.location.origin;
  }
  
  // Vite uses import.meta.env, not process.env
  const lanIp = import.meta.env.VITE_LAN_IP;
  
  if (lanIp) {
    const origin = `${protocol}//${lanIp}${port ? ':' + port : ''}`;
    console.log("Using LAN IP origin:", origin);
    return origin;
  }
  
  console.error("VITE_LAN_IP is not set in .env file!");
  return null;
};

const QRCodesPage = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [lanWarning, setLanWarning] = useState(false);

  const reachableOrigin = getReachableOrigin();

  useEffect(() => {
    if (!reachableOrigin) setLanWarning(true);
    fetchQRCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachableOrigin]);

  const buildVerifyUrl = (traceId) => {
    // Use reachableOrigin if available, otherwise fallback to hardcoded IP from env
    let base;
    if (reachableOrigin) {
      base = reachableOrigin + window.location.pathname;
    } else {
      // Fallback to using VITE_LAN_IP directly
      const fallbackIp = import.meta.env.VITE_LAN_IP;
      if (fallbackIp) {
        base = `http://${fallbackIp}:3000`;
      } else {
        base = window.location.origin + window.location.pathname;
      }
    }
    return `${base}#/verify/${encodeURIComponent(traceId)}`;
  };

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
          const enriched = codes.map((item) => ({
            ...item,
            verifyUrl: buildVerifyUrl(item.traceId),
          }));
          setQrCodes(enriched);
        }
      } else {
        await loadTestQR();
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      await loadTestQR();
    } finally {
      setLoading(false);
    }
  };

  const loadTestQR = async () => {
    try {
      console.log('📡 Fetching test QR from:', ENDPOINTS.TEST_QR);
      const testResponse = await fetch(ENDPOINTS.TEST_QR);
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        const traceId = testResult.traceId;
        setQrCodes([{
          id: 'test-1',
          produceName: 'Test Organic Tomatoes',
          farmerName: 'Test Farmer',
          farmLocation: 'Nashik, Maharashtra',
          traceId,
          qrCode: testResult.qrCode,
          harvestDate: '2024-01-15',
          certifications: 'Organic Certified',
          quantity: '50',
          unit: 'kg',
          status: 'delivered',
          createdAt: new Date().toISOString(),
          verifyUrl: buildVerifyUrl(traceId),
        }]);
      }
    } catch (err) {
      console.error('❌ Error generating test QR:', err);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading QR codes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <QrCode className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Blockchain QR Codes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan any QR code to instantly view full farmer &amp; produce details
          </p>

          {/* LAN IP warning */}
          {lanWarning && (
            <div className="mt-4 mx-auto max-w-xl flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-xl text-left">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">QR codes encode <code>localhost</code> — phones can't open that!</p>
                <p>
                  Add your computer's LAN IP to <code>.env</code>:<br />
                  <code className="bg-yellow-100 px-1 rounded">VITE_LAN_IP=192.168.x.x</code>
                  <br />Then restart the dev server. QR codes will encode a URL your phone can reach.
                </p>
              </div>
            </div>
          )}
        </div>

        {qrCodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No QR codes generated yet.</p>
            <button
              onClick={() => (window.location.href = '/#/register-produce')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Register Produce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((item, index) => {
              const verifyUrl = item.verifyUrl || buildVerifyUrl(item.traceId);
              // Only generate a scannable QR if we have a reachable URL
              const qrSrc = reachableOrigin || import.meta.env.VITE_LAN_IP
                ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verifyUrl)}`
                : item.qrCode;

              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col"
                >
                  {/* QR Image */}
                  <div className="text-center mb-4">
                    {qrSrc ? (
                      <img
                        src={qrSrc}
                        alt={`QR Code for ${item.produceName}`}
                        className="mx-auto border border-gray-200 dark:border-gray-600 rounded-lg"
                        style={{ width: 220, height: 220 }}
                      />
                    ) : (
                      <div className="mx-auto w-[220px] h-[220px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-xs text-gray-400 text-center px-4">
                          Set VITE_LAN_IP in .env to generate scannable QR
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Scan → opens full verification page with all details
                    </p>
                  </div>

                  {/* Produce info */}
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {item.produceName}
                    </h3>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{item.farmerName}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Harvest: {item.harvestDate}</span>
                    </div>

                    {/* Farmer extra info */}
                    {item.farmLocation && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        📍 {item.farmLocation}
                      </div>
                    )}
                    {item.certifications && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        🌿 {item.certifications}
                      </div>
                    )}
                    {item.quantity && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        📦 {item.quantity} {item.unit || 'kg'}
                      </div>
                    )}

                    {/* Encoded URL preview */}
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                        QR encodes this URL:
                      </p>
                      <p className="text-xs font-mono text-green-800 dark:text-green-300 break-all">
                        {verifyUrl}
                      </p>
                    </div>

                    {/* Blockchain hash */}
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blockchain Hash:</p>
                      <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                        {item.traceId}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleCopy(item.traceId, `hash-${index}`)}
                      className="flex-1 flex items-center justify-center gap-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      {copiedId === `hash-${index}` ? (
                        <><CheckCheck className="w-4 h-4 text-green-500" /> Copied</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copy Hash</>
                      )}
                    </button>
                    <button
                      onClick={() => (window.location.href = verifyUrl)}
                      className="flex-1 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodesPage;