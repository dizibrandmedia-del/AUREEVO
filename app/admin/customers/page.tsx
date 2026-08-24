'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Users, Search, Crown, ShoppingBag, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async (searchTerm = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data.customers || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-brand text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-luxury-gold" />
            Clientele & Patron Directory
          </h1>
          <p className="text-xs text-luxury-muted mt-1">
            Registered patrons, order frequency, and VIP tier profiles.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 bg-luxury-card/40 border-luxury-border">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search patrons by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-luxury-muted" />}
            />
          </div>
          <Button type="submit" variant="gold" size="md">
            Search
          </Button>
        </form>
      </Card>

      {/* Customers Table */}
      <Card className="overflow-hidden bg-luxury-card/30 border-luxury-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-luxury-text">
            <thead className="bg-luxury-surface/80 text-luxury-muted uppercase tracking-wider font-semibold border-b border-luxury-border">
              <tr>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Tier Status</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-luxury-muted">
                    No patrons found matching your search.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-luxury-surface/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {c.name}
                        {c.isVip && (
                          <span title="VIP Patron">
                            <Crown className="w-3.5 h-3.5 text-luxury-gold" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-luxury-muted">
                        <Mail className="w-3 h-3 text-luxury-gold/70" />
                        {c.email}
                      </div>
                      {c.phone && c.phone !== '—' && (
                        <div className="flex items-center gap-1.5 text-luxury-muted">
                          <Phone className="w-3 h-3 text-luxury-gold/70" />
                          {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {c.isVip ? (
                        <Badge variant="gold" size="sm">
                          VIP Client
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Patron
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono font-medium text-white">
                      {c.totalOrders}
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-luxury-gold">
                      ₹{c.lifetimeSpend.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-luxury-muted flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
