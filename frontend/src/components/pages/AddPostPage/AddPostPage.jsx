import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import './AddPostPage.scss';
import { auth } from '../../../firebase';


const AddPostPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); 
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title || !image || !description) { 
      setError('Title, description, and image are required');
      return;
    }

    const formattedDescription = description
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

    try {
      await addDoc(collection(db, 'posts'), {
        title,
        description: formattedDescription,
        category,
        image,
        userId: auth.currentUser.uid,
        userPhotoURL: auth.currentUser.photoURL || '/no_avatar.png', 
        date: Timestamp.now().toDate().toISOString().split('T')[0],
        likes: 0,
        views: 0,
        comments: 0,
      });
      alert('Post added successfully!');
    } catch (err) {
      console.error('Error adding post:', err);
      setError('Failed to add post');
    }
  };

  return (
    <div className="add-post-container">
      <h1>Add New Post</h1>
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
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button onClick={handleSubmit}>Add Post</button>
    </div>
  );
};

export default AddPostPage;