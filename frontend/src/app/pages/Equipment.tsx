import { Laptop, Monitor, Smartphone, Keyboard, Mouse, Headphones, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

export function Equipment() {
  const equipment = [
    {
      id: 1,
      name: "MacBook Pro 16-inch",
      category: "Laptop",
      serialNumber: "C02ZH12345678",
      assignedDate: "Jan 15, 2022",
      status: "active" as const,
      icon: Laptop,
    },
    {
      id: 2,
      name: "Dell UltraSharp 27-inch Monitor",
      category: "Display",
      serialNumber: "CN-0P2418-74180-123-456A",
      assignedDate: "Jan 15, 2022",
      status: "active" as const,
      icon: Monitor,
    },
    {
      id: 3,
      name: "iPhone 14 Pro",
      category: "Mobile",
      serialNumber: "F2AP12345678",
      assignedDate: "Sep 20, 2023",
      status: "active" as const,
      icon: Smartphone,
    },
    {
      id: 4,
      name: "Logitech MX Keys",
      category: "Keyboard",
      serialNumber: "LGI-MXK-789012",
      assignedDate: "Jan 15, 2022",
      status: "active" as const,
      icon: Keyboard,
    },
    {
      id: 5,
      name: "Logitech MX Master 3",
      category: "Mouse",
      serialNumber: "LGI-MXM-345678",
      assignedDate: "Jan 15, 2022",
      status: "active" as const,
      icon: Mouse,
    },
    {
      id: 6,
      name: "Sony WH-1000XM4",
      category: "Headphones",
      serialNumber: "SNY-WH-901234",
      assignedDate: "Mar 10, 2023",
      status: "maintenance" as const,
      icon: Headphones,
    },
  ];

  const stats = [
    {
      label: "Active Equipment",
      value: equipment.filter((e) => e.status === "active").length,
      color: "from-[#22C55E] to-[#22C55E]",
      icon: CheckCircle,
    },
    {
      label: "In Maintenance",
      value: equipment.filter((e) => e.status === "maintenance").length,
      color: "from-[#F59E0B] to-[#F59E0B]",
      icon: AlertCircle,
    },
    {
      label: "Total Items",
      value: equipment.length,
      color: "from-[#4F46E5] to-[#4338CA]",
      icon: Laptop,
    },
  ];

  return (
    <AppLayout title="My Equipment" subtitle="Company equipment assigned to you">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-6 border border-[#E5E7EB]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl text-[#111827] mb-1">{stat.value}</h3>
                  <p className="text-sm text-[#6B7280]">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Equipment List */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Equipment List</h3>
              <p className="text-sm text-[#6B7280]">All items assigned to you</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {equipment.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="p-5 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#4F46E5] transition"
                    >
                      <div className="flex items-start gap-4">
                        {/* Equipment Icon */}
                        <div className="w-14 h-14 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-7 h-7 text-white" />
                        </div>

                        {/* Equipment Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-[#111827] mb-1">{item.name}</h4>
                              <p className="text-sm text-[#6B7280]">{item.category}</p>
                            </div>
                            <Badge
                              variant={item.status === "active" ? "success" : "warning"}
                              size="sm"
                            >
                              {item.status === "active" ? "Active" : "Maintenance"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#6B7280]">Serial Number:</span>
                              <span className="text-xs text-[#111827] font-mono">
                                {item.serialNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                              <span className="text-xs text-[#6B7280]">
                                Assigned: {item.assignedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
            <p className="text-sm text-[#06B6D4]">
              <strong>Note:</strong> If you need to report a damaged item or request new equipment,
              please contact IT Support or your department manager.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
