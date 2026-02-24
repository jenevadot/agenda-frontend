import { cn } from '../../lib/utils';

interface SpinnerCargaProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
};

/**
 * Loading spinner component with black accent
 * Uses Tailwind animate-spin for smooth rotation
 */
export function SpinnerCarga({ size = 'md', className }: SpinnerCargaProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-gray-200 border-t-black',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Cargando"
      >
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
}
