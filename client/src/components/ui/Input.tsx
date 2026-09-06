"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  rightAction?: ReactNode;
  hint?: string;
}

export default function Input({
  label,
  icon,
  rightAction,
  hint,
  id,
  type = "text",
  className = "",
  ...rest
}: InputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="font-label-md text-label-md text-on-surface-variant ml-1 block"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={resolvedType}
          className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 ${
            icon ? "pl-12" : "pl-4"
          } ${
            isPassword || rightAction ? "pr-12" : "pr-4"
          } text-body-md font-body-md text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {visible ? "visibility_off" : "visibility"}
            </span>
          </button>
        )}
        {!isPassword && rightAction && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightAction}
          </div>
        )}
      </div>
      {hint && (
        <p className="text-xs text-on-surface-variant ml-1">{hint}</p>
      )}
    </div>
  );
}
