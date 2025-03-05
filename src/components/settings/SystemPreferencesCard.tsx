
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Building, Save, MoonStar, Sun } from "lucide-react";

const SystemPreferencesCard = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    emailNotifications: false,
    automaticUpdates: true,
    darkMode: theme === "dark",
  });

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem("systemPreferences");
    if (savedPreferences) {
      try {
        const parsedPrefs = JSON.parse(savedPreferences);
        setPreferences({
          ...parsedPrefs,
          darkMode: theme === "dark" // Ensure darkMode matches current theme
        });
      } catch (error) {
        console.error("Error parsing saved preferences:", error);
      }
    }
  }, [theme]);

  const handleToggle = (preference: keyof typeof preferences) => {
    const newPreferences = { 
      ...preferences,
      [preference]: !preferences[preference]
    };
    
    setPreferences(newPreferences);
    
    // Save to localStorage
    localStorage.setItem("systemPreferences", JSON.stringify(newPreferences));
    
    // Handle special cases
    if (preference === "darkMode") {
      setTheme(newPreferences.darkMode ? "dark" : "light");
      toast({
        title: newPreferences.darkMode ? "Dark Mode Enabled" : "Light Mode Enabled",
        description: `The application theme has been updated.`,
      });
    } else {
      toast({
        title: "Preference Updated",
        description: `${preference.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())} has been ${newPreferences[preference] ? 'enabled' : 'disabled'}.`,
      });
    }
  };

  return (
    <Card className="bg-secondary/30 border-theme-light">
      <CardHeader className="bg-gradient-to-r from-secondary to-secondary/50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          System Preferences
        </CardTitle>
        <CardDescription>Configure system-wide settings and notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive email alerts for new orders</p>
          </div>
          <Switch 
            checked={preferences.emailNotifications} 
            onCheckedChange={() => handleToggle("emailNotifications")}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Automatic Updates</Label>
            <p className="text-sm text-muted-foreground">Keep the system up to date</p>
          </div>
          <Switch 
            checked={preferences.automaticUpdates} 
            onCheckedChange={() => handleToggle("automaticUpdates")}
            defaultChecked 
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex gap-2 items-center">
            <div className="text-primary">
              {preferences.darkMode ? <MoonStar className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
          </div>
          <Switch 
            checked={preferences.darkMode} 
            onCheckedChange={() => handleToggle("darkMode")}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemPreferencesCard;
