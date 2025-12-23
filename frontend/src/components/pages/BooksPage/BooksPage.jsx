import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import './BooksPage.scss';
import { Link } from 'react-router-dom';

const BooksPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAvatars, setUserAvatars] = useState({});
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newBook, setNewBook] = useState({
    id: null,
    title: '',
    author: '',
    contact: '',
    description: '',
    imageUrl: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'books'), async (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      }));
      
      setBooks(booksData);
      
      const userIds = [...new Set(booksData.map(book => book.userId))];
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
  }, []);

  useEffect(() => {
    let result = [...books];
    
    // Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return b.date - a.date;
      }
      return (b[sortBy] || '').localeCompare(a[sortBy] || '');
    });
    
    setFilteredBooks(result);
    setCurrentPage(1);
  }, [books, sortBy]);

  const addOrUpdateBook = async () => {
    if (isSubmitting) return;
  
    const { id, title, author, contact, description, imageUrl } = newBook;
    if (!title || !imageUrl) {
      alert('Title and image are required');
      return;
    }
  
    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        await updateDoc(doc(db, 'books', id), {
          title,
          author,
          contact,
          description,
          imageUrl,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'books'), {
          title,
          author,
          contact,
          description,
          imageUrl,
          userId: auth.currentUser.uid,
          userPhotoURL: auth.currentUser.photoURL || `/no_avatar.png`,
          createdAt: new Date(),
          views: 0,
          likes: 0,
          comments: 0
        });
      }
  
      setModalVisible(false);
      setNewBook({ id: null, title: '', author: '', contact: '', description: '', imageUrl: '' });
      setIsEditing(false);
    } catch (err) {
      console.error('Firebase error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleEdit = (book) => {
    setNewBook({
      id: book.id,
      title: book.title,
      author: book.author,
      contact: book.contact,
      description: book.description,
      imageUrl: book.imageUrl
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteDoc(doc(db, 'books', id));
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const booksPerPage = 8;
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );



  return (
    <div className="books-page">
      <div className="container">
        <div className="header-section">
          <p className="quote">
            "Strangely and non natural seems a person, that exists without books"
            <span> ©️ Taras Shevchenko</span>
          </p>
        </div>

        <div className="controls-container">
          <button 
            className="add-btn" 
            onClick={() => setModalVisible(true)}
          >
            + Add Book
          </button>

          {/* {<div className="sort-toggle-container">
            <button 
              className="sort-toggle-button"
              onClick={() => setShowSortOptions(!showSortOptions)}
            >
              Sort by: {sortBy}
              <span className={`toggle-arrow ${showSortOptions ? 'open' : ''}`}>▼</span>
            </button>

            {showSortOptions && (
              <div className="sort-options-dropdown">
                <button onClick={() => setSortBy('title')}>Title</button>
                <button onClick={() => setSortBy('author')}>Author</button>
                <button onClick={() => setSortBy('date')}>Date</button>
              </div>
            )}
          </div>} */}
        </div>

        <div className="books-grid">
          {paginatedBooks.map(book => (
            <div key={book.id} className="book-card">
              <Link to={`/books/${book.id}`} className="book-link">
                <img 
                  src={book.imageUrl} 
                  alt={book.title} 
                  className="book-cover"
                />
              </Link>

              <div className="book-info">

                <div className="book-meta">
                  <Link to={`/account/${book.userId}`} className="creator-link">
                    <img
                      src={
                        userAvatars[book.userId]?.startsWith('http')
                          ? userAvatars[book.userId]
                          : `${userAvatars[book.userId] || '/no_avatar.png'}`
                      }
                      alt="User Avatar"
                      className="creator-avatar"
                    />
                  </Link>
                  <Link to={`/books/${book.id}`} className="book-title">
                  {book.title}
                </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="empty-state">
            Loading...
          </div>
        )}

        {filteredBooks.length > 0 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {modalVisible && (
          <div className="modal">
            <div className="modal-content">
              <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
              
                <label>Title*</label>
              <div className="form-group">
                <input
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="Book title"
                />
              </div>


                <label>Description</label>
              <div className="form-group">
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Book description"
                />
              </div>

              <label>Cover Image*</label>
              <div className="form-group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setNewBook({ ...newBook, imageUrl: reader.result });
                    };
                    if (file) reader.readAsDataURL(file);
                  }}
                />
                {newBook.imageUrl && (
                  <img 
                    src={newBook.imageUrl} 
                    alt="Preview" 
                    className="image-preview"
                  />
                )}
              </div>

              <div className="modal-actions">
                <button onClick={addOrUpdateBook} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : isEditing ? 'Update Book' : 'Add Book'}
                </button>
                <button 
                  onClick={() => setModalVisible(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksPage;