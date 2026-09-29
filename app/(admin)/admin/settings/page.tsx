import { getAdminSiteSettings } from '@/server/services/siteSettingService';
import { Button } from '@/components/ui/button';
import { updateSettingsAction } from './actions';

export default async function AdminSettingsPage() {
  const settings = await getAdminSiteSettings();
  const getSetting = (key: string, defaultVal: any) => settings.find(s => s.key === key)?.value ?? defaultVal;

  const publicContactEmail = getSetting('publicContactEmail', '');
  const inquiryRetentionDays = getSetting('inquiryRetentionDays', 365);
  const sendVisitorAcknowledgement = getSetting('sendVisitorAcknowledgement', true);
  const availabilityMessage = getSetting('availabilityMessage', '');

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-3xl font-bold">Site Settings</h1>
      <form action={updateSettingsAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Public Contact Email</label>
          <input name="publicContactEmail" type="email" defaultValue={publicContactEmail} required className="mt-1 block w-full rounded-md border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Inquiry Retention Days (30-1825)</label>
          <input name="inquiryRetentionDays" type="number" min={30} max={1825} defaultValue={inquiryRetentionDays} required className="mt-1 block w-full rounded-md border p-2" />
        </div>
        <div className="flex items-center gap-2">
          <input name="sendVisitorAcknowledgement" type="checkbox" defaultChecked={sendVisitorAcknowledgement} className="rounded" />
          <label className="text-sm font-medium">Send Visitor Acknowledgement</label>
        </div>
        <div>
          <label className="block text-sm font-medium">Availability Message</label>
          <input name="availabilityMessage" defaultValue={availabilityMessage} className="mt-1 block w-full rounded-md border p-2" />
        </div>
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  );
}
