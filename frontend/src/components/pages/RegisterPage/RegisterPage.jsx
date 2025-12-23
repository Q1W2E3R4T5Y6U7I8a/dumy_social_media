import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../../../firebase';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.scss';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    try {
      setError('');
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        alert('Verification email resent. Please check your inbox.');
      } else {
        setError('Unable to resend verification email. Please log in again.');
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setSuccess(true);
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Google sign-in automatically verifies email, so we can redirect
      navigate('/books');
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="register-card success-card">
          <h2>Verify Your Email</h2>
          <div className="verification-icon">✉️</div>
          <p className="success-message">
            We've sent a verification email to <strong>{email}</strong>.
            Please check your inbox and click the verification link.
          </p>
          <button 
            className="auth-button"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
          <p className="resend-note">
            Didn't receive the email?{' '}
            <span className="link" onClick={handleResendVerification}>Resend verification</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button 
            className="register-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : 'Register'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>
        
        <button 
          className="google-signin-button"
          onClick={signUpWithGoogle}
          disabled={googleLoading}
        >
          <img 
            src="/google_logo.png"
            alt="Google logo" 
            className="google-logo"
          />
          {googleLoading ? (
            <>
              <span className="spinner"></span>
              Signing Up...
            </>
          ) : 'Sign up with Google'}
        </button>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button 
            className="link-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;