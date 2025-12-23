import React from 'react';
import useDailyContent from '../../../hooks/useDailyContext';
import './QuoteSquare.scss';

const QuoteSquare = () => {
  const { dayCount, quote, author, backgroundImage, isLoading } = useDailyContent();
  
  return (
    <div className="quote-square">
      {isLoading ? (
        <div className="quote-square__loading">Loading daily content...</div>
      ) : (
        <>
          <div 
            className="quote-square__background" 
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {/* Add logo images */}
          <img 
            src={`/DUMY_logo_black.png`} 
            alt="Logo" 
            className="quote-square__logo quote-square__logo--left"
          />
          
          <div className="quote-square__content">
            <img 
              src={`/brackets_left.png`} 
              alt="Left quote mark" 
              className="quote-square__scobe quote-square__scobe--left"
            />
            
            {/* Main content */}
            <div className="quote-square__text">
              <p className="quote-square__quote">{quote}</p>
              {author && <p className="quote-square__author">— {author}</p>}
            </div>
            
            <img 
              src={`/brackets_right.png`} 
              alt="Right quote mark" 
              className="quote-square__scobe quote-square__scobe--right"
            />
            
            <div className="quote-square__count">{dayCount}/366</div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuoteSquare;