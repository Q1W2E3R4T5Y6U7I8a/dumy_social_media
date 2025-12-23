import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState({
    title: '',
    author: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookRef = doc(db, 'books', id);
        const bookDoc = await getDoc(bookRef);
        if (bookDoc.exists()) {
          setBook(bookDoc.data());
        } else {
          navigate('/books');
        }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const bookRef = doc(db, 'books', id);
      await updateDoc(bookRef, {
        ...book,
        updatedAt: new Date()
      });
      navigate(`/books/${id}`);
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="edit-book-container">
      <h1>Edit Book</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={book.title}
            onChange={(e) => setBook({...book, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={book.description}
            onChange={(e) => setBook({...book, description: e.target.value})}
            rows={5}
          />
        </div>

        <div className="form-group">
          <label> Image URL </label>
          <input
            type="text"
            value={book.imageUrl}
            onChange={(e) => setBook({...book, imageUrl: e.target.value})}
            required
          />
          {book.imageUrl && (
            <img src={book.imageUrl} alt="Preview" className="image-preview" />
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(`/books/${id}`)}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook;