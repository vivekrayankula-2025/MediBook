import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { RotateCw, MessageSquare, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SMSLogTable = ({ logs, onRetry, retryingId }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">No SMS notification logs found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          <tr>
            <th className="py-3.5 px-4">Recipient Phone</th>
            <th className="py-3.5 px-4">Patient / Ref</th>
            <th className="py-3.5 px-4">Template Event</th>
            <th className="py-3.5 px-4">Delivery Status</th>
            <th className="py-3.5 px-4">Gateway</th>
            <th className="py-3.5 px-4">Message Preview</th>
            <th className="py-3.5 px-4">Timestamp</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((log) => {
            const isRetrying = retryingId === log._id;
            return (
              <tr key={log._id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                  {log.recipientPhone}
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-800">
                    {log.patientId?.name || 'Walk-in / Unregistered'}
                  </div>
                  {log.appointmentId?.bookingReference && (
                    <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                      {log.appointmentId.bookingReference}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 font-semibold text-slate-700">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider font-bold">
                    {log.templateType ? log.templateType.replace(/_/g, ' ') : 'ALERT'}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <StatusBadge status={log.status} type="sms" />
                  {log.retryCount > 0 && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Retry {log.retryCount}/{log.maxRetries}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 font-mono text-[11px] uppercase font-semibold text-slate-600">
                  {log.provider}
                </td>

                <td className="py-3.5 px-4 max-w-xs truncate" title={log.messageBody}>
                  {log.messageBody}
                </td>

                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                  {new Date(log.createdAt).toLocaleString()}
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  {log.status === 'failed' ? (
                    <button
                      type="button"
                      disabled={isRetrying || log.retryCount >= log.maxRetries}
                      onClick={() => onRetry(log._id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 inline-flex items-center gap-1 transition disabled:opacity-40"
                    >
                      <RotateCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                      <span>{isRetrying ? 'Retrying...' : 'Retry SMS'}</span>
                    </button>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SMSLogTable;
