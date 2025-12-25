import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { Switch } from "@/shared/ui/switch";
import { Loader2, Save } from "lucide-react";
import { notificationApi, type NotificationPreferences } from "../api";
import { useState } from "react";

export function NotificationPreferences() {
  const queryClient = useQueryClient();
  const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPreferences> | null>(null);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["/api/notifications/preferences"],
    queryFn: () => notificationApi.getPreferences(),
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<NotificationPreferences>) =>
      notificationApi.updatePreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
      setLocalPrefs(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return <div className="p-8 text-center text-muted-foreground">Failed to load preferences</div>;
  }

  const currentPrefs = localPrefs || preferences;
  const hasChanges = localPrefs !== null;

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setLocalPrefs((prev) => ({
      ...prev,
      ...preferences,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (localPrefs) {
      updateMutation.mutate(localPrefs);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Notification Preferences</h1>
        <p className="text-muted-foreground">Manage how and when you receive notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Enable or disable notifications globally</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={currentPrefs.emailEnabled}
              onCheckedChange={(checked) => handleToggle("emailEnabled", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="in-app-enabled">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications in the notification center
              </p>
            </div>
            <Switch
              id="in-app-enabled"
              checked={currentPrefs.inAppEnabled}
              onCheckedChange={(checked) => handleToggle("inAppEnabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Choose which types of notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="renewal-reminders">Renewal Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified before your mortgage term renews
              </p>
            </div>
            <Switch
              id="renewal-reminders"
              checked={currentPrefs.renewalReminders}
              onCheckedChange={(checked) => handleToggle("renewalReminders", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trigger-rate-alerts">Trigger Rate Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your rate approaches the trigger rate
              </p>
            </div>
            <Switch
              id="trigger-rate-alerts"
              checked={currentPrefs.triggerRateAlerts}
              onCheckedChange={(checked) => handleToggle("triggerRateAlerts", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rate-change-alerts">Rate Change Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when prime rates change significantly
              </p>
            </div>
            <Switch
              id="rate-change-alerts"
              checked={currentPrefs.rateChangeAlerts}
              onCheckedChange={(checked) => handleToggle("rateChangeAlerts", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="penalty-alerts">Penalty Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when penalty calculations are available
              </p>
            </div>
            <Switch
              id="penalty-alerts"
              checked={currentPrefs.penaltyAlerts}
              onCheckedChange={(checked) => handleToggle("penaltyAlerts", checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="blend-extend-alerts">Blend-and-Extend Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when blend-and-extend options are available
              </p>
            </div>
            <Switch
              id="blend-extend-alerts"
              checked={currentPrefs.blendExtendAlerts}
              onCheckedChange={(checked) => handleToggle("blendExtendAlerts", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setLocalPrefs(null)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}


