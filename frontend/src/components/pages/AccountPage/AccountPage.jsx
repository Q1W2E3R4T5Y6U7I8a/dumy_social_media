import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db, auth } from '../../../firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import Post from '../../common/Post/Post';
import { updateProfile } from 'firebase/auth';
import './AccountPage.scss';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AccountPage = () => {
  const [friends, setFriends] = useState([]);
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [userBooks, setUserBooks] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
  const avatarOptions = [
    `/avatar_1.png`,
    `/avatar_2.png`,
    `/avatar_3.png`,
    `/avatar_4.png`,
    `/avatar_5.png`,
    `/avatar_6.png`,
    `/avatar_7.png`,
    `/avatar_8.png`,
    `/avatar_9.png`,
    `/avatar_10.png`,
    `/avatar_11.png`,
    `/avatar_12.png`,
  ];
  const selectionOptions = {
    religion: ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 'Atheism', 'Other'],
    politicalViews: ['Liberal', 'Conservative', 'Moderate', 'Socialist', 'Cosmopolitan', 'Libertarian', 'Other'],
    personalPriority: ['Family', 'Career', 'Health', 'Wealth', 'Spirituality', 'Relationships'],
    importantInOthers: ['Honesty', 'Intelligence', 'Kindness', 'Humor', 'Ambition', 'Loyalty'],
    viewsOnSmoking: ['Never', 'Occasionally', 'Socially', 'Regularly', 'Against it'],
    viewsOnAlcohol: ['Never', 'Occasionally', 'Socially', 'Regularly', 'Against it']
  };

  const initialUserInfo = {
    email: '',
    displayName: '',
    photoURL: '/no_avatar.png',
    hometown: '',
    work: '',
    education: '',
    mobile: '',
    activities: '',
    interests: '',
    favoriteMusic: '',
    favoriteMovies: '',
    favoriteTVShow: '',
    favoriteBooks: '',
    favoriteGames: '',
    favoriteQuote: '',
    aboutMe: '',
    religion: '',
    politicalViews: '',
    personalPriority: '',
    importantInOthers: '',
    viewsOnSmoking: '',
    viewsOnAlcohol: '',
    inspiredBy: '',
  };

  const [userInfo, setUserInfo] = useState(initialUserInfo);
  const [loading, setLoading] = useState(true);
  const [profileOwnerInfo, setProfileOwnerInfo] = useState({ displayName: 'User', photoURL: '/no_avatar.png' });

  useEffect(() => {
    // Check if this is the current user's profile
    setIsCurrentUserProfile(currentUser && id === currentUser.uid);
  }, [id, currentUser]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!id) return;

      try {
        const userRef = doc(db, 'userInfo', id);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const friendsIds = userDoc.data().friends || [];
          const friendsData = await Promise.all(
            friendsIds.map(async (friendId) => {
              const friendRef = doc(db, 'userInfo', friendId);
              const friendDoc = await getDoc(friendRef);
              return friendDoc.exists() ? { id: friendId, ...friendDoc.data() } : null;
            })
          );
          setFriends(friendsData.filter((friend) => friend !== null));
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, [id]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Load the profile data for the user specified in the URL (id)
        const userRef = doc(db, "userInfo", id);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          setProfileOwnerInfo({
            displayName: firestoreData.displayName || 'User',
            photoURL: firestoreData.photoURL || '/no_avatar.png',
          });

          // Load books for this user
          const q = query(collection(db, 'books'), where('userId', '==', id));
          const querySnapshot = await getDocs(q);
          const books = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Load posts for this user
          const postsQuery = query(collection(db, 'posts'), where('userId', '==', id));
          const postsSnapshot = await getDocs(postsQuery);
          const posts = postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          const authData = isCurrentUserProfile ? {
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || '/no_avatar.png'
          } : {};

          const mergedData = {
            ...initialUserInfo,
            ...firestoreData,
            ...authData
          };

          Object.keys(mergedData).forEach(key => {
            if (mergedData[key] === undefined) {
              mergedData[key] = '';
            }
          });

          setUserInfo(mergedData);
          setUserBooks(books);
          setUserPosts(posts);
        } else {
          setProfileOwnerInfo({ displayName: 'User', photoURL: '/no_avatar.png' });
          setUserInfo(initialUserInfo);
          setUserBooks([]);
          setUserPosts([]);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [id, isCurrentUserProfile, currentUser]);

  const handleAvatarSelect = async (avatarUrl) => {
    try {
      if (!isCurrentUserProfile) return;

      const relativeAvatarUrl = avatarUrl.replace(``, '');

      await updateProfile(auth.currentUser, {
        photoURL: relativeAvatarUrl
      });

      const userRef = doc(db, 'userInfo', auth.currentUser.uid);
      await setDoc(userRef, {
        photoURL: relativeAvatarUrl
      }, { merge: true });

      setUserInfo(prev => ({
        ...prev,
        photoURL: relativeAvatarUrl
      }));
      setProfileOwnerInfo(prev => ({ ...prev, photoURL: relativeAvatarUrl }));
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!isCurrentUserProfile) return;

      const userRef = doc(db, 'userInfo', currentUser.uid);
      await setDoc(userRef, userInfo, { merge: true });
      alert('Profile updated successfully!');
      setIsEditing(false);
      setProfileOwnerInfo({ ...profileOwnerInfo, displayName: userInfo.displayName, photoURL: userInfo.photoURL });
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    if (!isCurrentUserProfile) return;

    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="account-container">
      <div className="profile-section">
        <div className="profile-card">
          <div className="profile-header">
            <img
              src={
                profileOwnerInfo.photoURL?.startsWith('http')
                  ? profileOwnerInfo.photoURL
                  : `${profileOwnerInfo.photoURL || '/no_avatar.png'}`
              }
              alt="Profile"
              className="current-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `/no_avatar.png`;
              }}
            />
            {isEditing ? (
              <div className="profile-name">
                <input
                  type="text"
                  name="displayName"
                  value={userInfo.displayName}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="editable-input"
                />
              </div>
            ) : (
              <h2 className="profile-name">{profileOwnerInfo.displayName}</h2>
            )}
          </div>

          {isEditing && isCurrentUserProfile && (
            <div className="avatar-selection">
              <h3>Choose Your Avatar</h3>
              <div className="avatar-grid">
                {avatarOptions.map((avatar, index) => (
                  <div
                    key={index}
                    className={`avatar-option ${userInfo.photoURL === avatar.replace(``, '') ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <img src={avatar} alt={`Avatar ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCurrentUserProfile && (
            <>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
              <button
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                className={`edit-profile-btn ${isEditing ? 'save' : ''}`}
              >
                {isEditing ? 'Save' : 'Edit Profile'}
              </button>
            </>
          )}

          <div className="friends-block">
            <h3>Friends ({friends.length})</h3>
            <div className="friends-list">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div key={friend.id} className="friend-card">
                    <img
                      src={
                        friend.photoURL?.startsWith('http')
                          ? friend.photoURL
                          : `${friend.photoURL || '/no_avatar.png'}`
                      }
                      alt={friend.displayName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/no_avatar.png`;
                      }}
                    />
                    <Link to={`/account/${friend.id}`}>{friend.displayName}</Link>
                  </div>
                ))
              ) : (
                <p>No friends yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">


        <div className="profile-info-section">
          <div className="basic-info">
            <h3>User's info:</h3>
            <div className="form-grid">
              {['hometown', 'work', 'education', 'mobile', 'activities', 'interests'].map(field => (
                <div className="form-group" key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {isEditing && isCurrentUserProfile ? (
                    <input
                      type="text"
                      name={field}
                      value={userInfo[field]}
                      onChange={handleInputChange}
                      className="editable-input"
                    />
                  ) : (
                    <div className="info-text">{userInfo[field] || 'Not specified'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="favorites-section">
            <h3></h3>
            <div className="form-grid">
              {['favoriteMusic', 'favoriteMovies', 'favoriteTVShow', 'favoriteBooks', 'favoriteGames'].map(field => (
                <div className="form-group" key={field}>
                  <label>{field.replace('favorite', 'Favorite ').replace(/([A-Z])/g, ' $1')}</label>
                  {isEditing && isCurrentUserProfile ? (
                    <input
                      type="text"
                      name={field}
                      value={userInfo[field]}
                      onChange={handleInputChange}
                      className="editable-input"
                    />
                  ) : (
                    <div className="info-text">{userInfo[field] || 'Not specified'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="personal-section">
            <div className="rich-text-fields">
              <div className="form-group">
                <label>Favorite Quote</label>
                {isEditing && isCurrentUserProfile ? (
                  <textarea
                    name="favoriteQuote"
                    value={userInfo.favoriteQuote}
                    onChange={handleInputChange}
                    className="rich-textarea"
                  />
                ) : (
                  <div className="info-text">{userInfo.favoriteQuote || 'Not specified'}</div>
                )}
              </div>

              <div className="form-group">
                <label>About Me</label>
                {isEditing && isCurrentUserProfile ? (
                  <textarea
                    name="aboutMe"
                    value={userInfo.aboutMe}
                    onChange={handleInputChange}
                    className="rich-textarea"
                  />
                ) : (
                  <div className="info-text">{userInfo.aboutMe || 'Not specified'}</div>
                )}
              </div>
            </div>

            <div className="selection-fields">
              {Object.keys(selectionOptions).map((field) => (
                <div className="form-group" key={field}>
                  <label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                  {isEditing && isCurrentUserProfile ? (
                    <select
                      name={field}
                      value={userInfo[field]}
                      onChange={handleInputChange}
                      className="styled-select"
                    >
                      <option value="">Select an option</option>
                      {selectionOptions[field].map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="info-text">{userInfo[field] || 'Not specified'}</div>
                  )}
                </div>
              ))}

              <div className="form-group">
                <label>Inspired By</label>
                {isEditing && isCurrentUserProfile ? (
                  <input
                    type="text"
                    name="inspiredBy"
                    value={userInfo.inspiredBy}
                    onChange={handleInputChange}
                    className="editable-input"
                  />
                ) : (
                  <div className="info-text">{userInfo.inspiredBy || 'Not specified'}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="user-posts">

          <h3>{isCurrentUserProfile ? 'Your Posts' : `${profileOwnerInfo.displayName}'s posts`}</h3>
          <div className="posts-grid">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <Post key={post.id} post={post} />
              ))
            ) : (
              <p>No posts yet</p>
            )}
          </div>
        </div>

        <div className="user-books">
          <h3>{isCurrentUserProfile ? 'Your Books' : `${profileOwnerInfo.displayName}'s books`}</h3>
          <div className="book-list">
            {userBooks.length > 0 ? (
              userBooks.map((book, index) => (
                <div key={book.id || index} className="book-card">
                  <img
                    src={
                      book.imageUrl
                    }
                    style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                    alt={book.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/no_cover.png`;
                    }}
                  />
                  <div className="book-details">
                    <Link to={`/books/${book.id}`} className="book-link">
                      {book.title}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p>No books yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;