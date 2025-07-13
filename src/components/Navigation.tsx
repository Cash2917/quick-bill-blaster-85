import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home,
  FileText,
  Users,
  Plus,
  LogOut,
  User,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowAuth: () => void;
}

const Navigation = ({ currentPage, onNavigate, onShowAuth }: NavigationProps) => {
  const { user, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'create-invoice', label: 'Create Invoice', icon: Plus },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          >
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">HI</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">HonestInvoice</h1>
          </div>
          
          {user && (
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 ${
                      currentPage === item.id 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShowAuth}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                onClick={onShowAuth}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;