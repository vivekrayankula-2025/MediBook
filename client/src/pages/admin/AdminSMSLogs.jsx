import React, { useState, useEffect } from 'react';
import { smsApi } from '../../api/smsApi';
import SMSLogTable from '../../components/admin/SMSLogTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { MessageSquare, RefreshCw, Search, Filter, ShieldCheck, Send, CheckCircle2, AlertTriangle } from 'lucide-react';

const AdminSMSLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  // Filters
  const [phoneSearch, setPhoneSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [stats, setStats] = useState(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        smsApi.getSMSLogs({
          page,
          phone: phoneSearch || undefined,
          status: statusFilter || undefined,
          provider: providerFilter || undefined,
          templateType: templateFilter || undefined,
        }),
        smsApi.getSMSStats(),
      ]);

      setLogs(logsRes.data.logs);
      setPagination(logsRes.data.pagination);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load SMS audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [phoneSearch, statusFilter, providerFilter, templateFilter]);

  const handleRetry = async (logId) => {
    setRetryingId(logId);
    try {
      await smsApi.retrySMS(logId);
      toast.success('SMS retry dispatched successfully!');
      fetchLogs(pagination.page);
    } catch (err) {
      toast.error(err.message || 'SMS retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">
            Gateway Telemetry & Audit
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SMS Notification Delivery Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit outbound SMS confirmations, reminders, reschedule notices, carrier delivery status, and retry failed queues.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(pagination.page)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Active Gateway</span>
            <span className="text-base font-extrabold text-cyan-700 mt-0.5 block uppercase">
              {stats.activeProvider}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Dispatched</span>
            <span className="text-base font-extrabold text-slate-800 mt-0.5 block">
              {stats.total}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Delivered</span>
            <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">
              {stats.delivered + stats.sent}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Failed</span>
            <span className="text-base font-extrabold text-rose-600 mt-0.5 block">
              {stats.failed}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Opted Out (TCPA)</span>
            <span className="text-base font-extrabold text-amber-600 mt-0.5 block">
              {stats.optedOut}
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="Search recipient phone..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white"
          >
            <option value="">All Delivery Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed (Can Retry)</option>
            <option value="opted_out">Opted Out</option>
            <option value="queued">Queued</option>
          </select>
        </div>

        <div>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white"
          >
            <option value="">All Gateway Providers</option>
            <option value="mock">Mock Simulator</option>
            <option value="twilio">Twilio</option>
            <option value="msg91">MSG91</option>
          </select>
        </div>

        <div>
          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white"
          >
            <option value="">All Event Templates</option>
            <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
            <option value="APPOINTMENT_REMINDER">Appointment Reminder</option>
            <option value="BOOKING_RESCHEDULED">Booking Rescheduled</option>
            <option value="BOOKING_CANCELLED">Booking Cancelled</option>
            <option value="STATUS_UPDATE">Status Update</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving SMS audit logs..." />
      ) : (
        <div className="space-y-4">
          <SMSLogTable logs={logs} onRetry={handleRetry} retryingId={retryingId} />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total logs)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchLogs(pagination.page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchLogs(pagination.page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSMSLogs;
