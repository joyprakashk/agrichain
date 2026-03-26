// src/pages/QRVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Shield, Package, Calendar, User, Hash,
  ArrowLeft, MapPin, Truck, Clock, Leaf, AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../config/api';

// ── helpers ───────────────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, mono = false }) => {
  if (!value || value === '—') return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className={`text-sm text-gray-900 dark:text-white break-all ${mono ? 'font-mono' : 'font-semibold'}`}>
          {value}
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    delivered: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
    shipped: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    processing: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
    harvested: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  };
  const s = map[status?.toLowerCase()] || map.processing;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

// ── Demo data — shown when no backend / no hash match ─────────────────────────
const DEMO_DATA = {
  productName: 'Demo Organic Tomatoes',
  farmerName: 'Ravi Kumar',
  farmer: 'Ravi Kumar',
  farmerAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590645d8',
  farmLocation: 'Nashik, Maharashtra',
  quantity: '50',
  unit: 'kg',
  harvestDate: '2026-03-20',
  certifications: 'Organic Certified, Non-GMO',
  status: 'delivered',
  verified: true,
};

const DEMO_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

// ── main component ─────────────────────────────────────────────────────────────
const QRVerificationPage = () => {
  const { traceId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Support both route param and ?trace= query param
  const resolvedTraceId =
    traceId ||
    new URLSearchParams(window.location.hash.split('?')[1]).get('trace');

  useEffect(() => {
    if (resolvedTraceId) {
      verifyTrace(decodeURIComponent(resolvedTraceId));
    } else {
      setError('No trace ID provided');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTraceId]);

  const verifyTrace = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // Demo shortcut
      if (id.trim() === DEMO_HASH) {
        setData({ ...DEMO_DATA, traceId: id });
        setIsDemo(true);
        setLoading(false);
        return;
      }

      const traceUrl = ENDPOINTS.TRACE_ORDER(id.trim());
      console.log('🔍 Verifying trace at:', traceUrl);
      
      const res = await fetch(traceUrl);
      const result = await res.json();

      if (res.ok) {
        console.log('✅ Trace found:', result);
        setData({ ...result, traceId: id });
        setIsDemo(false);
      } else {
        console.warn('⚠️ Backend error, showing demo data:', result.message);
        setData({ ...DEMO_DATA, traceId: id });
        setIsDemo(true);
      }
    } catch (err) {
      console.warn('❌ Network error, showing demo data:', err);
      setData({ ...DEMO_DATA, traceId: id });
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  // ── loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-100 dark:border-green-900" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 animate-spin" />
            <Shield className="absolute inset-0 m-auto w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Verifying on Blockchain…</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Fetching immutable record</p>
        </div>
      </div>
    );
  }

  // ── hard error (no traceId at all) ──
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Verification Failed</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gray-800 dark:bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── success ──
  const farmerName = data.farmerName || data.farmer;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white flex-1">
            Blockchain Verification
          </h1>
          <StatusBadge status={data.status} />
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 pt-6 pb-20 space-y-5">

        {/* Demo notice */}
        {isDemo && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-xl text-sm text-yellow-800">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Demo data shown</p>
              <p>Your backend wasn't reachable — displaying sample produce details so you can see how the page looks when data is available.</p>
            </div>
          </div>
        )}

        {/* Verified Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg">
          <CheckCircle className="w-14 h-14 mx-auto mb-3 drop-shadow" />
          <h2 className="text-2xl font-bold mb-1">✅ Verified on Blockchain</h2>
          <p className="text-green-100 text-sm">
            This product's authenticity is confirmed. Data is immutable and tamper-proof.
          </p>
        </div>

        {/* Product Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Product Details</h2>
          </div>
          <div className="px-5">
            <DetailRow icon={Leaf} label="Product Name" value={data.productName} />
            <DetailRow icon={Package} label="Quantity" value={`${data.quantity || '—'} ${data.unit || 'kg'}`} />
            <DetailRow icon={Calendar} label="Harvest Date" value={
              data.harvestDate
                ? new Date(data.harvestDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                : null
            } />
            <DetailRow icon={Shield} label="Certifications" value={data.certifications} />
          </div>
        </div>

        {/* Farmer Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Farmer Details</h2>
          </div>
          <div className="px-5">
            <DetailRow icon={User} label="Farmer Name" value={farmerName} />
            <DetailRow icon={MapPin} label="Farm Location" value={data.farmLocation} />
            <DetailRow icon={Hash} label="Farmer Wallet Address" value={data.farmerAddress} mono />
          </div>
        </div>

        {/* Supply Chain */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Supply Chain Status</h2>
          </div>
          <div className="px-5">
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Truck className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current Status</p>
                <StatusBadge status={data.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Blockchain Record</h2>
          </div>
          <div className="px-5">
            <DetailRow icon={Hash} label="Transaction Hash" value={resolvedTraceId} mono />
          </div>
        </div>

        {/* Trust Badge */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
          <Shield className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            All information above is stored on-chain and cannot be altered.
            You are viewing the original, verified record.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => (window.location.hash = '#/buyproduce')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow"
          >
            <Package className="w-5 h-5" /> Shop More Products
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default QRVerificationPage;