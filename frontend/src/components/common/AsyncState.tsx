import { Button } from "./Button";
import { Icon } from "./Icon";
import { EventGridSkeleton } from "./Skeleton";

type LoadingVariant = "default" | "card";

export function LoadingState({
  label = "Loading data...",
  variant = "default",
  skeletonCount = 6,
}: {
  label?: string;
  variant?: LoadingVariant;
  skeletonCount?: number;
}) {
  if (variant === "card") {
    return <EventGridSkeleton count={skeletonCount} />;
  }
  return <div className="state-box state-loading">{label}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-box state-error">
      <div>
        <strong>Could not load data</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon = "sparkles",
  actions,
}: {
  title: string;
  description?: string;
  icon?: Parameters<typeof Icon>[0]["name"];
  actions?: React.ReactNode;
}) {
  return (
    <div className="state-box">
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
          <Icon name={icon} size={18} />
          <strong style={{ color: "var(--text)" }}>{title}</strong>
        </div>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </div>
  );
}
