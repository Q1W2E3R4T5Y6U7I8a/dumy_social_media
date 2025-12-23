import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import './BookDetails.scss';
import { Link } from 'react-router-dom';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookAndUser = async () => {
      try {
        setLoading(true);
        const bookRef = doc(db, 'books', id);
        const bookDoc = await getDoc(bookRef);

        if (bookDoc.exists()) {
          const bookData = bookDoc.data();
          setBook({
            id: bookDoc.id,
            ...bookData,
            date: bookData.createdAt?.toDate().toLocaleDateString() || 'Unknown date'
          });

          await updateDoc(bookRef, { views: increment(1) });

          // Fetch user info
          const userRef = doc(db, 'userInfo', bookData.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          }

          // Fetch user's other books
          const booksQuery = query(
            collection(db, 'books'),
            where('userId', '==', bookData.userId)
          );
          const booksSnapshot = await getDocs(booksQuery);
          const booksData = booksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserBooks(booksData.filter(b => b.id !== id));

          // Check if liked
          const likedBy = bookData.likedBy || [];
          setIsLiked(likedBy.includes(auth.currentUser?.uid));
        } else {
          navigate('/books');
        }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsQuery = query(
          collection(db, 'commentsBooks'),
          where('bookId', '==', id)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate().toLocaleDateString() || 'Unknown date'
        }));
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchBookAndUser();
    fetchComments();
  }, [id, navigate]);

  const toggleLike = async () => {
    try {
      const bookRef = doc(db, 'books', id);
      const bookDoc = await getDoc(bookRef);
      const bookData = bookDoc.data();
      const likedBy = bookData.likedBy || [];
      const userId = auth.currentUser?.uid;

      if (likedBy.includes(userId)) {
        await updateDoc(bookRef, {
          likes: increment(-1),
          likedBy: likedBy.filter(id => id !== userId)
        });
        setIsLiked(false);
      } else {
        await updateDoc(bookRef, {
          likes: increment(1),
          likedBy: [...likedBy, userId]
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteDoc(doc(db, 'books', id));
        navigate('/books');
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };


  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    try {
      const user = auth.currentUser;
  
      // Fetch fallback displayName from userInfo collection
      let displayName = user.displayName;
      if (!displayName) {
        const userDoc = await getDoc(doc(db, 'userInfo', user.uid));
        displayName = userDoc.exists() ? userDoc.data().displayName || 'Anonymous' : 'Anonymous';
      }
  
      const authorPhotoURL = user.photoURL || `/no_avatar.png`;
  
      const commentRef = await addDoc(collection(db, 'commentsBooks'), {
        bookId: id,
        text: newComment,
        date: new Date(),
        author: displayName,
        authorId: user.uid,
        authorPhotoURL
      });
  
      await updateDoc(doc(db, 'books', id), {
        comments: increment(1)
      });
  
      setComments([...comments, {
        id: commentRef.id,
        text: newComment,
        date: new Date().toLocaleDateString(),
        author: displayName,
        authorId: user.uid,
        authorPhotoURL
      }]);
  
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteDoc(doc(db, 'commentsBooks', commentId));
        await updateDoc(doc(db, 'books', id), {
          comments: increment(-1)
        });
        setComments(comments.filter(c => c.id !== commentId));
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!book) {
    return <div className="error">Book not found</div>;
  }

  return (
    <div className="book-details-container">
      <div className="book-header">
        <h1>{book.title}</h1>
        <div className="book-meta">
          <span>Posted on {book.date}</span>
        </div>
      </div>

      <div className="book-content">
        <img src={book.imageUrl} alt={book.title} className="book-cover-large" />
        <div 
            className="book-description"
            dangerouslySetInnerHTML={{
                __html: book.description 
                ? book.description
                    .replace(/\n\n/g, '<br><br>')
                    .replace(/\n/g, '<br>')
                : 'No description provided.'
            }}
            />
      </div>

      <div className="book-creator">
        <h3>Added by:</h3>
        <Link to={`/account/${book.userId}`} className="creator-link">
          <img
            src={
              userInfo?.photoURL?.startsWith('http')
                ? userInfo.photoURL
                : `${userInfo?.photoURL || '/no_avatar.png'}`
            }
            alt={userInfo?.displayName || 'Unknown User'}
            className="creator-avatar"
          />
          <span>{userInfo?.displayName || 'Unknown User'}</span>
        </Link>
      </div>

      <div className="book-actions">
        <button 
          onClick={toggleLike} 
          className={`like-button ${isLiked ? 'liked' : ''}`}
        >
          {isLiked ? '❤️' : '🤍'} {book.likes || 0}
        </button>

        {auth.currentUser?.uid === book.userId && (
          <>
           <button 
            onClick={() => navigate(`/books/edit/${book.id}`)} 
            className="edit-button"
            >
            Edit
            </button>
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          </>
        )}
      </div>

      <div className="user-other-books">
        <h3>Other books by {userInfo?.displayName || 'this user'}</h3>
        <div className="books-grid">
          {userBooks.length > 0 ? (
            userBooks.map(book => (
              <div key={book.id} className="book-card-small">
                <Link to={`/books/${book.id}`}>
                  <img src={book.imageUrl} alt={book.title} />
                  <h4>{book.title}</h4>
                </Link>
              </div>
            ))
          ) : (
            <p>No other books available</p>
          )}
        </div>
      </div>
      {isCommentsVisible && (
  <div className="comments-section">
    <h3>Comments ({comments.length})</h3>

    <div className="comments-list">
      {comments.length > 0 ? (
        comments.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <Link to={`/account/${comment.authorId}`} className="comment-author">
                <img
                  src={
                    comment.authorPhotoURL?.startsWith('http')
                      ? comment.authorPhotoURL
                      : `${comment.authorPhotoURL || '/no_avatar.png'}`
                  }
                  alt={comment.author || 'User'}
                  className="comment-avatar"
                />
                <span>{comment.author}</span>
              </Link>
              <span className="comment-date">{comment.date}</span>
            </div>

            <p className="comment-text">{comment.text}</p>

            {auth.currentUser?.uid === comment.authorId && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="delete-comment"
              >
                Delete
              </button>
            )}
          </div>
        ))
      ) : (
        <p>No comments yet</p>
      )}
    </div>

    {auth.currentUser ? (
      <div className="add-comment">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
        />
        <button 
          onClick={handleAddComment} 
          disabled={!newComment.trim()}
        >
          Post Comment
        </button>
      </div>
    ) : (
      <p className="login-to-comment">Log in to write a comment.</p>
    )}
  </div>
)}

    </div>
  );
};

export default BookDetails;