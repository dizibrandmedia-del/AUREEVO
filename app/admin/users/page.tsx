'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, UserCheck, Key, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/ToastContext';

export default function AdminUsersPage() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRoleId, setFormRoleId] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsersAndRoles = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/admin/roles').then((r) => r.json()),
      ]);

      if (usersRes.success) setUsers(usersRes.data.users);
      if (rolesRes.success) {
        setRoles(rolesRes.data.roles);
        if (rolesRes.data.roles.length > 0 && !formRoleId) {
          setFormRoleId(rolesRes.data.roles[0].id);
        }
      }
    } catch {
      error('Failed to load admin user roster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    if (roles.length > 0) setFormRoleId(roles[0].id);
    setFormStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRoleId(user.role?.id || '');
    setFormStatus(user.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: any = {
      name: formName,
      email: formEmail,
      roleId: formRoleId,
      status: formStatus,
    };

    if (formPassword) payload.password = formPassword;

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        success(editingUser ? 'User credentials updated' : 'Admin user invited');
        setIsModalOpen(false);
        fetchUsersAndRoles();
      } else {
        error(data.error || 'Failed to save admin user');
      }
    } catch {
      error('Network error saving admin user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        success('Admin user account removed');
        setIsDeleteDialogOpen(false);
        fetchUsersAndRoles();
      } else {
        error(data.error || 'Failed to delete user');
      }
    } catch {
      error('Network error deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-luxury-border/60">
        <div>
          <h1 className="text-2xl font-bold font-brand tracking-wide text-white">
            Staff & Administrator Accounts
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Manage authenticated personnel, assign system roles, and revoke administrative access.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Invite Staff Member
        </Button>
      </div>

      {/* Admin Users Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-luxury-emerald/60 border border-luxury-border flex items-center justify-center text-luxury-gold font-bold text-xs">
                        {u.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">{u.name}</div>
                        <div className="text-[11px] text-luxury-muted">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="gold">
                      {u.role?.name || 'Super Admin'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-luxury-muted font-mono">
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={u.status === 'ACTIVE' ? 'emerald' : 'rose'}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg text-luxury-muted hover:text-luxury-gold hover:bg-luxury-surface/50 transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingUser(u);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-luxury-muted hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add / Edit Admin User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Staff Account' : 'Invite Staff Administrator'}
        subtitle="Set permissions by selecting a predefined role template."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Elena Vance"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="name@aureevo.com"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            disabled={!!editingUser}
            required
          />

          <Input
            label={editingUser ? 'New Password (leave blank to keep current)' : 'Account Password *'}
            type="password"
            placeholder="Min 8 characters"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            required={!editingUser}
          />

          <Select
            label="Assigned System Role *"
            value={formRoleId}
            onChange={(e) => setFormRoleId(e.target.value)}
            required
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>

          <Select
            label="Account Status"
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value)}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE (Access Blocked)</option>
          </Select>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-luxury-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" isLoading={isSaving}>
              {editingUser ? 'Save Changes' : 'Create Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Revoke Admin Access"
        message={`Are you sure you want to remove the administrator account for "${deletingUser?.name}" (${deletingUser?.email})?`}
        confirmText="Revoke Access"
        isLoading={isDeleting}
      />
    </div>
  );
}
