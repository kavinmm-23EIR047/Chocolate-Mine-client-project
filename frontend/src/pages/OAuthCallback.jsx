import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScooterLoader from '../components/ScooterLoader';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('🍭 OAuthCallback: Received token?', !!token);
    
    if (token) {
      console.log('🍭 OAuthCallback: Google login successful, storing token...');
      try {
        sessionStorage.setItem('token', token);
        localStorage.setItem('token', token);
      } catch (storageError) {
        console.warn('OAuth token storage unavailable; continuing with session cookie.', storageError);
      }
      navigate('/', { replace: true }); 
    } else {
      const error = searchParams.get('error');
      console.error('🍭 OAuthCallback: No token found. Error:', error);
      navigate(`/login?error=${error || 'InvalidToken'}`);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[70vh]">
      <ScooterLoader isVisible={true} text="Verifying your sweet identity..." />
    </div>
  );
};

export default OAuthCallback;
