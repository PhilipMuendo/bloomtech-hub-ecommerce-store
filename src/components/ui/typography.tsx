import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Typography primitives that map to the type scale defined in index.css.
 * Prefer these over ad-hoc `text-xl font-bold` combinations so headings and
 * body copy stay consistent across the app.
 *
 *   <Heading level={1}>Shop</Heading>
 *   <Text variant="lead">Browse our catalog</Text>
 */

type HeadingLevel = 1 | 2 | 3 | 4;

const headingClass: Record<HeadingLevel, string> = {
  1: 'text-h1',
  2: 'text-h2',
  3: 'text-h3',
  4: 'text-h4',
};

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  /** Use the larger hero style for top-of-page titles. */
  display?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({ level = 2, display, className, children, ...props }) => {
  const Tag = `h${level}` as React.ElementType;
  return (
    <Tag className={cn(display ? 'text-display' : headingClass[level], className)} {...props}>
      {children}
    </Tag>
  );
};

type TextVariant = 'body' | 'lead' | 'caption';

const textClass: Record<TextVariant, string> = {
  body: 'text-body',
  lead: 'text-lead',
  caption: 'text-caption',
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: 'p' | 'span' | 'div';
}

export const Text: React.FC<TextProps> = ({ variant = 'body', as = 'p', className, children, ...props }) => {
  const Tag = as as React.ElementType;
  return (
    <Tag className={cn(textClass[variant], className)} {...props}>
      {children}
    </Tag>
  );
};
