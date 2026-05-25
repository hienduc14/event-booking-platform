type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "on-dark";
  size?: "sm" | "md" | "lg";
};

export function Button({ className = "", variant = "primary", size = "md", ...props }: ButtonProps) {
  const sizeClass = size === "md" ? "" : `button-${size}`;
  const composed = ["button", `button-${variant}`, sizeClass, className].filter(Boolean).join(" ");
  return <button className={composed} {...props} />;
}
