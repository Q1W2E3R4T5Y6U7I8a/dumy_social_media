import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  if (user === undefined) return null;

  return user && user.emailVerified ? children : <Navigate to="/login" />;
}