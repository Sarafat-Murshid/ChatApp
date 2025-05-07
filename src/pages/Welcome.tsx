import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { MessageCircle } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="mb-6 text-primary-600">
            <MessageCircle size={64} />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Welcome to ChatApp
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Connect with friends and colleagues in real-time.
          </p>
          <div className="space-y-4 w-full">
            <Button 
              variant="primary" 
              onClick={() => navigate('/login')}
              fullWidth
            >
              Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/register')}
              fullWidth
            >
              Register
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Welcome;