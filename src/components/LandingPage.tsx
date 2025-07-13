
import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onShowAuth: () => void;
}

const LandingPage = ({ onNavigate, onShowAuth }: LandingPageProps) => {
  return (
    <div className="min-h-screen">
      <HeroSection onNavigate={onNavigate} onShowAuth={onShowAuth} />
      <FeaturesSection />
      <PricingSection onNavigate={onNavigate} onShowAuth={onShowAuth} />
      
      {/* Call to Action */}
      <div className="bg-green-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your invoicing?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of businesses that trust HonestInvoice for their billing needs.
          </p>
          <button 
            onClick={onShowAuth}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
