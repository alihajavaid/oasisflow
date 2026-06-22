"use client";

import type { ReactNode, MouseEvent } from "react";

export function ConfirmSubmitButton({
  children,
  className,
  confirmMessage,
}: {
  children: ReactNode;
  className?: string;
  confirmMessage: string;
}) {
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  }

  return (
    <button type="submit" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
