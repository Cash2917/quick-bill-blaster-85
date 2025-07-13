import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import InvoiceForm from '@/components/InvoiceForm';
import ClientForm from '@/components/ClientForm';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  console.log('Index component rendering...');
  
  const [currentPage, setCurrentPage] = useState('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();

  console.log('User state:', user ? 'authenticated' : 'not authenticated');
  console.log('Loading state:', loading);

  // If user is authenticated, default to dashboard instead of landing
  React.useEffect(() => {
    if (user && currentPage === 'landing') {
      console.log('User authenticated, navigating to dashboard');
      setCurrentPage('dashboard');
    }
  }, [user, currentPage]);

  const handleShowAuth = () => {
    console.log('Opening auth modal');
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    console.log('Rendering page:', currentPage);
    
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} onShowAuth={handleShowAuth} />;
      case 'dashboard':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <Dashboard onNavigate={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'create-invoice':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <InvoiceForm />
          </ProtectedRoute>
        );
      case 'clients':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <ClientForm />
          </ProtectedRoute>
        );
      case 'invoices':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <Dashboard onNavigate={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'pricing':
        return (
          <ProtectedRoute onShowAuth={handleShowAuth}>
            <SubscriptionPlans />
          </ProtectedRoute>
        );
      default:
        return <LandingPage onNavigate={setCurrentPage} onShowAuth={handleShowAuth} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onShowAuth={handleShowAuth}
      />
      <main>
        {renderPage()}
      </main>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Index;