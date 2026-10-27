import { getAdminSiteSettings } from '@/server/services/siteSettingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { updateSettingsAction } from './actions';

export const metadata = {
  title: 'Settings',
};

export default async function AdminSettingsPage() {
  const settings = await getAdminSiteSettings();
  const getSetting = (key: string, defaultVal: any) => settings.find(s => s.key === key)?.value ?? defaultVal;

  const publicContactEmail = getSetting('publicContactEmail', '');
  const inquiryRetentionDays = getSetting('inquiryRetentionDays', 365);
  const sendVisitorAcknowledgement = getSetting('sendVisitorAcknowledgement', true);
  const availabilityMessage = getSetting('availabilityMessage', '');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure global application variables, notifications, and retention policies.</p>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="pt-6">
          <form action={updateSettingsAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="publicContactEmail">Public Contact Email</Label>
              <Input id="publicContactEmail" name="publicContactEmail" type="email" defaultValue={publicContactEmail} required className="bg-card text-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiryRetentionDays">Inquiry Retention Days (30-1825)</Label>
              <Input id="inquiryRetentionDays" name="inquiryRetentionDays" type="number" min={30} max={1825} defaultValue={inquiryRetentionDays} required className="bg-card text-foreground" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
              <input id="sendVisitorAcknowledgement" name="sendVisitorAcknowledgement" type="checkbox" defaultChecked={sendVisitorAcknowledgement} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
              <Label htmlFor="sendVisitorAcknowledgement" className="cursor-pointer font-medium text-foreground">Send Visitor Acknowledgement Email</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityMessage">Availability Message</Label>
              <Input id="availabilityMessage" name="availabilityMessage" defaultValue={availabilityMessage} placeholder="e.g. Available for select contract work" className="bg-card text-foreground" />
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
