interface AsyncStateProps {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children?: React.ReactNode;
}

export function AsyncState({
  loading,
  error,
  empty = false,
  emptyMessage = "No data found.",
  children,
}: AsyncStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
        {error}
      </div>
    );
  }

  if (empty) {
    return <p className="py-12 text-center text-sm text-[#6B7280]">{emptyMessage}</p>;
  }

  return <>{children}</>;
}
