import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  collection,
  getDoc,
  addDoc,
  onSnapshot,
  doc,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import './ChatPage.scss';
import ChatDetails from '../ChatDetails/ChatDetails';

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userAvatars, setUserAvatars] = useState({});
  const [newChatName, setNewChatName] = useState('');
  const [newChatDescription, setNewChatDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatImage, setChatImage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login'); // Redirect if not logged in
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Fetch all public chats
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatsData);
    });

    return () => unsubscribe();
  }, []);

  // Fetch messages for specific chat
  useEffect(() => {
    if (!id) return;

    const messagesQuery = query(
      collection(db, 'chats', id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));

      setMessages(messagesData);

      // Fetch user avatars
      const userIds = [...new Set(messagesData.map(msg => msg.userId))];
      const avatars = {};
      
      for (const uid of userIds) {
        try {
          const userDoc = await getDoc(doc(db, 'userInfo', uid));
          if (userDoc.exists()) {
            avatars[uid] = userDoc.data().photoURL;
          }
        } catch (err) {
          console.error(`Error fetching avatar for ${uid}:`, err);
        }
      }
      
      setUserAvatars(avatars);
    });

    return () => unsubscribe();
  }, [id]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !id || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'chats', id, 'messages'), {
        text: newMessage,
        userId: auth.currentUser.uid,
        userDisplayName: auth.currentUser.displayName,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setChatImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    try {
      const chatData = {
        name: newChatName,
        description: newChatDescription,
        imageUrl: chatImage,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        members: [auth.currentUser.uid]
      };

      await addDoc(collection(db, 'chats'), chatData);
      
      setNewChatName('');
      setNewChatDescription('');
      setChatImage('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteDoc(doc(db, 'chats', chatId));
        navigate('/chats');
      } catch (err) {
        console.error('Error deleting chat:', err);
      }
    }
  };

  if (id) {
    const currentChat = chats.find(chat => chat.id === id);
    if (!currentChat) {
      return <div>Loading chat...</div>;
    }

    return (
      <ChatDetails 
        chatId={id}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        userAvatars={userAvatars}
        onDeleteChat={handleDeleteChat}
        chatAuthor={currentChat.createdBy}
        chatAuthorId={currentChat.createdBy}
        chatAuthorAvatar={userAvatars[currentChat.createdBy] || ''}
      />
    );
  }

  return (
    <div className="chat-page">
      <div className="add-chat-button" onClick={() => setShowCreateModal(true)}>
        <div className="plus-icon">+</div>
      </div>
      
      <div className="chats-list">
        {chats.map((chat) => (
          <div key={chat.id} className="chat-card">
            <Link to={`/chats/${chat.id}`}>
              {chat.imageUrl && (
                <img 
                  src={chat.imageUrl} 
                  alt="Chat cover" 
                  className="chat-image"
                />
              )}
              <h3>{chat.name}</h3>
              <p>{chat.description || 'Join the conversation!'}</p>
            </Link>
            {chat.createdBy === auth.currentUser?.uid && (
              <div className="chat-actions">
                <button onClick={(e) => {
                  e.preventDefault();
                  handleDeleteChat(chat.id);
                }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleCreateChat}>
              <h2>Create New Chat</h2>
              
              <label>Chat Name*</label>
              <input
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                required
              />
              
              <label>Description</label>
              <textarea
                value={newChatDescription}
                onChange={(e) => setNewChatDescription(e.target.value)}
              />
              
              <label>Chat Image</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="upload-button"
                >
                  {chatImage ? 'Change Image' : 'Upload Image'}
                </button>
                
                {chatImage && (
                  <div className="image-preview">
                    <img src={chatImage} alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button type="submit">
                  Create Chat
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setChatImage('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;