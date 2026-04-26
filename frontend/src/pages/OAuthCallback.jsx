import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScooterLoader from '../components/ScooterLoader';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      sessionStorage.setItem('token', token);
      // We trigger a reload to let AuthContext pick up the token and fetch the user cleanly
      window.location.href = '/'; 
    } else {
      navigate('/login?error=InvalidToken');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[70vh]">
      <ScooterLoader isVisible={true} text="Verifying your sweet identity..." />
    </div>
  );
};

export default OAuthCallback;
