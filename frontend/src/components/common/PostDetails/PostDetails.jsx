import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  deleteDoc,
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../../../firebase';
import './PostDetails.scss';
import { Link } from 'react-router-dom';
import Post from '../Post/Post';
import { auth } from '../../../firebase';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikeState = async () => {
      try {
        const postRef = doc(db, 'posts', id);
        const postDoc = await getDoc(postRef);
        const postData = postDoc.data();
  
        const likedBy = postData.likedBy || [];
        setIsLiked(likedBy.includes(auth.currentUser?.uid));
      } catch (error) {
        console.error('Error fetching like state:', error);
      }
    };
  
    fetchLikeState();
  }, [id]);

  useEffect(() => {
    const fetchPostAndUser = async () => {
      try {
        setLoading(true);

        // Fetch the post
        const postRef = doc(db, 'posts', id);
        const postDoc = await getDoc(postRef);

        if (postDoc.exists()) {
          const postData = postDoc.data();
          setPost({
            id: postDoc.id,
            ...postData,
            date: postData.date instanceof Timestamp
              ? postData.date.toDate().toLocaleDateString()
              : postData.date,
          });
          await updateDoc(postRef, { views: increment(1) });
          const userRef = doc(db, 'userInfo', postData.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          }

          // Fetch the user's other posts
          const postsQuery = query(
            collection(db, 'posts'),
            where('userId', '==', postData.userId)
          );
          const postsSnapshot = await getDocs(postsQuery);
          const posts = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserPosts(posts);
        } else {
          console.error('No such document!');
          navigate('/dumy');
        }
      } catch (error) {
        console.error('Error fetching post or user:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('postId', '==', id)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp
              ? data.date.toDate().toLocaleDateString()
              : data.date,
          };
        });
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchPostAndUser();
    fetchComments();
  }, [id, navigate]);

  const toggleLike = async () => {
    try {
      const postRef = doc(db, 'posts', id);
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data();
  
      const likedBy = postData.likedBy || [];
      const userId = auth.currentUser.uid;
  
      if (likedBy.includes(userId)) {
        // Unlike
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: likedBy.filter((id) => id !== userId),
        });
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes - 1,
        }));
        setIsLiked(false);
      } else {
        // Like
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: [...likedBy, userId],
        });
        setPost((prevPost) => ({
          ...prevPost,
          likes: prevPost.likes + 1,
        }));
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const postRef = doc(db, 'posts', id);
        await deleteDoc(postRef);
        alert('Post deleted successfully!');
        navigate('/dumy');
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/dumy/edit/${id}`, { state: { post } });
  };

  const handleEditComment = (commentId, currentText) => {
    const newText = prompt('Edit your comment:', currentText);
    if (newText === null || newText.trim() === '') return;
  
    try {
      const commentRef = doc(db, 'comments', commentId);
      updateDoc(commentRef, { text: newText });
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, text: newText } : comment
        )
      );
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
  
    try {
      const commentRef = doc(db, 'comments', commentId);
      await deleteDoc(commentRef);
  
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, { comments: increment(-1) });
  
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    try {
      const postRef = doc(db, 'posts', id);
      const commentsRef = collection(db, 'comments');
  
      const newCommentData = {
        postId: id,
        text: newComment,
        date: new Date(),
        author: auth.currentUser.displayName,
        authorId: auth.currentUser.uid,
        authorPhotoURL: auth.currentUser.photoURL || `/no_avatar.png`,
      };
  
      const commentRef = await addDoc(commentsRef, newCommentData);
      await updateDoc(postRef, { comments: increment(1) });
  
      setComments([
        ...comments,
        {
          ...newCommentData,
          id: commentRef.id,
          date: new Date().toLocaleDateString(),
        },
      ]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <p>Post not found!</p>
      </div>
    );
  }

  return (
    <div className="post-details-container">
      <div className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>{post.date}</span>
          <span>{post.views} views</span>
        </div>
      </div>

      <div className="post-content">
        {post.image && (
          <img src={post.image} alt={post.title} className="post-image" />
        )}
        <div className="post-description">
          {post.description &&
            post.description.split('<br>').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
        </div>
      </div>

      <div className="post-creator">
        {userInfo && (
          <>
          <h3>About author:</h3>
            <Link to={`/account/${post.userId}`} className="creator-link">
            <img
              src={
                userInfo.photoURL?.startsWith('http')
                  ? userInfo.photoURL
                  : `${userInfo.photoURL || '/no_avatar.png'}`
              }
              alt={userInfo.displayName || 'Unknown User'}
              className="creator-avatar"
              onError={(e) => (e.target.src = `/no_avatar.png`)}
            />

              
              <span className="creator-name">
                {userInfo.displayName || 'Unknown User'}
              </span>
            </Link>
            <p className="about-me">{userInfo.aboutMe || 'No information provided about this user.'}</p>
          </>
        )}
      </div>

      <div className="post-actions">
        <button
          onClick={toggleLike}
          className={`like-button ${isLiked ? 'active' : ''}`}
        >
          <img
            src={isLiked ? `/heart_icon_active.png` : `/heart_icon.png`}
            alt="Like"
          />
          <span>{post.likes || 0}</span>
        </button>

        <button
          onClick={() => setIsCommentsVisible(!isCommentsVisible)}
          className="comment-button"
        >
          <img src={`/comments.png`} alt="Comments" />
          <span>{post.comments || 0}</span>
        </button>
      </div>

      <div className="post-actions">
        {auth.currentUser?.uid === post.userId && (
          <>
            <button onClick={handleEdit} className="edit-button">
              Edit
            </button>
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          </>
        )}
      </div>

      <div className="user-other-posts">
        <h3>Other Posts by {userInfo?.displayName || 'this user'}</h3>
        <div className="posts-grid">
          {userPosts.length > 0 ? (
            userPosts.map((post) => <Post key={post.id} post={post} />)
          ) : (
            <p>No other posts available.</p>
          )}
        </div>
      </div>

      {isCommentsVisible && (
        <div className="comments-modal">
          <div className="comments-container">
            <h3>Comments ({comments.length})</h3>
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <Link to={`/account/${comment.authorId}`} className="comment-author">
                    <img
                      src={
                        userInfo.photoURL?.startsWith('http')
                          ? userInfo.photoURL
                          : `${userInfo.photoURL || '/no_avatar.png'}`
                      }
                      alt={userInfo.displayName || 'Unknown User'}
                      className="comment-avatar"
                      onError={(e) => (e.target.src = `/no_avatar.png`)}
                    />
                      <span>{comment.author}</span>
                    </Link>
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-meta">
                      <span>{comment.date}</span>
                      {auth.currentUser?.uid === comment.authorId && (
                        <div className="comment-actions">
                          <button
                            onClick={() => handleEditComment(comment.id, comment.text)}
                            className="edit-comment-button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="delete-comment-button"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No comments yet</p>
              )}
            </div>
            <div className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
              />
              <button onClick={handleAddComment}>Post Comment</button>
            </div>
            <button
              onClick={() => setIsCommentsVisible(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}