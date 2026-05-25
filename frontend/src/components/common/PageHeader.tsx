import { Icon } from "./Icon";

type IconName = Parameters<typeof Icon>[0]["name"];

export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  eyebrowIcon?: IconName;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        {eyebrow && (
          <p className="eyebrow">
            {eyebrowIcon && <Icon name={eyebrowIcon} size={14} />}
            {eyebrow}
          </p>
        )}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
