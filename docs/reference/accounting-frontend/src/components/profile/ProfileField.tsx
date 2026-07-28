interface ProfileFieldProps {
  label: string;
  value: string | null | undefined;
  fallback?: string;
}

export function ProfileField({ label, value, fallback = "Ej angivet" }: ProfileFieldProps) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">
        {value?.trim() || <span className="italic text-muted-foreground/60">{fallback}</span>}
      </dd>
    </div>
  );
}
