import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MessagesPage.scss';

const MessagesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const conversations = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ];

  if (id) {
    return (
      <div className="messages-page">
        <h1>Conversation with {id}</h1>
        {/* Add chat messages and input here */}
      </div>
    );
  }

  return (
    <div className="messages-page">
      <h1>Your Messages</h1>
      <div className="conversations-list">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="conversation-card"
            onClick={() => navigate(`/messages/${conversation.id}`)}
          >
            <h3>{conversation.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;