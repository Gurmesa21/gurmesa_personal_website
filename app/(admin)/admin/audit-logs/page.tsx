import { redirect } from 'next/navigation';

export default async function AuditLogsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(resolved)) {
    if (typeof val === 'string') {
      params.set(key, val);
    }
  }
  const queryString = params.toString();
  redirect(`/admin/audit-log${queryString ? `?${queryString}` : ''}`);
}
