import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const AudioManagerContext = React.createContext();

const AudioManager = ({ children }) => {
  const location = useLocation();

  // Refs for audio elements
  const bgMusicRef = useRef(new Audio());
  const sfxRef = useRef(null); // dynamic SFX, not persistent

  // State
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  // Track map
  const trackMap = {
    default: `/background_music.mp3`,
    duma: `/background_duma.mp3`,
  };

  const getTrackForRoute = (path) => {
    if (path.includes('/duma')) return 'duma';
    return 'default';
  };

  const playMusic = useCallback((track) => {
    const src = trackMap[track] || trackMap.default;
    if (bgMusicRef.current.src !== window.location.origin + src) {
      bgMusicRef.current.src = src;
      bgMusicRef.current.load();
    }
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = isMuted ? 0 : volume;
    bgMusicRef.current.play().catch((e) => console.log('Music play blocked:', e));
    setCurrentTrack(track);
    setIsPlaying(true);
  }, [volume, isMuted]);

  const stopMusic = () => {
    bgMusicRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (bgMusicRef.current.paused) {
      bgMusicRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      bgMusicRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playSFX = (src) => {
    if (isMuted) return;
    const sfx = new Audio(src);
    sfx.volume = volume;
    sfx.play().catch(() => {});
    sfxRef.current = sfx;
  };

  const updateVolume = (newVolume) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolume(clamped);
    bgMusicRef.current.volume = isMuted ? 0 : clamped;
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    bgMusicRef.current.muted = newMuted;
  };

  useEffect(() => {
    const routeTrack = getTrackForRoute(location.pathname);
    playMusic(routeTrack);
  }, [location.pathname, playMusic]);

  const stopAllMusic = () => {
    bgMusicRef.current.pause();
    bgMusicRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  return (
    <AudioManagerContext.Provider value={{
      isPlaying,
      togglePlay,
      volume,
      setVolume: updateVolume,
      isMuted,
      toggleMute,
      currentTrack,
      playSFX,
      playMusic,
      stopMusic,
      stopAllMusic,
    }}>
      {children}
    </AudioManagerContext.Provider>
  );
};

export default AudioManager;
