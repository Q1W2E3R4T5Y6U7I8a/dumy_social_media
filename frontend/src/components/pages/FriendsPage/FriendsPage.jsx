import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { useNavigate } from 'react-router-dom';
import './FriendsPage.scss';

import { query, addDoc, where } from 'firebase/firestore';

const FriendsPage = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const navigateToProfile = (userId) => {
    navigate(`/account/${userId}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'userInfo'));
      const usersData = usersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== auth.currentUser.uid); // Exclude yourself
      setUsers(usersData);
    };

    const fetchFriends = async () => {
      const userRef = doc(db, 'userInfo', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setFriends(userDoc.data().friends || []);
      }
    };

    fetchUsers();
    fetchFriends();
  }, []);

  const handleAddFriend = async (userId) => {
    const userRef = doc(db, 'userInfo', auth.currentUser.uid);
    await updateDoc(userRef, {
      friends: arrayUnion(userId),
    });
    setFriends((prev) => [...prev, userId]);
  };

  const handleRemoveFriend = async (userId) => {
    const userRef = doc(db, 'userInfo', auth.currentUser.uid);
    await updateDoc(userRef, {
      friends: arrayRemove(userId),
    });
    setFriends((prev) => prev.filter((id) => id !== userId));
  };

  const handleMessage = async (userId) => {
    try {
      const conversationsRef = collection(db, 'conversations');
      const conversationsQuery = query(
        conversationsRef,
        where('participants', 'array-contains', auth.currentUser.uid)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
  
      // Check if a conversation already exists between the two users
      const existingConversation = conversationsSnapshot.docs.find((doc) =>
        doc.data().participants.includes(userId)
      );
  
      let conversationId;
      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create a new conversation
        const newConversation = await addDoc(conversationsRef, {
          participants: [auth.currentUser.uid, userId],
          createdAt: new Date(),
        });
        conversationId = newConversation.id;
      }
  
      // Navigate to the conversation
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error creating or fetching conversation:', error);
    }
  };

  return (
    <div className="friends-page">
      <div className="friends-section">
        <div className="all-users">
          <h2>All Users</h2>
          <div className="users-list">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div 
                      className="avatar-container"
                      onClick={() => navigateToProfile(user.id)}
                      style={{ cursor: 'pointer' }}
                    >
                  <img 
                      src={
                        user.photoURL?.startsWith('http') 
                          ? user.photoURL 
                          : `${user.photoURL || '/no_avatar.png'}`
                      }
                      alt={user.displayName || 'User avatar'}
                      className="user-avatar"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop if fallback also fails
                        e.target.src = `/no_avatar.png`;
                      }}
                    />
                </div>
                <h3>{user.displayName}</h3>
                <p>{user.aboutMe || 'No information provided.'}</p>
                {friends.includes(user.id) ? (
                  <button onClick={() => handleRemoveFriend(user.id)}>Remove Friend</button>
                ) : (
                  <button onClick={() => handleAddFriend(user.id)}>Add Friend</button>
                )}
              </div>
            ))}
          </div>
        </div>
        {friends.length > 0 && (
          <div className="your-friends">
            <h2>Your Friends</h2>
            <div className="users-list">
              {users
                .filter((user) => friends.includes(user.id))
                .map((user) => (
                  <div key={user.id} className="user-card">
                   <div 
                      className="avatar-container"
                      onClick={() => navigateToProfile(user.id)}
                      style={{ cursor: 'pointer' }}
                    >
                    <img 
                        src={
                          user.photoURL?.startsWith('http') 
                            ? user.photoURL 
                            : `${user.photoURL || '/no_avatar.png'}`
                        }
                        alt={user.displayName || 'User avatar'}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop if fallback also fails
                          e.target.src = `/no_avatar.png`;
                        }}
                      />
                   </div>
                    <h3>{user.displayName}</h3>
                    <p>{user.aboutMe || ''}</p>
                    <button onClick={() => handleRemoveFriend(user.id)}>Remove Friend</button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;