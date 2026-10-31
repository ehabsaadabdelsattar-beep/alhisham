import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useVideoModal } from '../../context/VideoModalContext';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize, FiX } from 'react-icons/fi';

export default function LuxuryVideoModal() {
  const { isOpen, videoData, closeVideo } = useVideoModal();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const progressThumbRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLSpanElement>(null);
  const nowPlayingNameRef = useRef<HTMLSpanElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const uiTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Format time (seconds -> mm:ss) exactly like One Green Way spec
  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }, []);

  // Reset Progress Bar
  const resetProgressBar = useCallback(() => {
    if (progressFillRef.current) progressFillRef.current.style.width = '0%';
    if (progressThumbRef.current) progressThumbRef.current.style.left = '0%';
    if (currentTimeRef.current) currentTimeRef.current.textContent = '0:00';
  }, []);

  // Reset Inactivity Timer with GSAP Timeline (One Green Way Spec)
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (uiTimelineRef.current) {
      uiTimelineRef.current.reverse();
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (uiTimelineRef.current && isPlaying) {
        uiTimelineRef.current.play();
      }
    }, 2000);
  }, [isPlaying]);

  // Setup GSAP Timeline for auto-hiding controls & name
  useEffect(() => {
    if (!controlsRef.current || !nameRef.current) return;

    uiTimelineRef.current = gsap
      .timeline({ paused: true })
      .to(
        controlsRef.current,
        { y: '100%', opacity: 0, duration: 0.5, ease: 'power1.inOut' },
        0
      )
      .to(
        nameRef.current,
        { y: '-100%', opacity: 0, duration: 0.5, ease: 'power1.inOut' },
        0
      );

    return () => {
      uiTimelineRef.current?.kill();
    };
  }, []);

  // Close Video Modal
  const handleClose = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (uiTimelineRef.current) {
      uiTimelineRef.current.reverse();
    }
    setIsPlaying(false);
    resetProgressBar();
    closeVideo();
  }, [closeVideo, resetProgressBar]);

  // When modal opens or videoData changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isOpen && videoData?.src) {
      video.setAttribute('src', videoData.src);
      video.load();
      video.muted = false;
      setIsMuted(false);
      resetProgressBar();

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            resetInactivityTimer();
          })
          .catch((err) => {
            console.warn('Auto-play was prevented by browser policy:', err);
            // Fallback: start muted
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          });
      }

      if (nowPlayingNameRef.current && videoData.title) {
        nowPlayingNameRef.current.textContent = videoData.title;
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isOpen, videoData, resetProgressBar, resetInactivityTimer]);

  // Stop Lenis while modal is open, resume when closed
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void }; __lenis?: { stop: () => void; start: () => void } }).lenis ||
      (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;

    if (isOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }

    return () => {
      lenis?.start();
    };
  }, [isOpen]);

  // Keyboard navigation (Escape to close, Space to toggle play/pause, M to mute)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      resetInactivityTimer();
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const video = videoRef.current;
        if (video) {
          if (video.paused) {
            void video.play();
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        }
      } else if (e.key === 'm' || e.key === 'M') {
        const video = videoRef.current;
        if (video) {
          video.muted = !video.muted;
          setIsMuted(video.muted);
        }
      }
    };

    const handleMouseMove = () => resetInactivityTimer();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen, handleClose, resetInactivityTimer]);

  // Video Events
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const percentage = (video.currentTime / video.duration) * 100;
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${percentage}%`;
    }
    if (progressThumbRef.current) {
      progressThumbRef.current.style.left = `${percentage}%`;
    }
    if (currentTimeRef.current) {
      currentTimeRef.current.textContent = formatTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      resetProgressBar();
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressBarRef.current;
    if (!video || !bar || !video.duration) return;

    const rect = bar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    video.currentTime = (percentage / 100) * video.duration;
    resetInactivityTimer();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetInactivityTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetInactivityTimer();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
    resetInactivityTimer();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="section_full-video fixed inset-0 z-[99999] flex items-center justify-center bg-forest-dark/95 backdrop-blur-2xl transition-all duration-300 select-none overflow-hidden"
      style={{ display: 'flex' }}
    >
      {/* Background Click Shield (modal__inner) to close */}
      <div
        className="modal__inner absolute inset-0 bg-transparent z-10 cursor-pointer"
        onClick={handleClose}
      />

      {/* Luxury Close Button (.video-close-button) */}
      <button
        type="button"
        className="video-close-button absolute top-6 end-6 z-40 w-12 h-12 rounded-full bg-forest-dark/80 hover:bg-gold text-white hover:text-forest border border-white/20 hover:border-gold shadow-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300 group cursor-pointer"
        onClick={handleClose}
        aria-label="Close Cinema Tour"
      >
        <FiX className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
      </button>

      {/* Video Name Badge (.video-name) with [now-playing-name] */}
      <div
        ref={nameRef}
        className="video-name fixed top-6 sm:top-8 inset-x-0 mx-auto w-max max-w-xl text-center z-30 pointer-events-none transition-transform will-change-transform px-4"
      >
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-forest-dark/85 border border-gold/40 shadow-2xl backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(198,164,91,0.9)]" />
          <span
            ref={nowPlayingNameRef}
            now-playing-name=""
            className="text-xs sm:text-sm font-bold text-ivory tracking-wide font-sans truncate max-w-xs sm:max-w-md"
          >
            {videoData?.title || 'AL HISHAM ARCHITECTURAL CINEMA'}
          </span>
          <span className="text-[10px] uppercase font-semibold text-gold tracking-widest ps-2 border-s border-gold/30">
            4K
          </span>
        </div>
      </div>

      {/* Main Video Viewport (.video-popup) */}
      <div className="relative z-20 w-full max-w-6xl aspect-video mx-4 sm:mx-8 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          className="video-popup w-full h-full object-cover"
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onClick={togglePlay}
        />
      </div>

      {/* Bottom Floating Control Console (.video-controls) */}
      <div
        ref={controlsRef}
        className="video-controls fixed bottom-6 sm:bottom-10 inset-x-4 sm:inset-x-8 max-w-4xl mx-auto z-30 pointer-events-auto transition-transform will-change-transform"
      >
        <div className="glass-card-dark px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-white/20 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 sm:gap-5 bg-forest-dark/85">
          {/* Play / Pause Toggle Buttons */}
          <div className="flex items-center">
            <button
              type="button"
              {...{ 'function': 'play' } as any}
              onClick={togglePlay}
              className={`w-10 h-10 rounded-xl bg-gold hover:bg-gold-light text-forest flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                isPlaying ? 'hidden' : 'inline-flex'
              }`}
              style={{ display: isPlaying ? 'none' : 'inline-flex' }}
              aria-label="Play video"
            >
              <FiPlay className="w-4 h-4 fill-current ms-0.5" />
            </button>

            <button
              type="button"
              {...{ 'function': 'pause' } as any}
              onClick={togglePlay}
              className={`w-10 h-10 rounded-xl bg-gold hover:bg-gold-light text-forest flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                isPlaying ? 'inline-flex' : 'hidden'
              }`}
              style={{ display: isPlaying ? 'inline-flex' : 'none' }}
              aria-label="Pause video"
            >
              <FiPause className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Current Time Display */}
          <span
            ref={currentTimeRef}
            id="current-time"
            className="font-mono text-xs sm:text-sm font-bold text-gold tabular-nums min-w-[2.5rem] text-center"
          >
            0:00
          </span>

          {/* Interactive Scrubbable Progress Bar */}
          <div
            ref={progressBarRef}
            className="progress-bar relative flex-1 h-2 sm:h-2.5 bg-white/15 hover:bg-white/25 rounded-full cursor-pointer group transition-colors py-1 box-content"
            onClick={handleProgressBarClick}
          >
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 sm:h-2.5 rounded-full overflow-hidden bg-white/10">
              <div
                ref={progressFillRef}
                className="progress-fill h-full bg-gradient-to-r from-emerald via-gold to-gold-light rounded-full transition-[width] duration-75"
                style={{ width: '0%' }}
              />
            </div>

            {/* Glowing Golden Playhead Thumb */}
            <div
              ref={progressThumbRef}
              className="progress-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold border-2 border-ivory shadow-[0_0_12px_rgba(198,164,91,0.9)] scale-75 group-hover:scale-125 transition-transform duration-200 pointer-events-none"
              style={{ left: '0%' }}
            />
          </div>

          {/* Total Duration Display */}
          <span className="font-mono text-xs sm:text-sm font-light text-ivory/60 tabular-nums hidden sm:inline-block">
            {formatTime(duration)}
          </span>

          {/* Mute / Unmute Toggle Buttons */}
          <div className="flex items-center">
            <button
              type="button"
              {...{ 'function': 'mute' } as any}
              onClick={toggleMute}
              className={`w-9 h-9 rounded-xl border border-white/20 hover:border-gold hover:text-gold text-ivory flex items-center justify-center transition-colors cursor-pointer ${
                isMuted ? 'hidden' : 'inline-flex'
              }`}
              style={{ display: isMuted ? 'none' : 'inline-flex' }}
              aria-label="Mute audio"
            >
              <FiVolume2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              {...{ 'function': 'unmute' } as any}
              onClick={toggleMute}
              className={`w-9 h-9 rounded-xl border border-gold/60 bg-gold/15 text-gold flex items-center justify-center transition-colors cursor-pointer ${
                isMuted ? 'inline-flex' : 'hidden'
              }`}
              style={{ display: isMuted ? 'inline-flex' : 'none' }}
              aria-label="Unmute audio"
            >
              <FiVolumeX className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen Expand Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl border border-white/20 hover:border-gold hover:text-gold text-ivory flex items-center justify-center transition-colors cursor-pointer hidden sm:inline-flex"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
