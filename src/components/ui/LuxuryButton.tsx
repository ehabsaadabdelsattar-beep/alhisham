import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useLang } from '../../context/LanguageContext';

export interface LuxuryButtonProps {
  children?: React.ReactNode;
  text?: string;
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  variant?: 'emerald' | 'primary' | 'gold' | 'outline-emerald' | 'outline-gold' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  target?: string;
  rel?: string;
  noTransition?: boolean;
  'aria-label'?: string;
}

/**
 * LuxuryButton Component
 * Implements the signature One Green Way rolling text character hover animation
 * matching initButtonHoverAnimation() with:
 * - [button-hover-animation]
 * - [button-initial-text]
 * - [button-animation-text]
 * - GSAP timeline with forward play and progress-aware reverse on mouseleave
 */
export default function LuxuryButton({
  children,
  text,
  to,
  href,
  onClick,
  variant = 'emerald',
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  type = 'button',
  disabled = false,
  target,
  rel,
  noTransition = false,
  'aria-label': ariaLabel,
}: LuxuryButtonProps) {
  const { lang } = useLang();
  const isRtl = lang === 'ar';
  const buttonRef = useRef<HTMLElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  // Variant Styling Tokens (Tailwind CSS matching Luxury Emerald Palette)
  const variantStyles = {
    emerald:
      'bg-primary text-white hover:bg-forest border border-primary/80 shadow-md hover:shadow-xl hover:shadow-emerald/20',
    primary:
      'bg-primary text-white hover:bg-forest border border-primary/80 shadow-md hover:shadow-xl hover:shadow-emerald/20',
    gold:
      'bg-gold text-forest font-bold hover:bg-gold-light border border-gold shadow-md hover:shadow-xl hover:shadow-gold/20',
    'outline-emerald':
      'bg-transparent text-primary dark:text-ivory border border-primary/30 hover:border-primary hover:bg-primary/5 dark:border-ivory/30 dark:hover:border-ivory',
    'outline-gold':
      'bg-transparent text-gold border border-gold/40 hover:bg-gold/10 hover:border-gold shadow-sm hover:shadow-gold/10',
    white:
      'bg-white text-forest hover:bg-ivory border border-white/90 shadow-md hover:shadow-xl',
    dark:
      'bg-dark-100 text-ivory hover:bg-dark-200 border border-white/10 shadow-md',
  };

  // Size styling
  const sizeStyles = {
    sm: 'px-5 py-2.5 text-xs rounded-lg gap-2',
    md: 'px-7 py-3.5 text-xs sm:text-sm rounded-xl gap-2.5',
    lg: 'px-9 py-4 text-sm sm:text-base rounded-xl gap-3',
  };

  // Determine button text to render
  const labelText = text || (typeof children === 'string' ? children : '');

  // GSAP Character Rolling Animation Setup
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const initialChars = el.querySelectorAll('[button-initial-text] .btn-char');
      const animatedChars = el.querySelectorAll('[button-animation-text] .btn-char');
      const initialFallback = el.querySelectorAll('[button-initial-text]');
      const animatedFallback = el.querySelectorAll('[button-animation-text]');

      // Target chars if available, otherwise target the whole text container
      const targetsInitial = initialChars.length > 0 ? initialChars : initialFallback;
      const targetsAnimated = animatedChars.length > 0 ? animatedChars : animatedFallback;

      if (!targetsInitial.length || !targetsAnimated.length) return;

      // Set initial state of animated text (hidden below)
      gsap.set(targetsAnimated, { y: '60%', opacity: 0 });

      // Create paused timeline with power1.inOut ease and character stagger
      const tl = gsap.timeline({
        paused: true,
        defaults: {
          ease: 'power1.inOut',
          duration: 0.5,
          stagger: 0.025,
        },
      });

      // Move initial text up & fade out
      tl.to(targetsInitial, { y: '-60%', opacity: 0 }, 0)
        // Move new text up into view
        .to(targetsAnimated, { y: '0%', opacity: 1 }, 0.08);

      // Animate icon subtle directional nudge if present
      if (iconRef.current) {
        tl.to(
          iconRef.current,
          {
            x: isRtl ? -4 : 4,
            y: -2,
            duration: 0.35,
            ease: 'power1.out',
          },
          0.05
        );
      }

      // Mouse enter: play forward
      const onEnter = () => tl.play();

      // Mouse leave: revert from current progress seamlessly without jumping
      const onLeave = () => tl.progress(tl.progress()).reverse();

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);

      return () => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      };
    }, el);

    return () => ctx.revert();
  }, [labelText, isRtl]);

  // Render text content with split character spans for Latin, or intact flow for Arabic
  const renderTextContent = () => {
    if (labelText) {
      // In Arabic, preserve natural cursive ligatures without breaking into spans
      if (isRtl) {
        return (
          <span className="relative inline-flex items-center overflow-hidden py-0.5 select-none font-medium">
            <span
              button-initial-text=""
              className="inline-flex items-center flex-nowrap whitespace-nowrap will-change-transform"
              aria-hidden="true"
            >
              {labelText}
            </span>
            <span
              button-animation-text=""
              className="absolute inset-0 inline-flex items-center flex-nowrap whitespace-nowrap pointer-events-none will-change-transform"
              aria-hidden="true"
            >
              {labelText}
            </span>
            <span className="sr-only">{labelText}</span>
          </span>
        );
      }

      // For English/Latin text, split into characters for cascading rolling effect
      const chars = Array.from(labelText);

      return (
        <span className="relative inline-flex items-center overflow-hidden py-0.5 select-none font-medium">
          {/* Initial Visible Text */}
          <span
            button-initial-text=""
            className="inline-flex items-center flex-nowrap whitespace-pre"
            aria-hidden="true"
          >
            {chars.map((char, i) => (
              <span
                key={i}
                className="btn-char inline-block will-change-transform"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>

          {/* Animated Rolling Replacement Text */}
          <span
            button-animation-text=""
            className="absolute inset-0 inline-flex items-center flex-nowrap whitespace-pre pointer-events-none"
            aria-hidden="true"
          >
            {chars.map((char, i) => (
              <span
                key={i}
                className="btn-char inline-block will-change-transform"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>

          {/* Accessible hidden text for screen readers */}
          <span className="sr-only">{labelText}</span>
        </span>
      );
    }

    // Fallback for custom ReactNode children
    return (
      <span className="relative inline-flex items-center overflow-hidden py-0.5">
        <span button-initial-text="" className="inline-flex items-center">
          {children}
        </span>
        <span
          button-animation-text=""
          className="absolute inset-0 inline-flex items-center pointer-events-none"
        >
          {children}
        </span>
      </span>
    );
  };

  const combinedClasses = `group inline-flex items-center justify-center font-sans tracking-wide transition-all duration-300 relative select-none ${
    variantStyles[variant] || variantStyles.emerald
  } ${sizeStyles[size]} ${className}`;

  const iconElement = icon ? (
    <span
      ref={iconRef}
      className="inline-flex items-center justify-center flex-shrink-0 transition-transform duration-300"
      aria-hidden="true"
    >
      {icon}
    </span>
  ) : null;

  const content = (
    <>
      {iconPosition === 'left' && iconElement}
      {renderTextContent()}
      {iconPosition === 'right' && iconElement}
    </>
  );

  // 1. Render as React Router Link
  if (to) {
    return (
      <Link
        ref={buttonRef as unknown as React.Ref<HTMLAnchorElement>}
        to={to}
        onClick={onClick}
        className={combinedClasses}
        button-hover-animation=""
        no-transition={noTransition ? '' : undefined}
        aria-label={ariaLabel || labelText}
      >
        {content}
      </Link>
    );
  }

  // 2. Render as Standard Anchor Tag
  if (href) {
    return (
      <a
        ref={buttonRef as unknown as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        className={combinedClasses}
        button-hover-animation=""
        no-transition={noTransition ? '' : undefined}
        aria-label={ariaLabel || labelText}
      >
        {content}
      </a>
    );
  }

  // 3. Render as Native Button
  return (
    <button
      ref={buttonRef as unknown as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${combinedClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      button-hover-animation=""
      aria-label={ariaLabel || labelText}
    >
      {content}
    </button>
  );
}

/**
 * Global function matching initButtonHoverAnimation()
 * Attaches rolling animation to any custom elements with [button-hover-animation]
 */
export function initButtonHoverAnimation() {
  if (typeof document === 'undefined') return;

  const buttons = document.querySelectorAll('[button-hover-animation]');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    // Avoid double initialization if handled by React component
    if ((btn as unknown as { _hasHoverAnimation?: boolean })._hasHoverAnimation) return;
    (btn as unknown as { _hasHoverAnimation?: boolean })._hasHoverAnimation = true;

    const initialTextChars = btn.querySelectorAll('[button-initial-text]');
    const animatedTextChars = btn.querySelectorAll('[button-animation-text]');

    if (!initialTextChars.length || !animatedTextChars.length) return;

    gsap.set(animatedTextChars, { y: '60%', opacity: 0 });

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power1.inOut', duration: 0.55, stagger: 0.05 },
    });

    tl.to(initialTextChars, { y: '-60%', opacity: 0 }, 0).to(
      animatedTextChars,
      { y: '0%', opacity: 1 },
      0.1
    );

    btn.addEventListener('mouseenter', () => tl.play());
    btn.addEventListener('mouseleave', () => tl.progress(tl.progress()).reverse());
  });
}
