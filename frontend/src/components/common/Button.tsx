type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return <button className={`button button-${variant} ${className}`.trim()} {...props} />;
}

