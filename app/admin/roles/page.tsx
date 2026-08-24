'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Shield, Users, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';

export default function RolesPage() {
  const { error } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRoles(data.data.roles);
        } else {
          error(data.error || 'Failed to fetch roles');
        }
      })
      .catch(() => error('Failed to load RBAC roles'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Pre-configured enterprise permission templates enforced across both API endpoints and frontend controls.
          </p>
        </div>
      </div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="flex flex-col justify-between group hover:border-luxury-gold/40 transition-all">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-brand text-white">{role.name}</h3>
                      <span className="text-[10px] font-mono text-luxury-gold-light">
                        {role.slug}
                      </span>
                    </div>
                  </div>
                  <Badge variant="gold" size="sm">
                    {role.userCount || 0} Staff
                  </Badge>
                </div>

                <p className="text-xs text-luxury-muted mt-3 leading-relaxed">
                  {role.description || 'Pre-configured access matrix.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-luxury-border/60 flex items-center justify-between">
                <span className="text-[11px] text-luxury-gold-light font-medium">
                  {role.permissions?.length || 0} Permissions Granted
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  View Grants
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Role Permissions Inspection Modal */}
      <Modal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title={`Grants Matrix: ${selectedRole?.name}`}
        subtitle={`Active security privileges assigned to ${selectedRole?.slug}`}
        maxWidth="md"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {selectedRole?.slug === 'super-admin' ? (
            <div className="p-4 rounded-xl bg-luxury-emerald/50 border border-luxury-gold/40 text-xs text-luxury-gold-light">
              <div className="flex items-center gap-2 font-bold text-white mb-1">
                <Lock className="w-4 h-4 text-luxury-gold" />
                <span>Unrestricted Root Privileges</span>
              </div>
              Super Admin possesses global wildcard authorization (*) across all current and future platform modules.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedRole?.permissions?.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-luxury-dark/80 border border-luxury-border text-xs"
                >
                  <div>
                    <span className="font-semibold text-white block">{p.name}</span>
                    <span className="text-[10px] font-mono text-luxury-gold-light">{p.code}</span>
                  </div>
                  <Badge variant="emerald" size="sm">
                    {p.module}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
