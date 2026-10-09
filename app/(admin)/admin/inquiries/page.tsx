import { inquiryService } from '@/server/services/inquiryService';
import { InquiryStatus } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'Inquiries - Admin',
  robots: { index: false, follow: false }
};

export default async function InquiriesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const statusParam = resolvedParams.status as InquiryStatus | undefined;
  const page = parseInt(resolvedParams.page || '1', 10);

  const { items, total } = await inquiryService.listInquiries({
    search: q,
    status: statusParam,
    page,
    limit: 20
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Inquiries</h1>
      </div>

      <div className="flex gap-4">
        <form method="get" className="flex gap-2 w-full max-w-2xl">
          <Input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search name or email..."
            className="w-full"
          />
          <select name="status" defaultValue={statusParam || ''} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="">All Statuses</option>
            {Object.values(InquiryStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button type="submit">Filter</Button>
        </form>
      </div>

      <div className="space-y-4">
        {items.map(inq => (
          <Card key={inq.id}>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl">{inq.name}</CardTitle>
                <Badge variant={
                  inq.status === 'NEW' ? 'default' : 
                  (inq.status === 'CONTACTED' || inq.status === 'QUALIFIED' || inq.status === 'PROPOSAL') ? 'secondary' : 
                  inq.status === 'WON' ? 'default' :
                  inq.status === 'LOST' ? 'destructive' : 'outline'
                }>
                  {inq.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/inquiries/${inq.id}`}>View Details</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-0 pb-4 text-sm text-muted-foreground flex flex-col gap-1">
              <p>Email: {inq.email}</p>
              <p>Date: {new Date(inq.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground">No inquiries found.</p>
        )}
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {items.length} of {total} inquiries
      </div>
    </div>
  );
}
