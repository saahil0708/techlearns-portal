import React from 'react';

export interface FluidArrowProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
  sx?: any;
}

export const FluidArrowRight = ({
  size = 20,
  className = '',
  style,
  color,
  sx,
}: FluidArrowProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle', ...style, ...sx }}
  >
    <path
      d="M4 12H20M20 12C16 12 14 8 14 6M20 12C16 12 14 16 14 18"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FluidArrowLeft = ({
  size = 20,
  className = '',
  style,
  color,
  sx,
}: FluidArrowProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle', ...style, ...sx }}
  >
    <path
      d="M20 12H4M4 12C8 12 10 8 10 6M4 12C8 12 10 16 10 18"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FluidArrowUp = ({
  size = 20,
  className = '',
  style,
  color,
  sx,
}: FluidArrowProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle', ...style, ...sx }}
  >
    <path
      d="M12 20V4M12 4C12 8 8 10 6 10M12 4C12 8 16 10 18 10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FluidArrowDown = ({
  size = 20,
  className = '',
  style,
  color,
  sx,
}: FluidArrowProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle', ...style, ...sx }}
  >
    <path
      d="M12 4V20M12 20C12 16 8 14 6 14M12 20C12 16 16 14 18 14"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FluidArrowOutward = ({
  size = 20,
  className = '',
  style,
  color,
  sx,
}: FluidArrowProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ color: color || 'currentColor', display: 'inline-block', verticalAlign: 'middle', ...style, ...sx }}
  >
    <path
      d="M7 17L17 7M17 7H10M17 7V14"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Aliases
export const FluidArrowForward = FluidArrowRight;
export const FluidArrowBack = FluidArrowLeft;
export const FluidArrowUpward = FluidArrowUp;
export const FluidArrowDownward = FluidArrowDown;