'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Globe, CheckCircle2, XCircle, Clock, Eye, Filter, Search, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { KYCService, KYCSubmission } from '@/lib/kyc';

export default function AdminKYCPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    jurisdiction: 'all',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load real KYC submissions from API
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const apiSubmissions = await KYCService.getAdminKYCSubmissions();
        setSubmissions(apiSubmissions);
        setFilteredSubmissions(apiSubmissions);
      } catch (error) {
        console.error('Failed to load KYC submissions:', error);
        // Fallback to mock data for testing
        const mockSubmissions: KYCSubmission[] = [
          {
            id: 1,
            userId: 101,
            userEmail: 'john.doe@example.com',
            userName: 'John Doe',
            kycType: 'prospera-permit',
            jurisdiction: 'prospera',
            status: 'pending',
            submittedAt: '2024-01-15T10:30:00Z',
            personalInfo: {
              firstName: 'John',
              lastName: 'Doe',
              dateOfBirth: '1985-03-15',
              nationality: 'Honduran',
              permitNumber: 'PR-2024-001234'
            }
          },
          {
            id: 2,
            userId: 102,
            userEmail: 'jane.smith@example.com',
            userName: 'Jane Smith',
            kycType: 'international-kyc',
            jurisdiction: 'international',
            status: 'pending',
            submittedAt: '2024-01-14T14:20:00Z',
            documents: {
              front: '/api/mock/document-front-1.jpg',
              back: '/api/mock/document-back-1.jpg',
              faceScan: '/api/mock/face-scan-1.jpg'
            },
            personalInfo: {
              firstName: 'Jane',
              lastName: 'Smith',
              dateOfBirth: '1990-07-22',
              nationality: 'American'
            }
          }
        ];
        setSubmissions(mockSubmissions);
        setFilteredSubmissions(mockSubmissions);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  useEffect(() => {
    let filtered = submissions;

    if (filters.status !== 'all') {
      filtered = filtered.filter(sub => sub.status === filters.status);
    }

    if (filters.jurisdiction !== 'all') {
      filtered = filtered.filter(sub => sub.jurisdiction === filters.jurisdiction);
    }

    if (filters.search) {
      filtered = filtered.filter(sub => 
        sub.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  }, [submissions, filters]);

  const handleApprove = async (submissionId: number) => {
    try {
      await KYCService.approveKYC(submissionId);
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'approved' as const } : sub
      ));
      
      setSelectedSubmission(null);
      alert('KYC approved successfully!');
    } catch (error) {
      console.error('Failed to approve KYC:', error);
      alert('Failed to approve KYC. Please try again.');
    }
  };

  const handleReject = async (submissionId: number, reason: string) => {
    try {
      await KYCService.rejectKYC(submissionId, reason);
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'rejected' as const } : sub
      ));
      
      setSelectedSubmission(null);
      alert('KYC rejected successfully!');
    } catch (error) {
      console.error('Failed to reject KYC:', error);
      alert('Failed to reject KYC. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading KYC submissions...</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">KYC Management</h1>
            <p className="text-gray-300">Review and approve identity verification submissions</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-primary hover:shadow-button text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gradient-card p-6 rounded-2xl border border-white/10 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-accent-primary focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filters.jurisdiction}
              onChange={(e) => setFilters({...filters, jurisdiction: e.target.value})}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-accent-primary focus:outline-none transition-colors"
            >
              <option value="all">All Jurisdictions</option>
              <option value="prospera">Prospera</option>
              <option value="international">International</option>
            </select>
            
            <div className="text-gray-300 text-sm flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredSubmissions.length} submissions
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="grid gap-6">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-gradient-card p-6 rounded-2xl border border-white/10 hover:border-accent-primary/30 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedSubmission(submission)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    submission.jurisdiction === 'prospera' 
                      ? 'bg-gradient-primary' 
                      : 'bg-gradient-secondary'
                  }`}>
                    {submission.jurisdiction === 'prospera' ? (
                      <Shield className="w-6 h-6 text-white" />
                    ) : (
                      <Globe className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white">{submission.userName}</h3>
                    <p className="text-gray-300 text-sm">{submission.userEmail}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.jurisdiction === 'prospera' 
                          ? 'bg-accent-primary/20 text-accent-primary' 
                          : 'bg-accent-secondary/20 text-accent-secondary'
                      }`}>
                        {submission.jurisdiction === 'prospera' ? 'Prospera' : 'International'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                        submission.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(submission.submittedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(submission.status)}
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No submissions found</div>
          </div>
        )}

        {/* Submission Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-card rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    KYC Submission Details
                  </h2>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* User Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">User Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">Name</label>
                        <p className="text-white">{selectedSubmission?.userName}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <p className="text-white">{selectedSubmission?.userEmail}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Jurisdiction</label>
                        <p className="text-white capitalize">{selectedSubmission?.jurisdiction}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <p className={`${getStatusColor(selectedSubmission?.status || '')}`}>
                          {selectedSubmission?.status?.charAt(0).toUpperCase() + selectedSubmission?.status?.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  {selectedSubmission?.personalInfo && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">First Name</label>
                          <p className="text-white">{selectedSubmission.personalInfo.firstName}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Last Name</label>
                          <p className="text-white">{selectedSubmission.personalInfo.lastName}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Date of Birth</label>
                          <p className="text-white">{selectedSubmission.personalInfo.dateOfBirth}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Nationality</label>
                          <p className="text-white">{selectedSubmission.personalInfo.nationality}</p>
                        </div>
                        {selectedSubmission.personalInfo.permitNumber && (
                          <div>
                            <label className="text-gray-400 text-sm">Permit Number</label>
                            <p className="text-white">{selectedSubmission.personalInfo.permitNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents (for International KYC) */}
                {selectedSubmission?.documents && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Documents</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {selectedSubmission.documents.front && (
                        <div>
                          <label className="text-gray-400 text-sm block mb-2">Front of Document</label>
                          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                            <div className="text-center text-gray-400">Document Image</div>
                          </div>
                        </div>
                      )}
                      {selectedSubmission.documents.back && (
                        <div>
                          <label className="text-gray-400 text-sm block mb-2">Back of Document</label>
                          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                            <div className="text-center text-gray-400">Document Image</div>
                          </div>
                        </div>
                      )}
                      {selectedSubmission.documents.faceScan && (
                        <div>
                          <label className="text-gray-400 text-sm block mb-2">Face Scan</label>
                          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                            <div className="text-center text-gray-400">Face Image</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedSubmission?.status === 'pending' && (
                  <div className="flex space-x-4 mt-8 pt-6 border-t border-white/10">
                    <button
                      onClick={() => handleApprove(selectedSubmission.id)}
                      className="flex-1 bg-gradient-primary hover:shadow-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2 inline" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedSubmission.id, 'Document verification failed')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-smooth transform hover:-translate-y-1"
                    >
                      <XCircle className="w-5 h-5 mr-2 inline" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 