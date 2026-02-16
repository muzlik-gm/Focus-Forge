import { cn } from '@/lib/utils';

/**
 * Skeleton Loader Component
 * 
 * Provides skeleton loaders for various content types.
 * 
 * Requirements: 21.4
 */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Basic skeleton loader
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded',
        className
      )}
    />
  );
}

/**
 * Skeleton for text content
 */
export function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array(lines)
        .fill(null)
        .map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-4',
              i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
    </div>
  );
}

/**
 * Skeleton for circular elements (avatars, icons)
 */
export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Skeleton for card content
 */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonCircle size={40} />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

/**
 * Skeleton for metrics card
 */
export function SkeletonMetricsCard() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/**
 * Skeleton for task card
 */
export function SkeletonTaskCard() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded mt-0.5" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton for chart
 */
export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton style={{ height }} />
    </div>
  );
}

/**
 * Skeleton for table row
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex gap-4 py-3 border-b">
      {Array(columns)
        .fill(null)
        .map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${100 / columns}%` }}
          />
        ))}
    </div>
  );
}

/**
 * Skeleton for list
 */
export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array(items)
        .fill(null)
        .map((_, i) => (
          <SkeletonCard key={i} />
        ))}
    </div>
  );
}

/**
 * Loading spinner component
 */
export function Spinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-primary/30 border-t-primary',
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Loading overlay component
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export function LoadingOverlay({ isLoading, children, message }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Spinner size={40} className="mx-auto mb-2" />
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}