import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container premium-shadow",
  secondary:
    "bg-secondary text-on-secondary hover:opacity-90 premium-shadow",
  outline:
    "bg-white border border-outline-variant text-primary hover:bg-surface-container-low",
  ghost:
    "bg-transparent text-on-surface-variant hover:text-primary",
  white:
    "bg-white text-primary hover:bg-surface-container-low premium-shadow",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-body-lg rounded-xl",
  lg: "px-10 py-4 text-headline-sm rounded-2xl",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  children: ReactNode;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

interface ButtonAsLink extends BaseProps {
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "right",
    className = "",
    children,
  } = props;

  const isDisabled = "disabled" in props && props.disabled;

  const classes = `inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] hover:scale-[1.01] ${variantClasses[variant]} ${sizeClasses[size]} ${
    isDisabled ? "opacity-60 pointer-events-none" : ""
  } ${className}`;

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {content}
      </Link>
    );
  }

  const { href: _href, ...buttonProps } = props as ButtonAsButton;
  void _href;

  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
