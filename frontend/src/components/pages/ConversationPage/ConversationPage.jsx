import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import './ConversationPage.scss';

const ConversationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const conversationRef = doc(db, 'conversations', id);
        const conversationDoc = await getDoc(conversationRef);

        if (conversationDoc.exists()) {
          const participants = conversationDoc.data().participants;
          if (participants.includes(auth.currentUser.uid)) {
            setIsAuthorized(true);
          } else {
            alert('You are not authorized to access this conversation.');
            navigate('/messages');
          }
        } else {
          alert('Conversation not found.');
          navigate('/messages');
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        navigate('/messages');
      }
    };

    checkAuthorization();
  }, [id, navigate]);

  useEffect(() => {
    if (isAuthorized) {
      const fetchMessages = async () => {
        const messagesQuery = query(
          collection(db, 'messages'),
          where('conversationId', '==', id)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesData = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      };

      fetchMessages();
    }
  }, [id, isAuthorized]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      conversationId: id,
      text: newMessage,
      senderId: auth.currentUser.uid,
      timestamp: new Date(),
    };

    await addDoc(collection(db, 'messages'), messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');
  };

  if (!isAuthorized) {
    return null; // Prevent rendering if not authorized
  }

  return (
    <div className="conversation-page">
      <h1>Conversation</h1>
      <div className="messages-list">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="message-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ConversationPage;