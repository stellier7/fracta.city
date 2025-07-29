'use client';

import React from 'react';
import { Check, DollarSign, TrendingUp, Shield, Users, Building, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: 'Invest from $100',
    description: 'Start your real estate investment journey with minimal capital'
  },
  {
    icon: TrendingUp,
    title: 'Earn real ROI (6–12%)',
    description: 'Generate consistent returns from rental income and appreciation'
  },
  {
    icon: Shield,
    title: 'Blockchain transparency',
    description: 'All transactions and ownership records secured on Base blockchain'
  },
  {
    icon: Users,
    title: 'Fractional ownership',
    description: 'Own a piece of premium properties without buying the whole asset'
  },
  {
    icon: Building,
    title: 'Prospera-regulated assets',
    description: 'Invest in properties within Honduras\' innovative economic zone'
  },
  {
    icon: BarChart3,
    title: 'Liquid secondary market',
    description: 'Trade your property tokens anytime on our marketplace'
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-bg-primary relative overflow-hidden">
      {/* Enhanced background patterns */}
      <div className="absolute inset-0 bg-gradient-overlay opacity-30" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-overlay opacity-20 transform rotate-45" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-overlay opacity-20 transform -rotate-45" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Why Choose{' '}
            <span className="text-accent-primary">
              Fracta.city
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Experience the future of real estate investment with blockchain technology and regulatory compliance
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group bg-gradient-card rounded-xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 ease-smooth transform hover:-translate-y-2 border border-white/5 hover:border-accent-primary/30 relative overflow-hidden"
              >
                {/* Card background glow effect */}
                <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  {/* Enhanced Feature Icon */}
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-xl shadow-button group-hover:scale-110 transition-transform duration-300 ease-smooth mr-4">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center">
                      <Check className="w-6 h-6 text-success mr-3" />
                      <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                    </div>
                  </div>

                  {/* Feature Description */}
                  <p className="text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-gradient-card rounded-2xl p-8 border border-white/5 relative overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 max-w-4xl mx-auto">
            {/* CTA background patterns */}
            <div className="absolute inset-0 bg-gradient-overlay opacity-10" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-overlay opacity-15 transform rotate-45" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-overlay opacity-15 transform -rotate-45" />
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-text-primary mb-4">
                Ready to start your{' '}
                <span className="text-accent-primary">investment journey</span>?
              </h3>
              <p className="text-text-secondary mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                Join hundreds of investors already earning passive income through tokenized real estate in Prospera
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-primary hover:shadow-button text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-2 hover:shadow-glow">
                  Browse Properties
                </button>
                <button className="bg-black/20 backdrop-blur-glass border border-white/10 hover:border-accent-secondary/50 text-text-primary hover:bg-accent-secondary/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-2">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 