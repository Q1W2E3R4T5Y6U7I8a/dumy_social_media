import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import './VerifyEmailPage.scss';

const VerifyEmailPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerification = setInterval(() => {
      auth.currentUser?.reload().then(() => {
        if (auth.currentUser?.emailVerified) {
          clearInterval(checkVerification);
          navigate('/books');
        }
      });
    }, 5000);

    return () => clearInterval(checkVerification);
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>
        <p className="verification-message">
          We've sent a verification email to your address. 
          Please check your inbox and verify your email to continue.
        </p>
        <div className="loading-spinner"></div>
        <p className="verification-note">
          This page will automatically refresh once your email is verified.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;