import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface EditorialTextProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  animation?: 'word-title' | 'line-reveal' | 'letter-opacity' | 'none';
  type?: 'words' | 'lines' | 'chars';
  className?: string;
  highlightClass?: string;
  italicClass?: string;
  italicText?: string;
}

/**
 * EditorialText Component
 * Implements the One Green Way SplitType + GSAP text orchestration engine:
 * - [split-words], [split-chars], [split-lines]
 * - [word-title-animation]
 * - [line-reveal-on-scroll]
 * - [letter-by-letter-opacity]
 * - wordFix for ascenders/descenders
 */
export default function EditorialText({
  children,
  as: Component = 'div',
  animation = 'word-title',
  type = 'words',
  className = '',
  highlightClass = 'text-gold',
  italicClass = 'font-editorial italic font-normal text-gold',
  italicText,
}: EditorialTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. word-title-animation
      if (animation === 'word-title') {
        const words = el.querySelectorAll<HTMLElement>('.word');
        if (words.length) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              onEnter: () => tl.play(),
            },
          });

          tl.fromTo(
            words,
            { y: '-100%', opacity: 0 },
            {
              y: '0%',
              opacity: 1,
              duration: 0.7,
              ease: 'power2.out',
              stagger: { amount: 0.15 },
            }
          );
        }
      }

      // 2. line-reveal-on-scroll
      if (animation === 'line-reveal') {
        const lines = el.querySelectorAll<HTMLElement>('.line');
        if (lines.length) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'top 60%',
              scrub: 1,
            },
          });

          tl.fromTo(
            lines,
            { y: '-100%', opacity: 0 },
            {
              y: '0%',
              opacity: 1,
              duration: 0.7,
              ease: 'power2.out',
              stagger: { amount: 0.1 },
            }
          );
        }
      }

      // 3. letter-by-letter-opacity (Reading highlight scrub)
      if (animation === 'letter-opacity') {
        const items = el.querySelectorAll<HTMLElement>('.word');
        if (items.length) {
          gsap.set(items, { opacity: 0.3 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'top 50%',
              scrub: 1,
            },
          });

          tl.to(items, {
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.05,
          });
        }
      }

      // 4. wordFix for specific initial characters (L, p, etc.)
      const wordElements = el.querySelectorAll<HTMLElement>('.word');
      wordElements.forEach((w) => {
        if (w.textContent?.trim().match(/^[Lp]/)) {
          w.style.paddingLeft = '0.15em';
        }
      });
    }, el);

    return () => ctx.revert();
  }, [animation, children]);

  // Attribute props based on config
  const attrProps: Record<string, string> = {};
  if (type === 'words') attrProps['split-words'] = '';
  if (type === 'chars') attrProps['split-chars'] = '';
  if (type === 'lines') attrProps['split-lines'] = '';

  if (animation === 'word-title') attrProps['word-title-animation'] = '';
  if (animation === 'line-reveal') attrProps['line-reveal-on-scroll'] = '';
  if (animation === 'letter-opacity') attrProps['letter-by-letter-opacity'] = '';

  // Render Words Split
  if (type === 'words' || animation === 'word-title' || animation === 'letter-opacity') {
    const rawWords = children.split(/\s+/).filter(Boolean);

    return (
      <Component
        ref={containerRef as any}
        className={`select-none ${className}`}
        {...attrProps}
      >
        {rawWords.map((word, i) => {
          const isItalic = italicText && word.toLowerCase().includes(italicText.toLowerCase());

          return (
            <span
              key={i}
              className={`word inline-block will-change-transform overflow-hidden align-top me-[0.28em] ${
                isItalic ? italicClass : ''
              }`}
            >
              <span className="inline-block">{word}</span>
            </span>
          );
        })}
      </Component>
    );
  }

  // Render Lines Split
  if (type === 'lines' || animation === 'line-reveal') {
    const rawLines = children.split('\n').filter(Boolean);

    return (
      <Component
        ref={containerRef as any}
        className={`select-none ${className}`}
        {...attrProps}
      >
        {rawLines.map((line, i) => (
          <span key={i} className="line block will-change-transform overflow-hidden">
            <span className="inline-block">{line}</span>
          </span>
        ))}
      </Component>
    );
  }

  return (
    <Component
      ref={containerRef as any}
      className={className}
      {...attrProps}
    >
      {children}
    </Component>
  );
}

/**
 * Global function matching initSplitText(), wordAnimations(), lineRevealonScroll(), letterAnimations()
 * Scans the DOM and attaches animations to any custom elements using the attributes.
 */
export function initAllTextAnimations() {
  if (typeof document === 'undefined') return;

  // word-title-animation
  const wordTitles = document.querySelectorAll<HTMLElement>('[word-title-animation]');
  wordTitles.forEach((trigger) => {
    const words = trigger.querySelectorAll<HTMLElement>('.word');
    if (!words.length) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: 'top 90%',
        onEnter: () => tl.play(),
      },
    });

    tl.fromTo(
      words,
      { y: '-100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        stagger: { amount: 0.1 },
      }
    );
  });

  // line-reveal-on-scroll
  const lineReveals = document.querySelectorAll<HTMLElement>('[line-reveal-on-scroll]');
  lineReveals.forEach((trigger) => {
    const lines = trigger.querySelectorAll<HTMLElement>('.line');
    if (!lines.length) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: 'top 90%',
        end: 'top 60%',
        scrub: 1,
      },
    });

    tl.fromTo(
      lines,
      { y: '-100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        stagger: { amount: 0.1 },
      }
    );
  });

  // letter-by-letter-opacity
  const letterOpacity = document.querySelectorAll<HTMLElement>('[letter-by-letter-opacity]');
  letterOpacity.forEach((trigger) => {
    const chars = trigger.querySelectorAll<HTMLElement>('.word');
    if (!chars.length) return;

    gsap.set(chars, { opacity: 0.3 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: 'top 90%',
        end: 'top 50%',
        scrub: 1,
      },
    });

    tl.to(chars, {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.1,
    });
  });

  // wordFix
  document.querySelectorAll<HTMLElement>('.word').forEach((w) => {
    if (w.textContent?.trim().match(/^[Lp]/)) {
      w.style.paddingLeft = '0.15em';
    }
  });
}

// Auto-run on DOMContentLoaded & aboutFlipLoaded
if (typeof document !== 'undefined') {
  document.addEventListener('aboutFlipLoaded', initAllTextAnimations);
}
