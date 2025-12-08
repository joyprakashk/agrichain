// src/sections/Stats.jsx
import React from 'react';
import { Leaf, QrCode, Truck, Shield } from 'lucide-react';
import StatCard from '../components/StatCard';

const statsData = [
  { icon: Leaf, number: '1,248', label: 'Registered Farms' },
  { icon: QrCode, number: '45,629', label: 'Tracked Batches' },
  { icon: Truck, number: '892', label: 'Active Routes' },
  { icon: Shield, number: '156,847', label: 'Verified Transactions' },
];

const Stats = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container px-6">
        {/* The stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {statsData.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;