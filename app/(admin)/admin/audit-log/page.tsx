import { getAuditLogs } from '../../../../server/services/auditService';

export default async function AuditLogPage() {
  const logs = await getAuditLogs();
  
  return (
    <div>
      <h1>Audit Logs</h1>
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            {log.timestamp.toISOString()} - {log.actor?.name || 'System'} did {log.action} on {log.entity} ({log.entityId})
          </li>
        ))}
      </ul>
    </div>
  );
}
