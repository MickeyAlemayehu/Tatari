import type { ComponentType } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, gradient }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
      <div
        className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center mb-4`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm text-[#6B7280] mb-1">{title}</p>
      <p className="text-3xl text-[#111827]">{value}</p>
      <p className="text-xs text-[#6B7280] mt-1">{subtitle}</p>
    </div>
  );
}
