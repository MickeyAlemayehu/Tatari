import { AppLayout } from "../components/AppLayout";
import { HelpCircle, Mail, Phone, MessageCircle, FileText, Video } from "lucide-react";

export function Help() {
  const helpResources = [
    {
      icon: FileText,
      title: "Documentation",
      description: "Browse our comprehensive guides and tutorials",
      color: "indigo",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      color: "purple",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      color: "green",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      color: "blue",
    },
  ];

  const faqs = [
    {
      question: "How do I add a new employee?",
      answer: "Navigate to Employees > Add New Employee and fill out the required information.",
    },
    {
      question: "How can I approve leave requests?",
      answer: "Go to Leave > Approvals to view and approve pending leave requests.",
    },
    {
      question: "How do I generate payroll?",
      answer: "Visit Payroll > Generate to create payroll for the selected period.",
    },
    {
      question: "Where can I manage user roles?",
      answer: "Access Settings > Roles to create and manage user roles and permissions.",
    },
  ];

  return (
    <AppLayout title="Help & Support" subtitle="Get help and find answers to your questions">
      <div className="p-6 space-y-6">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpResources.map((resource) => {
            const Icon = resource.icon;
            const colorClasses = {
              indigo: "bg-[#EEF2FF] text-[#4F46E5]",
              purple: "bg-[#EEF2FF] text-[#4F46E5]",
              green: "bg-[#DCFCE7] text-[#22C55E]",
              blue: "bg-blue-100 text-blue-600",
            };

            return (
              <div
                key={resource.title}
                className="bg-white rounded-xl p-6 border border-[#E5E7EB] hover:shadow-lg transition cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-lg ${colorClasses[resource.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-[#111827] mb-2">{resource.title}</h3>
                <p className="text-sm text-[#6B7280]">{resource.description}</p>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-[#111827]">Frequently Asked Questions</h3>
            <p className="text-sm text-[#6B7280]">Quick answers to common questions</p>
          </div>
          <div className="p-6 space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <h4 className="text-sm text-[#111827] mb-2">{faq.question}</h4>
                <p className="text-sm text-[#6B7280]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-[#111827]">Contact Information</h3>
            <p className="text-sm text-[#6B7280]">Reach out to our support team</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EEF2FF] text-[#4F46E5] rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-[#111827]">Email</p>
                <p className="text-sm text-[#6B7280]">support@hrms.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#DCFCE7] text-[#22C55E] rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-[#111827]">Phone</p>
                <p className="text-sm text-[#6B7280]">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
