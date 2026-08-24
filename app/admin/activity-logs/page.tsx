'use client';

import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, User, Shield, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/ToastContext';

export default function ActivityLogsPage() {
  const { error } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (entityFilter !== 'ALL') query.set('entity', entityFilter);
      if (actionFilter !== 'ALL') query.set('action', actionFilter);
      query.set('page', String(page));
      query.set('limit', '25');

      const res = await fetch(`/api/admin/activity-logs?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      } else {
        error(data.error || 'Failed to fetch logs');
      }
    } catch {
      error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter, page]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Audit Trail & Activity Logs
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Immutable tracking of administrator logins, product manipulations, stock movements, and setting alterations.
          </p>
        </div>

        <Button variant="emerald" size="sm" onClick={fetchLogs} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Stream
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="bg-luxury-card/90 border border-luxury-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
        >
          <option value="ALL">All Entity Modules</option>
          <option value="Product">Products</option>
          <option value="Category">Categories</option>
          <option value="Brand">Brands</option>
          <option value="Attribute">Attributes</option>
          <option value="Inventory">Inventory</option>
          <option value="AdminAuth">Authentication</option>
          <option value="AdminSetting">Settings</option>
          <option value="AdminUser">Admin Users</option>
          <option value="PRODUCTS">CSV Product Imports</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="bg-luxury-card/90 border border-luxury-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
        >
          <option value="ALL">All Action Types</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="DUPLICATE">DUPLICATE</option>
          <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT</option>
          <option value="UPDATE_SETTINGS">UPDATE_SETTINGS</option>
          <option value="IMPORT_CSV">IMPORT_CSV</option>
        </select>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          {logs.length === 0 ? (
            <EmptyState
              icon={<History className="w-8 h-8" />}
              title="No Logs Match Query"
              description="Admin actions and system security events will appear here in chronological order."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className="text-xs text-white font-mono">{formatDate(log.createdAt)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-luxury-emerald/60 border border-luxury-border flex items-center justify-center text-[10px] font-bold text-luxury-gold shrink-0">
                            {log.adminUser?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <span className="font-semibold text-white text-xs block">
                              {log.adminUser?.name || 'System / Automated'}
                            </span>
                            {log.adminUser?.role?.name && (
                              <span className="text-[10px] text-luxury-muted">
                                {log.adminUser.role.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.action === 'CREATE' || log.action === 'LOGIN'
                              ? 'emerald'
                              : log.action === 'DELETE'
                              ? 'rose'
                              : log.action === 'STOCK_ADJUSTMENT' || log.action === 'UPDATE'
                              ? 'amber'
                              : 'gold'
                          }
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-luxury-gold-light font-medium">{log.entity}</span>
                        {log.entityId && (
                          <span className="text-[10px] text-luxury-muted font-mono block">
                            ID: {log.entityId.slice(0, 12)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-luxury-muted">{log.ipAddress || '127.0.0.1'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-luxury-border/60 text-xs text-luxury-muted">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Entry"
        subtitle={`Action ID: ${selectedLog?.id}`}
        maxWidth="md"
      >
        {selectedLog && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-luxury-surface/40 border border-luxury-border">
              <div>
                <span className="text-luxury-muted block">Administrator:</span>
                <span className="font-semibold text-white">{selectedLog.adminUser?.name || 'System'}</span>
              </div>
              <div>
                <span className="text-luxury-muted block">Timestamp:</span>
                <span className="font-mono text-white">{formatDate(selectedLog.createdAt)}</span>
              </div>
              <div>
                <span className="text-luxury-muted block">Action:</span>
                <span className="font-bold text-luxury-gold">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-luxury-muted block">Target Entity:</span>
                <span className="text-white">{selectedLog.entity}</span>
              </div>
            </div>

            <div>
              <span className="text-luxury-muted block mb-1 font-semibold uppercase tracking-wider">
                Captured Metadata Context:
              </span>
              <pre className="p-3 rounded-xl bg-luxury-darkest border border-luxury-border font-mono text-[11px] text-luxury-gold-light overflow-x-auto">
                {selectedLog.metadata
                  ? JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)
                  : 'No extra metadata recorded'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
