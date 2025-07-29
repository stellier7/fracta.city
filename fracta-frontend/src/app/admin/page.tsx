'use client';

import React from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Shield,
  Settings,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage properties, users, and platform operations.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm">+12%</span>
            </div>
            <h3 className="text-gray-300 text-sm mb-1">Total Users</h3>
            <p className="text-2xl font-bold text-white">1,247</p>
          </div>

          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-yellow-500 text-sm">+5</span>
            </div>
            <h3 className="text-gray-300 text-sm mb-1">Pending KYC</h3>
            <p className="text-2xl font-bold text-white">23</p>
          </div>

          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm">+2</span>
            </div>
            <h3 className="text-gray-300 text-sm mb-1">Active Properties</h3>
            <p className="text-2xl font-bold text-white">8</p>
          </div>

          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm">+8.5%</span>
            </div>
            <h3 className="text-gray-300 text-sm mb-1">Total Volume</h3>
            <p className="text-2xl font-bold text-white">$2.4M</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Property Management */}
          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Property Management</h2>
              <Building2 className="w-6 h-6 text-accent-primary" />
            </div>
            <div className="space-y-4">
              <Link 
                href="/admin/properties" 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">Manage Properties</span>
                </div>
                <span className="text-gray-400 text-sm">8 properties</span>
              </Link>
              <Link 
                href="/admin/properties/new" 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">Add New Property</span>
                </div>
                <span className="text-gray-400 text-sm">Create token</span>
              </Link>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <Users className="w-6 h-6 text-accent-primary" />
            </div>
            <div className="space-y-4">
              <Link 
                href="/admin/kyc" 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">KYC Management</span>
                </div>
                <span className="text-gray-400 text-sm">23 pending</span>
              </Link>
              <Link 
                href="/admin/users" 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">User Directory</span>
                </div>
                <span className="text-gray-400 text-sm">1,247 users</span>
              </Link>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Analytics</h2>
              <BarChart3 className="w-6 h-6 text-accent-primary" />
            </div>
            <div className="space-y-4">
              <Link 
                href="/admin/analytics" 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">Platform Analytics</span>
                </div>
                <span className="text-gray-400 text-sm">View reports</span>
              </Link>
              <Link 
                href="/admin/transactions" 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">Transaction History</span>
                </div>
                <span className="text-gray-400 text-sm">Monitor activity</span>
              </Link>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gradient-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <Settings className="w-6 h-6 text-accent-primary" />
            </div>
            <div className="space-y-4">
              <Link 
                href="/admin/settings" 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">Platform Settings</span>
                </div>
                <span className="text-gray-400 text-sm">Configure</span>
              </Link>
              <Link 
                href="/admin/security" 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-accent-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">Security Settings</span>
                </div>
                <span className="text-gray-400 text-sm">Manage access</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 