import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Polymorphic "sparkle" CTA button.
 *
 * Renders as <a href> when `href` is provided, else as <button>.
 * Animation runs via pure CSS (definitions live in globals.css under
 * `.ui-anim-btn`), so this stays a Server Component.
 *
 * Default `highlightHueDeg` = 187 (VLUX cyan glow).
 */
export interface AnimatedGenerateButtonProps {
  className?: string;
  labelIdle?: string;
  labelActive?: string;
  generating?: boolean;
  highlightHueDeg?: number;
  /**
   * Minimum width of the text wrapper (any valid CSS length).
   * Default `'12em'` fits "Agendar diagnóstico". Use `'7em'` for shorter labels.
   */
  minTextWidth?: string;
  // Anchor mode
  href?: string;
  target?: string;
  rel?: string;
  // Button mode
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  id?: string;
  ariaLabel?: string;
}

export function AnimatedGenerateButton({
  className,
  labelIdle = 'Generate',
  labelActive = 'Generating',
  generating = false,
  highlightHueDeg = 187,
  minTextWidth = '12em',
  href,
  target,
  rel,
  type = 'button',
  disabled = false,
  onClick,
  id,
  ariaLabel,
}: AnimatedGenerateButtonProps) {
  const buttonClasses = cn(
    'ui-anim-btn',
    'relative inline-flex items-center justify-center cursor-pointer select-none',
    'rounded-[24px] px-4 py-2',
    'bg-background text-foreground',
    'border border-white/20',
    'shadow-[inset_0px_1px_1px_rgba(255,255,255,0.2),inset_0px_2px_2px_rgba(255,255,255,0.15),inset_0px_4px_4px_rgba(255,255,255,0.1),inset_0px_8px_8px_rgba(255,255,255,0.05),inset_0px_16px_16px_rgba(255,255,255,0.05),0_-1px_1px_rgba(0,0,0,0.02),0_-2px_2px_rgba(0,0,0,0.03),0_-4px_4px_rgba(0,0,0,0.05),0_-8px_8px_rgba(0,0,0,0.06),0_-16px_16px_rgba(0,0,0,0.08)]',
    'transition-[box-shadow,border,background-color] duration-400',
  );

  const buttonStyle: CSSProperties = {
    ['--highlight-hue' as never]: `${highlightHueDeg}deg`,
  };

  const ariaLabelComputed = ariaLabel ?? (generating ? labelActive : labelIdle);

  const inner: ReactNode = (
    <>
      <svg
        className="ui-anim-btn-svg mr-2 h-6 w-6 flex-grow-0 transition-[fill,filter,opacity] duration-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
        />
      </svg>
      <div className="ui-anim-txt-wrapper relative flex items-center" style={{ minWidth: minTextWidth }}>
        <div className={cn('ui-anim-txt-1 absolute', generating ? 'opacity-0' : 'opacity-100')}>
          {Array.from(labelIdle).map((ch, i) => (
            <span
              key={`idle-${i}`}
              className="ui-anim-letter inline-block"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
        <div className={cn('ui-anim-txt-2 absolute', generating ? 'opacity-100' : 'opacity-0')}>
          {Array.from(labelActive).map((ch, i) => (
            <span
              key={`active-${i}`}
              className="ui-anim-letter inline-block"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className={cn('relative inline-block', className)} id={id}>
      {href ? (
        <a
          href={href}
          target={target}
          rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
          onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
          aria-label={ariaLabelComputed}
          className={buttonClasses}
          style={buttonStyle}
        >
          {inner}
        </a>
      ) : (
        <button
          type={type}
          aria-label={ariaLabelComputed}
          aria-pressed={generating}
          disabled={disabled}
          onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
          className={buttonClasses}
          style={buttonStyle}
        >
          {inner}
        </button>
      )}
    </div>
  );
}
