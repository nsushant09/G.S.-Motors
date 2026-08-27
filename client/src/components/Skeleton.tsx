interface CarCardSkeletonProps {
  variant?: 'default' | 'featured';
}

export function CarCardSkeleton({ variant = 'default' }: CarCardSkeletonProps) {
  const large = variant === 'featured';
  return (
    <div className="animate-pulse">
      <div className={`rounded bg-moss/10 ${large ? 'aspect-[16/11] md:aspect-[4/3]' : 'aspect-[16/10]'}`} />
      <div className={`mt-4 rounded bg-moss/10 ${large ? 'h-7 w-4/5' : 'h-5 w-3/4'}`} />
      <div className="mt-2 h-3 w-1/2 rounded bg-moss/10" />
      <div className="mt-3 h-6 w-2/5 rounded bg-moss/10" />
    </div>
  );
}
