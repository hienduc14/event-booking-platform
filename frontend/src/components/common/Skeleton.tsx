export function EventCardSkeleton() {
  return (
    <div className="event-card event-card-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-media" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line long" />
      <div className="skeleton skeleton-line last" />
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="event-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <EventCardSkeleton key={idx} />
      ))}
    </div>
  );
}
