import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  overlay?: React.ReactNode;
  children?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  speed?: number; // percentage of translation, default 10%
}

/**
 * ParallaxImage Component
 * Implements the One Green Way image parallax scrub effect:
 * - Container: .image-parallax-trigger
 * - Image: .image-100 with scale/height buffer
 * - GSAP ScrollTrigger: scrubs from y: '0%' to y: '-10%' between top bottom and bottom top
 */
export default function ParallaxImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  overlay,
  children,
  loading = 'lazy',
  speed = 10,
}: ParallaxImageProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    const image = imageRef.current;
    if (!trigger || !image) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        image,
        { y: '0%' },
        {
          y: `-${speed}%`,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, trigger);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div
      ref={triggerRef}
      className={`image-parallax-trigger relative overflow-hidden select-none ${className}`}
    >
      {/* 
        Image buffer: 
        Rendered at 120% height and shifted upward slightly so it has smooth travel distance 
        without revealing empty margins during the -10% scrub.
      */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        loading={loading}
        className={`image-100 w-full h-[120%] -top-[10%] left-0 absolute object-cover will-change-transform ${imgClassName}`}
      />

      {/* Optional Gradient / Vignette Overlay */}
      {overlay}

      {/* Optional Foreground Elements (Badges, Spec Strips, Editorial Captions) */}
      {children && <div className="relative z-10 w-full h-full pointer-events-none">{children}</div>}
    </div>
  );
}

/**
 * Global function matching imagesAnimations() from onegreenway.pt
 * Scans for all .image-parallax-trigger elements and attaches the scrub animation.
 */
export function initImagesAnimations() {
  if (typeof document === 'undefined') return;

  const triggers = document.querySelectorAll<HTMLElement>('.image-parallax-trigger');
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    // Avoid duplicate initialization if handled by React component
    if ((trigger as unknown as { _parallaxInitialized?: boolean })._parallaxInitialized) return;
    (trigger as unknown as { _parallaxInitialized?: boolean })._parallaxInitialized = true;

    const image = trigger.querySelector<HTMLElement>('.image-100');
    if (!image) return;

    gsap.fromTo(
      image,
      { y: '0%' },
      {
        y: '-10%',
        ease: 'power1.out',
        scrollTrigger: {
          trigger: trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });
}

// Attach listener to custom event "aboutFlipLoaded" as in onegreenway.pt
if (typeof document !== 'undefined') {
  document.addEventListener('aboutFlipLoaded', initImagesAnimations);
}
