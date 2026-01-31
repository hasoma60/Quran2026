import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Chapter } from '../types';
import { fetchChapterAudio, fetchVerseAudio } from '../services/quranService';

interface AudioContextValue {
  isPlaying: boolean;
  currentChapterId: number | null;
  currentVerseKey: string | null;
  playbackSpeed: number;
  repeatCount: number;
  playChapter: (chapter: Chapter, reciterId?: number) => Promise<void>;
  playVerse: (chapterId: number, verseKey: string, reciterId?: number) => Promise<void>;
  togglePlay: () => void;
  stop: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setRepeatCount: (count: number) => void;
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [repeatCount, setRepeatCountState] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const repeatRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleEnded);
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('loadedmetadata', handleMetadata);
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
  }, []);

  const handleEnded = useCallback(() => {
    repeatRef.current++;
    if (repeatRef.current < repeatCount && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
      repeatRef.current = 0;
    }
  }, [repeatCount]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const setupAudio = useCallback((url: string) => {
    cleanupAudio();
    const audio = new Audio(url);
    audio.playbackRate = playbackSpeed;
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleMetadata);
    audioRef.current = audio;
    repeatRef.current = 0;
    return audio;
  }, [playbackSpeed, cleanupAudio, handleEnded, handleTimeUpdate, handleMetadata]);

  const playChapter = useCallback(async (chapter: Chapter, reciterId?: number) => {
    // Toggle if same chapter
    if (currentChapterId === chapter.id && audioRef.current && !currentVerseKey) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    const url = await fetchChapterAudio(chapter.id, reciterId);
    if (url) {
      const audio = setupAudio(url);
      setCurrentChapterId(chapter.id);
      setCurrentVerseKey(null);
      await audio.play();
      setIsPlaying(true);
    }
  }, [currentChapterId, currentVerseKey, isPlaying, setupAudio]);

  const playVerse = useCallback(async (chapterId: number, verseKey: string, reciterId?: number) => {
    // Toggle if same verse
    if (currentVerseKey === verseKey && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    const url = await fetchVerseAudio(verseKey, reciterId);
    if (url) {
      const audio = setupAudio(url);
      setCurrentChapterId(chapterId);
      setCurrentVerseKey(verseKey);
      await audio.play();
      setIsPlaying(true);
    }
  }, [currentVerseKey, isPlaying, setupAudio]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    cleanupAudio();
    setCurrentChapterId(null);
    setCurrentVerseKey(null);
  }, [cleanupAudio]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  const setRepeatCount = useCallback((count: number) => {
    setRepeatCountState(count);
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  return (
    <AudioContext.Provider value={{
      isPlaying, currentChapterId, currentVerseKey,
      playbackSpeed, repeatCount,
      playChapter, playVerse, togglePlay, stop,
      setPlaybackSpeed, setRepeatCount,
      duration, currentTime, seek,
    }}>
      {children}
    </AudioContext.Provider>
  );
}
