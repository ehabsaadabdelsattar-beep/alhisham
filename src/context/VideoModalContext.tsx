import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface VideoData {
  src: string;
  title: string;
  poster?: string;
}

interface VideoModalContextType {
  isOpen: boolean;
  videoData: VideoData | null;
  openVideo: (data: VideoData) => void;
  closeVideo: () => void;
}

const VideoModalContext = createContext<VideoModalContextType | undefined>(undefined);

export function VideoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  const openVideo = useCallback((data: VideoData) => {
    setVideoData(data);
    setIsOpen(true);
  }, []);

  const closeVideo = useCallback(() => {
    setIsOpen(false);
  }, []);

  // One Green Way Global Click Delegator for .video-hover-preview
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const preview = target.closest<HTMLElement>('.video-hover-preview');
      if (!preview) return;

      // Check if clicked element was a plain link or button with its own specific action
      if (target.closest('a[href]:not([data-open-video])')) return;

      const videoElement = preview.querySelector<HTMLVideoElement>('video.video-full');
      const fullVideoSrc = videoElement?.getAttribute('data-full-video');
      const videoTitle = videoElement?.getAttribute('data-video-name') || 'Al Hisham Developments';
      const poster = preview.querySelector<HTMLImageElement>('.video-preview-image')?.src;

      if (fullVideoSrc) {
        openVideo({
          src: fullVideoSrc,
          title: videoTitle,
          poster,
        });
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [openVideo]);

  // One Green Way Dynamic Copyright Year handler: [copyright-year]
  useEffect(() => {
    const updateCopyrightYears = () => {
      const currentYear = new Date().getFullYear().toString();
      document.querySelectorAll<HTMLElement>('[copyright-year]').forEach((el) => {
        el.textContent = currentYear;
      });
    };

    updateCopyrightYears();
    // Run on any DOM change if necessary
    const timer = setTimeout(updateCopyrightYears, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <VideoModalContext.Provider value={{ isOpen, videoData, openVideo, closeVideo }}>
      {children}
    </VideoModalContext.Provider>
  );
}

export function useVideoModal(): VideoModalContextType {
  const context = useContext(VideoModalContext);
  if (!context) {
    throw new Error('useVideoModal must be used within a VideoModalProvider');
  }
  return context;
}
