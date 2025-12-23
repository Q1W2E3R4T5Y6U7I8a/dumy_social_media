import React, { useState, useRef, useEffect, useContext } from 'react';
import './DumaPage.scss';
import { flashcards } from './flashcards.js';
import { endingFlashcards } from './endingFlashcards.js';
import { AudioManagerContext } from '../../../context/AudioManager.js';
import { useNavigate } from 'react-router-dom';

const elementIcons = {
  air: '/air_icon.png',
  earth: '/earth_icon.png',
  fire: '/fire_icon.png',
  water: '/water_icon.png'
};

const initialElements = {
  air: 1,
  earth: 1,
  fire: 1,
  water: 1
};

const swipeSound = new Audio(`/card_swipe.mp3`);

export default function DumaPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [editorError, setEditorError] = useState('');

  const { playMusic, stopAllMusic } = useContext(AudioManagerContext);
  const [elements, setElements] = useState(initialElements);
  const [days, setDays] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showEnding, setShowEnding] = useState(null);
  const [timeLabel, setTimeLabel] = useState("Time before existence");
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [cardStack, setCardStack] = useState([...flashcards]);
  const cardRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoverChoice, setHoverChoice] = useState(null);
  const [nextCardVisible, setNextCardVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState('transparent');
  const audioRef = useRef(null); 

useEffect(() => {
  playMusic('duma');
  return () => {
    stopAllMusic();
  };
}, [playMusic, stopAllMusic]);

  useEffect(() => {
    const currentCard = getCurrentCard();
    if (currentCard && currentCard.music) {
      const music = new Audio(currentCard.music);
      music.loop = true;
      music.volume = 0.5;
      music.play().catch(e => console.log("Music play prevented:", e));
      
      return () => {
        music.pause();
        music.currentTime = 0;
      };
    }
  }, [currentCardIndex, showEnding]); 

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnimating) return;
      
      if (e.key === 'ArrowRight' || e.key === 'd') {
        handleSwipeStart();
        setSwipeDirection('right');
        setSwipeProgress(1);
        setTimeout(() => handleChoice('right'), 100);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') { 
        handleSwipeStart();
        setSwipeDirection('left');
        setSwipeProgress(1);
        setTimeout(() => handleChoice('left'), 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating]);


  // Open editor with current flashcards
  const openEditor = () => {
    setEditorValue(JSON.stringify(cardStack, null, 2));
    setShowEditor(true);
    setEditorError('');
  };

  // Save changes from editor
  const saveEditor = () => {
    try {
      const parsed = JSON.parse(editorValue);
      setCardStack(parsed);
      localStorage.setItem('duma_flashcards', JSON.stringify(parsed));
      setShowEditor(false);
      setEditorError('');
    } catch (e) {
      setEditorError('Invalid JSON!');
    }
  };

  // Download as file
  const downloadFile = () => {
    const blob = new Blob([editorValue], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSwipeStart = () => {
    setIsAnimating(true);
    setSwipeProgress(0);
    setNextCardVisible(true);
    swipeSound.currentTime = 0;
    swipeSound.play();
  };

  const handlePointerStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    cardRef.current.startX = clientX;
    cardRef.current.startY = clientY;
    cardRef.current.isSwiping = true;
    setSwipeProgress(0);
    setIsAnimating(false);
    setNextCardVisible(false);
  };

  const handlePointerMove = (e) => {
    if (!cardRef.current.isSwiping || isAnimating) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - cardRef.current.startX;
    
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
      const direction = deltaX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      const progress = Math.min(1, Math.abs(deltaX) / (window.innerWidth / 2));
      setSwipeProgress(progress);
      setHoverChoice(direction === 'right' ? 'yes' : 'no');

      const currentCard = getCurrentCard();
      if (currentCard) {
        const targetColor = direction === 'right' 
          ? currentCard.color.yes 
          : currentCard.color.no;
        setCurrentColor(targetColor);
      }
    }
  };

  const handlePointerEnd = () => {
    if (!cardRef.current.isSwiping || isAnimating) return;
    
    cardRef.current.isSwiping = false;
    
    if (swipeProgress > 0.3) {
      setIsAnimating(true);
      setNextCardVisible(true);
      swipeSound.play();
      setTimeout(() => handleChoice(swipeDirection), 300);
    } else {
      setSwipeDirection(null);
      setSwipeProgress(0);
      setHoverChoice(null);
      setCurrentColor('transparent');
    }
  };

  const handleChoice = (direction) => {
    const currentCard = getCurrentCard();
    if (!currentCard) return;
  
    if (showEnding) {
      resetGame();
      return;
    }
  
    const effects = direction === 'right' ? currentCard.effects.yes : currentCard.effects.no;
    
    // Update time and label from effects
    if (effects.time !== undefined) {
      setDays(prev => prev + effects.time);
    }
    if (effects.timeLabel) {
      setTimeLabel(effects.timeLabel);
    }
    
    updateElements(effects);
    advanceCard();
  };

  const getCurrentCard = () => {
    if (showEnding) {
      return endingFlashcards.find(e => e.id === showEnding) || null;
    }
    return cardStack[currentCardIndex] || null;
  };

const advanceCard = () => {
  setTimeout(() => {
    setCurrentCardIndex(prev => {
      const nextIndex = (prev + 1) % cardStack.length;
      return nextIndex;
    });
    setIsAnimating(false);
    setHoverChoice(null);
    setSwipeDirection(null);
    setSwipeProgress(0);
    setNextCardVisible(false);
    setCurrentColor('transparent');
  }, 100);
};

  const updateElements = (changes) => {
    const newElements = {...elements};
    let extreme = null;

    Object.entries(changes).forEach(([key, value]) => {
      if (['air', 'earth', 'fire', 'water'].includes(key)) {
        newElements[key] = Math.max(0, Math.min(100, elements[key] + value));
        if (newElements[key] === 0 || newElements[key] === 100) {
          extreme = `${key}_${newElements[key]}`;
        }
      }
    });

    setElements(newElements);
    if (extreme) {
      setShowEnding(extreme);
      const endingCard = endingFlashcards.find(e => e.id === extreme);
      if (endingCard) {
        setCardStack([endingCard]);
        setCurrentCardIndex(0);
      }
    }
  };

  const resetGame = () => {
    setElements(initialElements);
    setDays(0);
    setCurrentCardIndex(0);
    setShowEnding(null);
    setTimeLabel("Time before existence");
    setCardStack([...flashcards]);
    setSwipeDirection(null);
    setSwipeProgress(0);
    setIsAnimating(false);
    setHoverChoice(null);
    setNextCardVisible(false);
    setCurrentColor('transparent');

    const firstCard = flashcards[0];
    if (firstCard && firstCard.music) {
      const music = new Audio(firstCard.music);
      music.loop = true;
      music.volume = 0.5;
      music.play().catch(e => console.log("Music play prevented:", e));
    }
  };

  const ElementDisplay = ({ element }) => {
    const level = elements[element];
    return (
      <div className="element-circle">
        <div className="element-fill" style={{ height: `${level}%` }}>
          <img src={`${elementIcons[element]}`} alt={element} />
        </div>
      </div>
    );
  };

  const currentCard = getCurrentCard() || flashcards[0];
  const nextCardIndex = (currentCardIndex + 1) % cardStack.length;
  const nextCard = cardStack[nextCardIndex] || flashcards[0];

  return (
    <div className="duma-container">
      <button
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
          background: '#222',
          color: 'white',
          borderRadius: '8px',
          padding: '8px 16px',
          border: 'none',
          cursor: 'pointer'
        }}
        onClick={openEditor}
      >
        Manage Flashcards
      </button>

      {showEditor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#222', padding: 20, borderRadius: 10, width: '90vw', maxWidth: 600, boxShadow: '0 0 20px #000'
          }}>
            <h3 style={{color: 'white'}}>Edit Flashcards JSON</h3>
            <textarea
              value={editorValue}
              onChange={e => setEditorValue(e.target.value)}
              style={{ width: '100%', height: 300, background: '#111', color: '#fff', borderRadius: 6, padding: 8, fontFamily: 'monospace', fontSize: 14 }}
            />
            {editorError && <div style={{color: 'red', margin: '8px 0'}}>{editorError}</div>}
            <div style={{display: 'flex', gap: 8, marginTop: 10}}>
              <button onClick={saveEditor} style={{padding: '6px 16px'}}>Save</button>
              <button onClick={downloadFile} style={{padding: '6px 16px'}}>Download</button>
              <button onClick={() => setShowEditor(false)} style={{padding: '6px 16px'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="status-bar">
        <ElementDisplay element="air" />
        <ElementDisplay element="earth" />
        <ElementDisplay element="fire" />
        <ElementDisplay element="water" />
        <div className="time-display">
          <div className="time-label">
            {showEnding ? '' : timeLabel}
          </div>
          <div className="days">
            {showEnding ? '∞' : days}
          </div>
        </div>
      </div>

      <div className="card-stack">
        <div 
          className={`card next ${nextCardVisible ? 'visible' : ''}`}
          style={{
            opacity: nextCardVisible ? swipeProgress : 0
          }}
        >
          <div className="image-container">
          <img src={`${nextCard.image}`} alt="Next Card" className="character-image" />
          </div>
          <div className="card-content">
            {nextCard.title && <h2>{nextCard.title}</h2>}
            <p className="question-text">{nextCard.question}</p>
          </div>
        </div>

        <div 
          className={`card current ${swipeDirection || ''} ${isAnimating ? 'animate' : ''}`}
          ref={cardRef}
          onTouchStart={handlePointerStart}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerEnd}
          onMouseDown={handlePointerStart}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerEnd}
          onMouseLeave={handlePointerEnd}
          style={{
            transform: swipeDirection 
              ? `translateX(${swipeDirection === 'right' ? swipeProgress * window.innerWidth/2 : -swipeProgress * window.innerWidth/2}px)
                 rotate(${swipeDirection === 'right' ? swipeProgress * 30 : -swipeProgress * 30}deg)`
              : 'none',
            opacity: 1 - swipeProgress,
            backgroundColor: currentColor
          }}
        >
          <div className="image-container">
          <img src={`${currentCard.image}`} alt="Current Card" className="character-image" />
          </div>
          <div className="card-content">
            {currentCard.title && <h2>{currentCard.title}</h2>}
            <div className="scrollable-content">
              <p className="question-text">{currentCard.question}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="choice-hints">
        <div 
          className={`hint right ${hoverChoice === 'yes' ? 'visible' : ''}`}
          onMouseEnter={() => setHoverChoice('yes')}
          onMouseLeave={() => hoverChoice === 'yes' && setHoverChoice(null)}
        >
          <div className="hint-text">
            {currentCard.description?.yes || "YES"}
          </div>
        </div>
        <div 
          className={`hint left ${hoverChoice === 'no' ? 'visible' : ''}`}
          onMouseEnter={() => setHoverChoice('no')}
          onMouseLeave={() => hoverChoice === 'no' && setHoverChoice(null)}
        >
          <div className="hint-text">
            {currentCard.description?.no || "NO"}
          </div>
        </div>
      </div>
    </div>
  );
}