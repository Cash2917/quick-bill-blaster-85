
import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onNavigate: (page: string) => void;
  onShowAuth: () => void;
}

const HeroSection = ({ onNavigate, onShowAuth }: HeroSectionProps) => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Professional Invoice
        </h1>
        <h2 className="text-5xl font-bold text-green-600 mb-6">
          Generator
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create, send, and track professional invoices with ease. Streamline your 
          billing process and get paid faster.
        </p>
        <Button 
          onClick={onShowAuth}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
        >
          Join Now
        </Button>
        
        {/* Invoice Preview */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h3>
                <div className="w-12 h-1 bg-green-600 rounded"></div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Invoice #001</p>
                <p>June 20, 2024</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">From:</div>
              <div className="text-gray-900 font-medium">Jane Doe</div>
              <div className="text-sm text-gray-600">Freelancer</div>
            </div>
            
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Design Work</span>
                <span className="text-gray-900">$500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Development</span>
                <span className="text-gray-900">$500</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-green-600">$1050</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
