import React, { useContext } from 'react';
import { AudioManagerContext } from '../../../context/AudioManager';
import { Link } from 'react-router-dom';
import './BottomNav.scss';

const BottomNav = () => {
  const { volume, setVolume } = useContext(AudioManagerContext);

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
  };

  const handleIconClick = () => {
    setVolume(volume === 0 ? 0.5 : 0);
  };

  return (
    <nav className="bottomnav">
      <div className="bottomnav__center">
        <Link to="friends" className="bottomnav__link">Friends</Link>
        <Link to="chats" className="bottomnav__link">Public chats</Link>
        <Link to="games" className="bottomnav__link">Games/Apps</Link>
        <Link to="help" className="bottomnav__link">Help</Link>

        <div className="bottomnav__music-container">
          <img
            src={volume === 0 ? `/stop_sound_icon.png` : `/sound_icon.png`}
            alt="music toggle"
            className="bottomnav__music-icon"
            onClick={handleIconClick}
          />

          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="bottomnav__volume-slider"
          />
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
