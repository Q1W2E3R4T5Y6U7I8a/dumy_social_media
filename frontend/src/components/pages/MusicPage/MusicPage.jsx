import React, { useState } from 'react';
import './MusicPage.scss';

const MusicPage = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackName, setCurrentTrackName] = useState('');

  const musicList = [
    `/music_1.mp3`,
    `/music_3.mp3`,
    `/music_4.mp3`,
    `/music_5.mp3`,
    `/music_6.mp3`,
  ];

  const handlePlay = (track) => {
    if (currentTrack) {
      currentTrack.pause();
    }
    const audio = new Audio(track); 
    audio.play();
    setCurrentTrack(audio);
    setCurrentTrackName(track);

    audio.onended = () => {
      setCurrentTrack(null);
      setCurrentTrackName('');
    };
  };

  const handleStop = () => {
    if (currentTrack) {
      currentTrack.pause();
      setCurrentTrack(null);
      setCurrentTrackName('');
    }
  };

  return (
    <div className="music-page">
      <div className="current-track">
        {currentTrackName ? (
          <>
            <p>Now Playing: {currentTrackName}</p>
            <button onClick={handleStop} className="stop-button">Stop</button>
          </>
        ) : (
          <p>No track playing</p>
        )}
      </div>
      <div className="music-list">
        {musicList.map((track, index) => (
          <div key={index} className="music-item">
            <p>{track}</p>
            <button onClick={() => handlePlay(track)}>Play</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicPage;