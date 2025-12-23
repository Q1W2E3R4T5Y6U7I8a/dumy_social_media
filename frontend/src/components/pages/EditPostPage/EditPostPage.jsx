import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import './EditPostPage.scss';

const EditPostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { post } = location.state;

  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [category, setCategory] = useState(post.category);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!title || !description) {
      setError('Title and description are required');
      return;
    }

    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        title,
        description,
        category,
      });
      alert('Post updated successfully!');
      navigate(`/dumy/${post.id}`);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post');
    }
  };

  return (
    <div className="edit-post-container">
      <h1>Edit Post</h1>
      {error && <span className="error-message">{error}</span>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows="5"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="psychology">Psychology</option>
        <option value="science">Science</option>
        <option value="art">Art</option>
        <option value="philosophy">Philosophy</option>
        <option value="productivity">Productivity</option>
        <option value="uncategorized">Uncategorized</option>
      </select>
      <button onClick={handleSubmit}>Update Post</button>
    </div>
  );
};

export default EditPostPage;