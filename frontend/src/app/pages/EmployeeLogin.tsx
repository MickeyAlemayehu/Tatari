import { User } from "lucide-react";
import { GuestRoute } from "../components/GuestRoute";
import { LoginPage } from "../components/LoginPage";

export function EmployeeLogin() {
  return (
    <GuestRoute portal="employee">
      <LoginPage
        portal="employee"
        title="Employee Login"
        subtitle="Access your employee portal"
        icon={User}
        pageTint="to-[#ECFEFF]"
        brandGradient="from-[#06B6D4] to-[#06B6D4]"
        ringColor="focus:ring-[#06B6D4]"
        placeholderEmail="staff@tatari.local"
        demoHint="Demo: staff@tatari.local / Password123!"
      />
    </GuestRoute>
  );
}
