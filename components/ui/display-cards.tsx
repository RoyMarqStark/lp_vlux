'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

/* ============================================================
   DisplayCards — skewed stacked cards that fan out on hover.
   Adapted to VLUX: cyan accents, ink/elevated surfaces,
   JetBrains Mono meta line.
   ============================================================ */

export interface DisplayCardProps {
  className?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-cyan-soft" />,
  title = 'Destacado',
  description = 'Descubre lo que hay dentro',
  date = 'Ahora',
  iconClassName = 'text-cyan-core',
  titleClassName = 'text-cyan-core',
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        'relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border border-white/10 bg-elevated/80 backdrop-blur-sm px-4 py-3 transition-all duration-700',
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-['']",
        'hover:border-cyan-core/40 hover:bg-elevated',
        '[&>*]:flex [&>*]:items-center [&>*]:gap-2',
        className,
      )}
    >
      <div>
        <span className={cn('relative inline-block rounded-full bg-cyan-core/15 border border-cyan-core/30 p-1.5', iconClassName)}>
          {icon}
        </span>
        <p className={cn('font-display text-lg font-bold tracking-tight', titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-[1.02rem] text-pearl">{description}</p>
      <p className="kicker text-[0.62rem]">{date}</p>
    </div>
  );
}

export interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: '[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10',
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
