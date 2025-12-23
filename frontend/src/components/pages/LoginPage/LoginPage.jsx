import React, { useState } from 'react';
import { signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
 } from 'firebase/auth';
import { auth } from '../../../firebase';
import { useNavigate } from 'react-router-dom';
import './LoginPage.scss';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        setError('Please verify your email before logging in');
        return;
      }
      
      navigate('/books');
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Account disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Account not found';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      navigate('/books');
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to the Kyryl-Methodian brotherhood!</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>
          <button 
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging In...
              </>
            ) : 'Login'}
          </button>  
        </form>

        <div className="divider">
          <span>or</span>
        </div>
        
        <button 
          className="google-signin-button"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <img 
            src={`/google_logo.png`}
            alt="Google logo" 
            className="google-logo"
          />
          Continue with Google
        </button>
        


        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button 
            className="link-button"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;