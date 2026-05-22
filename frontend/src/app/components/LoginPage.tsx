import { useState, type ComponentType, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../lib/api";
import { getDefaultDashboard } from "../../lib/portal-access";
import type { Portal } from "../../types/employee";

interface LoginPageProps {
  portal: Portal;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  pageTint: string;
  brandGradient: string;
  ringColor: string;
  placeholderEmail: string;
  demoHint: string;
}

export function LoginPage({
  portal,
  title,
  subtitle,
  icon: Icon,
  pageTint,
  brandGradient,
  ringColor,
  placeholderEmail,
  demoHint,
}: LoginPageProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await login(email.trim(), password);
      if (session.portal !== portal) {
        throw new ApiError("Your account does not have access to this portal.", 403);
      }
      navigate(getDefaultDashboard(session.employee));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9FAFB] ${pageTint} p-4`}>
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to role selection</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-8">
            <div className={`w-16 h-16 bg-gradient-to-br ${brandGradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl text-[#111827] mb-2">{title}</h1>
            <p className="text-[#6B7280]">{subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-[#111827] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholderEmail}
                autoComplete="email"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent transition disabled:opacity-60`}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#111827] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 ${ringColor} focus:border-transparent transition disabled:opacity-60`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r ${brandGradient} text-white py-3 rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-60`}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B7280]">{demoHint}</p>
        </div>
      </div>
    </div>
  );
}
