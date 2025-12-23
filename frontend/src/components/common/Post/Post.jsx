import React from 'react';
import { Link } from 'react-router-dom';
import './Post.scss';

const Post = ({ post }) => {
  return (

    <Link to={`/dumy/${post.id}`} className="post-container">
      <div className="post-image-container">
        <img src={post.image} alt={post.title} className="post-image" />
        <div className="title-container">
          <h3 className="title-text">{post.title}</h3>
        </div>
      </div>
      <div className="stats-container">
        <div className="stat-item">
          <img src={`/view.png`} alt="Views" className="icon" />
          <span className="stat-text">{post.views}</span>
        </div>
        <div className="stat-item">
          <img src={`/heart_icon_active.png`} alt="Likes" className="icon" />
          <span className="stat-text">{post.likes}</span>
        </div>
        <div className="stat-item">
          <img src={`/comments.png`} alt="Comments" className="icon" />
          <span className="stat-text">{post.comments}</span>
        </div>
        <div className="stat-item">
          <span className="stat-text">{post.date}</span>
        </div>
      </div>
    </Link>
    
  );
};

export default Post;