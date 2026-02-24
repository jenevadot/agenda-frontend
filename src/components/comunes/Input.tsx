import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Modern Input component with black/white styling
 * Features larger padding, rounded-xl corners, and elegant focus states
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-black tracking-tight"
          >
            {label}
            {required && <span className="text-gray-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-white border-2 rounded-xl px-5 py-4 text-base text-black',
            'placeholder:text-gray-400',
            'transition-all duration-200',
            'hover:border-gray-300 hover:bg-gray-50/50',
            'focus:outline-none focus:border-black focus:bg-white',
            'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
            error
              ? 'border-black'
              : 'border-gray-200',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
