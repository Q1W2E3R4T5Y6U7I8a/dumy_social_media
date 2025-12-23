import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, getDoc, updateDoc, collection, orderBy,
  onSnapshot, query, where, getDocs, addDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import './ChatDetails.scss';
import { Link } from 'react-router-dom';

const ChatDetails = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userAvatars, setUserAvatars] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [relatedChats, setRelatedChats] = useState([]);

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef(null);

  // Fetch chat data
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
          navigate('/chats');
          return;
        }

        const chatData = chatDoc.data();
        setChat({
          id: chatDoc.id,
          ...chatData,
          createdAt: chatData.createdAt?.toDate().toLocaleDateString()
        });

        // Fetch creator info
        const creatorRef = doc(db, 'userInfo', chatData.createdBy);
        const creatorDoc = await getDoc(creatorRef);
        if (creatorDoc.exists()) {
          setCreatorInfo(creatorDoc.data());
        }

        // Fetch related chats
        const chatsQuery = query(
          collection(db, 'chats'),
          where('createdBy', '==', chatData.createdBy)
        );
        const chatsSnapshot = await getDocs(chatsQuery);
        setRelatedChats(chatsSnapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(c => c.id !== chatId)
        );

      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMessages = () => {
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
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
        const userIds = [...new Set(messagesData.map(m => m.userId))];
        const avatars = {};
    
        await Promise.all(userIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'userInfo', uid));
          if (userDoc.exists()) {
            avatars[uid] = userDoc.data().photoURL;
          }
        }));
    
        setUserAvatars(avatars);
      });
    
      return unsubscribe;
    };

    fetchChatData();
    const unsubscribe = fetchMessages();
    return () => unsubscribe();
  }, [chatId, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        userId: auth.currentUser.uid,
        userDisplayName: auth.currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      try {
        await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteDoc(doc(db, 'chats', chatId));
        navigate('/chats');
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  if (!chat) {
    return <div className="error">Chat not found</div>;
  }

  return (
    <div className="chat-details-container">
      <div className="chat-header">
        <h1>{chat.name}</h1>
        <div className="chat-meta">
          <span>Created on {chat.createdAt}</span>
          {chat.createdBy === auth.currentUser?.uid && (
            <button onClick={handleDeleteChat} className="delete-button">
              Delete Chat
            </button>
          )}
        </div>
      </div>

      <div className="chat-content">
        <div className="chat-description">
          {chat.description || 'No description provided.'}
        </div>
        
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.userId === auth.currentUser?.uid ? 'own-message' : ''}`}>
              <div className="message-header">
                <Link to={`/account/${message.userId}`}>
                  <img
                    src={
                      userAvatars[message.userId]?.startsWith('/')
                        ? process.env.PUBLIC_URL + userAvatars[message.userId]
                        : userAvatars[message.userId] || process.env.PUBLIC_URL + '/no_avatar.png'
                    }
                    alt="User avatar"
                    className="message-avatar"
                  />
                </Link>
                <div className="message-info">
                  <span className="message-user">{message.userDisplayName}</span>
                  <span className="message-time">
                    {message.timestamp?.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                {message.userId === auth.currentUser?.uid && (
                  <button
                    className="delete-message-button"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form className="message-input" onSubmit={handleSendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!auth.currentUser}
          />
          <div className="emoji-buttons">
            <button 
              type="button" 
              className="emoji-button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              ref={emojiButtonRef}
            >
              😝
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker">
                {['❤️', '👍', '😂', '😍', '🔥', '🎉', '🤔', '👏', '😝',
                    '😢', '🙏', '😁', '😎', '💯', '🥺', '🤯', '😡', '👀', '😅',
                    '😳', '🙌', '😴', '💀', '😇', '😜', '😬', '😏', '🤓', '😔'
                    ].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-option"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button 
          type="submit" 
          disabled={!auth.currentUser || !newMessage.trim()}
          className="send-button"
        >
          {auth.currentUser ? 'Send' : 'Login to Chat'}
        </button>
      </form>
    </div>
  );
};

export default ChatDetails;