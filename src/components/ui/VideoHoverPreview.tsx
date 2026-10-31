import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useVideoModal } from '../../context/VideoModalContext';
import { FiPlay } from 'react-icons/fi';

export interface VideoHoverPreviewProps {
  poster: string;
  fullVideo: string;
  previewVideo?: string;
  videoName: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  alwaysLoop?: boolean;
  aspectRatio?: string;
  children?: React.ReactNode;
}

export default function VideoHoverPreview({
  poster,
  fullVideo,
  previewVideo,
  videoName,
  badge = '4K CINEMATIC',
  title,
  subtitle,
  className = '',
  alwaysLoop = false,
  aspectRatio = 'aspect-video',
  children,
}: VideoHoverPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { openVideo } = useVideoModal();

  useEffect(() => {
    const container = containerRef.current;
    const previewIcon = iconRef.current;
    const image = imageRef.current;
    const video = videoRef.current;

    if (!container) return;

    const isDesktop = window.innerWidth > 991;

    // Timeline for poster fadeout
    let fadeTl: gsap.core.Timeline | null = null;
    if (image && !alwaysLoop) {
      fadeTl = gsap.timeline({ paused: true });
      fadeTl.to(image, {
        opacity: 0,
        duration: 0.3,
        ease: 'power1.inOut',
      });
    }

    const handleMouseEnter = () => {
      if (!isDesktop) return;

      // File 1: Scale preview icon to 1.2
      if (previewIcon) {
        gsap.to(previewIcon, { scale: 1.2, duration: 0.5, ease: 'power2.out' });
      }

      // File 2: Fade image out and play preview video
      if (!alwaysLoop && video) {
        video.muted = true;
        video.loop = true;

        if (!video.src) {
          const source = video.querySelector('source')?.getAttribute('src');
          if (source) {
            video.src = source;
            video.load();
          }
        }

        const p = video.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      }

      if (fadeTl) {
        fadeTl.play();
      }
    };

    const handleMouseLeave = () => {
      if (!isDesktop) return;

      // File 1: Revert preview icon scale to 1
      if (previewIcon) {
        gsap.to(previewIcon, { scale: 1, duration: 0.5, ease: 'power2.inOut' });
      }

      // File 2: Fade image back in, rewind video to 0 on complete
      if (fadeTl) {
        fadeTl.reverse().eventCallback('onReverseComplete', () => {
          if (!alwaysLoop && video) {
            video.currentTime = 0;
            video.pause();
          }
        });
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      fadeTl?.kill();
    };
  }, [alwaysLoop]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openVideo({
      src: fullVideo,
      title: videoName,
      poster,
    });
  };

  const previewSrc = previewVideo || fullVideo;

  return (
    <div
      ref={containerRef}
      className={`video-hover-preview group relative overflow-hidden rounded-2xl cursor-pointer ${
        alwaysLoop ? 'always-loop' : ''
      } ${aspectRatio} ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Watch video: ${videoName}`}
    >
      {/* Background HTML5 Video (.video-full with data attributes) */}
      <video
        ref={videoRef}
        className="video-full absolute inset-0 w-full h-full object-cover"
        data-full-video={fullVideo}
        data-video-name={videoName}
        autoPlay={alwaysLoop}
        loop
        muted
        playsInline
        preload={alwaysLoop ? 'auto' : 'none'}
      >
        <source src={previewSrc} type="video/mp4" />
      </video>

      {/* Poster Image (.video-preview-image) with GSAP fadeout */}
      {!alwaysLoop && (
        <img
          ref={imageRef}
          src={poster}
          alt={videoName}
          className="video-preview-image absolute inset-0 w-full h-full object-cover pointer-events-none will-change-opacity z-10"
        />
      )}

      {/* Cinematic Ambient Dark Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/90 via-forest-dark/25 to-transparent z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-75" />

      {/* Badge (e.g. 4K CINEMATIC / LIVE TOUR) */}
      {badge && (
        <div className="absolute top-4 start-4 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-dark/80 backdrop-blur-md border border-gold/40 text-gold text-[10px] font-semibold tracking-widest uppercase shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span>{badge}</span>
          </div>
        </div>
      )}

      {/* Center Play Icon with One Green Way GSAP scale: 1.2 (.preview-icon_wrapper) */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div
          ref={iconRef}
          className="preview-icon_wrapper w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-forest-dark/85 backdrop-blur-md border border-gold/50 text-gold flex items-center justify-center shadow-2xl transition-colors duration-300 group-hover:bg-gold group-hover:text-forest group-hover:border-gold will-change-transform"
        >
          <FiPlay className="w-5 h-5 sm:w-6 sm:h-6 fill-current ms-0.5" />
        </div>
      </div>

      {/* Bottom Title & Subtitle or Custom Children */}
      <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none">
        {children ? (
          children
        ) : (
          <div>
            {title && (
              <h4 className="text-white text-sm sm:text-base font-bold font-sans tracking-wide drop-shadow-md group-hover:text-gold transition-colors">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-ivory/70 text-xs mt-0.5 font-light line-clamp-1 font-sans">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
