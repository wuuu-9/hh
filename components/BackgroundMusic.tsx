
import React, { useEffect, useRef } from 'react';
import { MUSIC_URL, WIND_URL, BELLS_URL } from '../constants';

interface BackgroundMusicProps {
  isMuted: boolean;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ isMuted }) => {
  const audiosRef = useRef<{ id: string; audio: HTMLAudioElement }[]>([]);

  useEffect(() => {
    // Define the audio layers with their intended relative volumes
    const tracks = [
      { id: 'music', url: MUSIC_URL, volume: 0.4 },
      { id: 'wind', url: WIND_URL, volume: 0.08 },
      { id: 'bells', url: BELLS_URL, volume: 0.04 },
    ];

    // Initialize all audio elements
    const elements = tracks.map((track) => {
      const audio = new Audio(track.url);
      audio.loop = true;
      audio.volume = track.volume;
      return { id: track.id, audio };
    });

    audiosRef.current = elements;

    // Initial play attempt if not muted
    if (!isMuted) {
      elements.forEach(({ audio }) => {
        audio.play().catch(() => {
          console.debug("Autoplay blocked. Audio will start upon first interaction.");
        });
      });
    }

    // Cleanup on unmount
    return () => {
      audiosRef.current.forEach(({ audio }) => {
        audio.pause();
        audio.src = ''; // Clear source to free up memory
      });
      audiosRef.current = [];
    };
  }, []);

  // Sync play/pause with the isMuted state
  useEffect(() => {
    audiosRef.current.forEach(({ audio }) => {
      if (isMuted) {
        audio.pause();
      } else {
        audio.play().catch(() => {
          // Playback might still be blocked by browser policy until first click
        });
      }
    });
  }, [isMuted]);

  return null;
};
