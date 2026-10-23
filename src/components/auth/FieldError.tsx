/** Inline field validation message. */
export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-[12px] font-medium text-destructive">
      {message}
    </p>
  );
}
