"use client";

export default function ConfirmForm({ action, children, className, message, confirmWhen, fieldName }) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (confirmWhen && event.currentTarget.elements.namedItem(fieldName)?.value !== confirmWhen) return;
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
