import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { SpinnerCarga } from './SpinnerCarga';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Premium Button component with pill shape
 * Supports primary, secondary, ghost, and link variants
 * Black/white only color scheme
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
          'rounded-full', // Always pill-shaped

          // Variants
          {
            // Primary: Black with white text, elevation on hover
            'bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-none':
              variant === 'primary',
            // Secondary: White with black border, inverts on hover
            'bg-white text-black border-2 border-black hover:bg-black hover:text-white':
              variant === 'secondary',
            // Ghost: Transparent with subtle hover
            'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-black':
              variant === 'ghost',
            // Link: Text only with underline
            'bg-transparent text-black underline-offset-4 hover:underline p-0 h-auto':
              variant === 'link',
          },

          // Sizes (except for link which has no padding)
          variant !== 'link' && {
            'h-9 px-5 text-sm gap-1.5': size === 'sm',
            'h-11 px-6 text-sm gap-2': size === 'md',
            'h-13 px-8 text-base gap-2': size === 'lg',
            'h-14 px-10 text-base gap-2.5': size === 'xl',
          },

          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <SpinnerCarga size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
