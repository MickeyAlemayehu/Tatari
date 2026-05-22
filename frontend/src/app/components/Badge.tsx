interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  color?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  icon,
  color,
}: BadgeProps) {
  const variants = {
    success: "bg-[#DCFCE7] text-[#22C55E] border-[#22C55E]/20",
    warning: "bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/20",
    danger: "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20",
    info: "bg-[#ECFEFF] text-[#06B6D4] border-[#06B6D4]/20",
    default: "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${color ?? variants[variant]} ${sizes[size]}`}
    >
      {icon}
      {children}
    </span>
  );
}
