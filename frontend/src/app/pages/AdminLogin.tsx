import { Shield } from "lucide-react";
import { GuestRoute } from "../components/GuestRoute";
import { LoginPage } from "../components/LoginPage";

export function AdminLogin() {
  return (
    <GuestRoute portal="admin">
      <LoginPage
        portal="admin"
        title="Admin Login"
        subtitle="Access system administration"
        icon={Shield}
        pageTint="to-[#DCFCE7]"
        brandGradient="from-[#22C55E] to-[#22C55E]"
        ringColor="focus:ring-[#22C55E]"
        placeholderEmail="admin@tatari.local"
        demoHint="Demo: admin@tatari.local / Password123!"
      />
    </GuestRoute>
  );
}
