
import React from 'react';
import { FileText, Users, BarChart3, CreditCard } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Professional Invoices",
      description: "Create stunning, professional invoices with customizable templates"
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Organize and manage all your clients in one centralized location"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track your revenue, monitor payments and get insights into your business"
    },
    {
      icon: CreditCard,
      title: "Payment Tracking",
      description: "Monitor payment status and send automatic payment reminders"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to manage invoices
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to streamline your billing process and help you get paid faster.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
