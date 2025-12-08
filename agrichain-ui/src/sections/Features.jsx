// src/sections/Features.jsx
import React from 'react';
import { Shield, QrCode, TrendingUp, Users } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

const featuresData = [
  {
    icon: Shield,
    title: 'Blockchain Security',
    description: 'Every transaction is recorded on an immutable blockchain ledger.',
    iconColor: 'text-blue-500',
  },
  {
    icon: QrCode,
    title: 'QR Code Tracing',
    description: 'Scan any QR code to trace produce from farm to your table.',
    iconColor: 'text-green-500',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Analytics',
    description: 'Track supply chain metrics and performance in real-time.',
    iconColor: 'text-purple-500',
  },
  {
    icon: Users,
    title: 'Multi-stakeholder',
    description: 'Connects farmers, distributors, retailers, and consumers.',
    iconColor: 'text-orange-500',
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container px-6">
        {/* Why Choose AgriChain section text */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose AgriChain?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Our platform leverages cutting-edge blockchain technology to provide unprecedented
            transparency and trust in the food supply chain.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {featuresData.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={(props) => <feature.icon {...props} className={feature.iconColor} />}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;