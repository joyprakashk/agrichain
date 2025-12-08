// src/sections/CTA.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white">
      <div className="container text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to transform your supply chain?
        </h2>
        <p className="text-lg md:text-xl mb-12 max-w-4xl mx-auto leading-relaxed">
          Join thousands of farmers, distributors, and consumers who trust AgriChain for complete food traceability.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          
          {/* 1. Get Started Today -> Farmer Portal Page (#/farmer) */}
          <a 
            href="#/farmer" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-green-600 hover:bg-gray-50 font-semibold rounded-xl shadow-lg transition-all duration-300"
          >
            Get Started Today <ArrowRight className="w-5 h-5" />
          </a>
          
          {/* 2. Learn More -> QR Scanner Page (#/qrscanner) */}
          <a 
            href="#/qrscanner" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white border-2 border-white hover:bg-white hover:text-teal-600 font-semibold rounded-xl transition-all duration-300"
          >
            Learn More
          </a>
          
        </div>
      </div>
    </section>
  );
};

export default CTA;
