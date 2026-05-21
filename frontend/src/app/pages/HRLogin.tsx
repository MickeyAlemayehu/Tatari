import { Briefcase } from "lucide-react";
import { GuestRoute } from "../components/GuestRoute";
import { LoginPage } from "../components/LoginPage";

export function HRLogin() {
  return (
    <GuestRoute portal="hr">
      <LoginPage
        portal="hr"
        title="HR Login"
        subtitle="Access HR management portal"
        icon={Briefcase}
        pageTint="to-[#EEF2FF]"
        brandGradient="from-[#4F46E5] to-[#4338CA]"
        ringColor="focus:ring-[#4F46E5]"
        placeholderEmail="manager@tatari.local"
        demoHint="Demo: manager@tatari.local / Password123!"
      />
    </GuestRoute>
  );
}
