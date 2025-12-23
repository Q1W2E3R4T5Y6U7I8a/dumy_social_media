import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import Post from '../../common/Post/Post';
import './DumyPage.scss';

const DumyPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const postsData = [];
        const categoriesSet = new Set(['uncategorized']);
  
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const dateField = data.date instanceof Timestamp ? data.date.toDate().toLocaleDateString() : data.date;
          if (data.category) {
            categoriesSet.add(data.category);
          } else {
            categoriesSet.add('uncategorized');
          }
  
          postsData.push({
            id: doc.id,
            ...data,
            date: dateField,
            description: data.description || '',
            userPhotoURL: data.userPhotoURL || '/no_avatar.png',
            userId: data.userId || '',
            category: data.category || 'uncategorized',
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0
          });
        });

        const categoriesArray = Array.from(categoriesSet);
        setCategories(categoriesArray);
        const savedCategories = localStorage.getItem('selectedCategories');
        const initialSelected = {};
        
        categoriesArray.forEach(cat => {
          initialSelected[cat] = savedCategories ? 
            JSON.parse(savedCategories)[cat] !== false : true;
        });
        
        setSelectedCategories(initialSelected);
        setPosts(postsData);
      } catch (err) {
        setError('Error loading posts');
        console.error('Error fetching posts:', err);
      }
    };
  
    fetchPosts();
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    
    let result = [...posts];
    
    result = result.filter(post => {
      return selectedCategories[post.category] !== false;
    });
    
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });
    
    setFilteredPosts(result);
    setCurrentPage(1);
  }, [posts, sortBy, selectedCategories]);

  const handleDelete = async (id, isOwner) => {
    if (!isOwner) return alert("You can't delete someone else's post!");
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'posts', id));
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectAllCategories = (select = true) => {
    const updated = {};
    categories.forEach(cat => {
      updated[cat] = select;
    });
    setSelectedCategories(updated);
  };

  const postsPerPage = 8;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dumy-container">
      <div className="controls-container">

      <div className="posts-grid">
        {paginatedPosts.map(post => (
          <div key={post.id} className="post">
            <Post post={post} />
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="no-posts-message">
          No posts match your current filters
        </div>
      )}

      {filteredPosts.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
          <div className="filter-controls">
            <div className="sort-toggle-container">
              <button 
                className="sort-toggle-button"
                onClick={() => setShowSortOptions(!showSortOptions)}
              >
                Sort by:
                <span className={`toggle-arrow ${showSortOptions ? 'open' : ''}`}>▼</span>
              </button>
  
              {showSortOptions && (
                <div className="sort-options-dropdown">
                  <button 
                        onClick={() => setSortBy('date')} 
                        className={sortBy === 'date' ? 'active' : ''}
                      >
                        Date
                      </button>
                      <button 
                        onClick={() => setSortBy('views')} 
                        className={sortBy === 'views' ? 'active' : ''}
                      >
                        Views
                      </button>
                      <button 
                        onClick={() => setSortBy('likes')} 
                        className={sortBy === 'likes' ? 'active' : ''}
                      >
                        Likes
                      </button>
                      <button 
                        onClick={() => setSortBy('comments')} 
                        className={sortBy === 'comments' ? 'active' : ''}
                      >
                        Comments
                      </button>
                </div>
              )}
            </div>
  
            <div className="filter-toggle-container">
              <button 
                className="filter-toggle-button"
                onClick={() => setShowFilterOptions(!showFilterOptions)}
              >
                Selected categories:
                <span className={`toggle-arrow ${showFilterOptions ? 'open' : ''}`}>▼</span>
              </button>
  
              {showFilterOptions && (
                <div className="filter-options-dropdown">
                  <div className="category-header">
                    <div className="category-actions">
                      <button onClick={() => selectAllCategories(true)}>All</button>
                      <button onClick={() => selectAllCategories(false)}>None</button>
                    </div>
                  </div>
                  <div className="category-checkboxes">
                    {categories.map(category => (
                      <label key={category} className="category-label">
                        <input
                          type="checkbox"
                          checked={selectedCategories[category] !== false}
                          onChange={() => handleCategoryToggle(category)}
                          hidden
                        />
                        <span className="checkbox-custom"></span>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      <div className="add-post-button" onClick={() => navigate('/dumy/add')}>
        <div className="plus-icon">+</div>
      </div>
    </div>
  );
};

export default DumyPage;