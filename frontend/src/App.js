import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/common/NavBar/NavBar';
import BottomNav from './components/common/BottomNav/BottomNav';
import HomePage from './components/pages/HomePage/HomePage';
import BooksPage from './components/pages/BooksPage/BooksPage';
import DumyPage from './components/pages/DumyPage/DumyPage';
import AccountPage from './components/pages/AccountPage/AccountPage';
import LoginPage from './components/pages/LoginPage/LoginPage';
import RegisterPage from './components/pages/RegisterPage/RegisterPage';
import VerifyEmailPage from './components/pages/VerifyEmailPage/VerifyEmailPage';
import PrivateRoute from './components/common/PrivateRoute/PrivateRoute';
import BackgroundMusic from './context/AudioManager';
import './assets/scss/main.scss';
import AddPostPage from './components/pages/AddPostPage/AddPostPage';
import PostDetails from './components/common/PostDetails/PostDetails';
import { auth } from './firebase';
import EditPostPage from './components/pages/EditPostPage/EditPostPage';
import FriendsPage from './components/pages/FriendsPage/FriendsPage';
import MusicPage from './components/pages/MusicPage/MusicPage';
import MessagesPage from './components/pages/MessagesPage/MessagesPage';
import ConversationPage from './components/pages/ConversationPage/ConversationPage';

import DumaPage from './components/pages/DumaPage/DumaPage';

import ChatDetails from './components/pages/ChatDetails/ChatDetails';
import ChatPage from './components/pages/ChatPage/ChatPage';

import GamesPage from './components/pages/GamesPage/GamesPage';
import HelpPage from './components/pages/HelpPage/HelpPage';
import BookDetails from './components/pages/BookDetails/BookDetails';
import EditBook from './components/pages/BookDetails/EditBook';

const App = () => {
  return (
    <AuthProvider>
      <Router basename={process.env.PUBLIC_URL || ''}>
        <div className="app">
          <BackgroundMusic>
            <NavBar />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<PrivateRoute><HomePage/></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/account" element={<PrivateRoute><Navigate to={`/account/${auth.currentUser?.uid}`} /></PrivateRoute>} />
                <Route path="/account/:id" element={<AccountPage />} />

                <Route path="/books" element={<PrivateRoute><BooksPage /></PrivateRoute>} />
                <Route path="/books/:id" element={<PrivateRoute><BookDetails /></PrivateRoute>} />
                <Route path="/books/edit/:id" element={<EditBook />} />

                <Route path="/dumy" element={<PrivateRoute><DumyPage /></PrivateRoute>} />
                <Route path="/dumy/add" element={<AddPostPage />} />
                <Route path="/dumy/:id" element={<PostDetails />} />
                <Route path="/dumy/edit/:id" element={<EditPostPage />} />
                <Route path="/duma" element={<PrivateRoute><DumaPage /></PrivateRoute>} />

                <Route path="/friends" element={<PrivateRoute><FriendsPage /></PrivateRoute>} />
                <Route path="/music" element={<PrivateRoute><MusicPage /></PrivateRoute>} />

                <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
                <Route path="/messages/:id" element={<ConversationPage />} />
                <Route path="/chats" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/chats/:id" element={<ChatDetails />} />

                <Route path="/games" element={<PrivateRoute><GamesPage /></PrivateRoute>} />
                <Route path="/help" element={<PrivateRoute><HelpPage /></PrivateRoute>} />

              </Routes>
            </div>
            <BottomNav />
          </BackgroundMusic>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;