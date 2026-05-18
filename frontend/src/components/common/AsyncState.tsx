import { Button } from "./Button";

export function LoadingState({ label = "Loading data..." }: { label?: string }) {
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
        <Button type="button" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="state-box">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}

