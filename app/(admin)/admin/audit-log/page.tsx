import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuditLogs, getAuditLogFilters } from '@/server/services/auditService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Search, Filter, RotateCcw, ChevronLeft, ChevronRight, Clock, User, Layers } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Audit Logs | Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function getActionBadgeVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (action.toUpperCase()) {
    case 'DELETE':
      return 'destructive';
    case 'CREATE':
    case 'LOGIN':
      return 'default';
    case 'UPDATE':
    case 'APPROVE':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; entity?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const actionParam = resolvedParams.action || '';
  const entityParam = resolvedParams.entity || '';
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10));

  const [{ logs, total, totalPages, pageSize }, filterOptions] = await Promise.all([
    getAuditLogs({
      search: q,
      action: actionParam,
      entity: entityParam,
      page,
      pageSize: 20,
    }),
    getAuditLogFilters(),
  ]);

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (actionParam) params.set('action', actionParam);
    if (entityParam) params.set('entity', entityParam);
    params.set('page', targetPage.toString());
    return `/admin/audit-log?${params.toString()}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track administrative operations, security events, and data changes across the system.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
          Total Events: <span className="font-semibold text-foreground">{total}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <form method="get" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="search-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  name="q"
                  defaultValue={q}
                  placeholder="Search actor, action, resource, or ID..."
                  className="pl-9 bg-card text-foreground border-input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="action-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</label>
              <select
                id="action-select"
                name="action"
                defaultValue={actionParam}
                className="flex h-9 w-full rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" className="bg-[#101426] text-[#F5F6FC]">All Actions</option>
                {filterOptions.actions.map((act) => (
                  <option key={act} value={act} className="bg-[#101426] text-[#F5F6FC]">
                    {act}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="entity-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resource Type</label>
              <select
                id="entity-select"
                name="entity"
                defaultValue={entityParam}
                className="flex h-9 w-full rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" className="bg-[#101426] text-[#F5F6FC]">All Resources</option>
                {filterOptions.entities.map((ent) => (
                  <option key={ent} value={ent} className="bg-[#101426] text-[#F5F6FC]">
                    {ent}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-2">
              {(q || actionParam || entityParam) && (
                <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/admin/audit-log">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Filters
                  </Link>
                </Button>
              )}
              <Button type="submit" size="sm" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-lg">Event History</CardTitle>
          <CardDescription>
            Showing {logs.length} of {total} recorded event{total === 1 ? '' : 's'} (Page {page} of {totalPages})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-3">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground/40" />
              <p className="text-base font-medium">No audit log records found.</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No events match your current filter criteria or none have been logged yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">Timestamp</th>
                    <th scope="col" className="py-3 px-4">Actor</th>
                    <th scope="col" className="py-3 px-4">Action</th>
                    <th scope="col" className="py-3 px-4">Resource</th>
                    <th scope="col" className="py-3 px-4">Resource ID</th>
                    <th scope="col" className="py-3 px-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => {
                    const formattedDate = new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    }).format(new Date(log.timestamp));

                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                            {formattedDate}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.actor ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-foreground flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-primary" />
                                {log.actor.name || 'Admin'}
                              </div>
                              <div className="text-xs text-muted-foreground">{log.actor.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">System / Anonymous</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-xs">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                          <span className="flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                            {log.entity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-muted-foreground break-all max-w-[180px]">
                          {log.entityId || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-[260px]">
                          {log.metadata ? (
                            <div className="font-mono bg-muted/60 border border-border/60 p-1.5 rounded text-[11px] truncate max-w-xs text-foreground/85" title={JSON.stringify(log.metadata, null, 2)}>
                              {JSON.stringify(log.metadata)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="py-4 px-6 border-t border-border flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild={page > 1}
                disabled={page <= 1}
                className="gap-1 text-xs"
              >
                {page > 1 ? (
                  <Link href={createPageUrl(page - 1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </span>
                )}
              </Button>
              <span className="text-xs font-medium px-2 text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                asChild={page < totalPages}
                disabled={page >= totalPages}
                className="gap-1 text-xs"
              >
                {page < totalPages ? (
                  <Link href={createPageUrl(page + 1)}>
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span>
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
