import { useState } from "react";
import { Palette, Globe, Volume2, Save } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { isSoundEnabled, setSoundEnabled } from "../hooks/sound";
import { useTheme, type ThemePreference } from "../../contexts/ThemeContext";

export function EmployeeSettings() {
  const { theme, setTheme } = useTheme();
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [language] = useState("en");

  const handleSaveSettings = () => {
    console.log("Settings saved");
  };

  return (
    <AppLayout title="Settings" subtitle="Manage your preferences">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Appearance Settings */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
              <Palette className="w-5 h-5 text-[#4F46E5]" />
              <div>
                <h3 className="text-[#111827]">Appearance</h3>
                <p className="text-sm text-[#6B7280]">Customize how the app looks</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Language
                  </label>
                  <select
                    value={language}
                    disabled
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#111827] cursor-not-allowed"
                  >
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as ThemePreference)}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-white focus:ring-2 focus:ring-[#4F46E5] focus:outline-none transition"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                  <p className="text-xs text-[#6B7280] mt-2">
                    Auto follows your operating system's preference.
                  </p>
                </div>

                {/* Sound Effects */}
                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-[#4F46E5] mt-0.5" />
                    <div>
                      <h4 className="text-sm text-[#111827] mb-1">Notification Sounds</h4>
                      <p className="text-xs text-[#6B7280]">
                        Play a short chime when sending or receiving notifications
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundOn}
                      onChange={(e) => {
                        setSoundOn(e.target.checked);
                        setSoundEnabled(e.target.checked);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F46E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4F46E5] transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
