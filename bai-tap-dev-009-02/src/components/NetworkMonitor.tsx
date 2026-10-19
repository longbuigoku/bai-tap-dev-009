import { useEffect, useState } from 'react';
import {
  getNetworkLogs,
  getNetworkRequestCount,
  subscribeNetworkLogs,
  resetNetworkRequestStats,
  type NetworkLogEntry,
} from '../api/posts';
import { Activity, Trash2, CheckCircle2, Clock, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

export function NetworkMonitor() {
  const [logs, setLogs] = useState<NetworkLogEntry[]>(getNetworkLogs());
  const [count, setCount] = useState(getNetworkRequestCount());

  useEffect(() => {
    const unsubscribe = subscribeNetworkLogs(() => {
      setLogs(getNetworkLogs());
      setCount(getNetworkRequestCount());
    });
    return unsubscribe;
  }, []);

  return (
    <div className="network-monitor-card">
      <div className="monitor-header">
        <div className="monitor-title">
          <Activity size={18} className="pulse-icon" />
          <span>Real-time Network Auditor (Kiểm tra Request)</span>
        </div>
        <div className="monitor-actions">
          <div className="count-badge">
            Tổng Requests: <strong>{count}</strong>
          </div>
          <button
            className="btn btn-sm btn-ghost"
            onClick={resetNetworkRequestStats}
            title="Xóa danh sách logs"
          >
            <Trash2 size={14} /> Clear Log
          </button>
        </div>
      </div>

      <div className="monitor-explanation">
        <div className="explanation-pill success">
          <ShieldCheck size={14} />
          <span>
            <strong>Không request trùng:</strong> Khi chuyển trang đã duyệt trước đó hoặc cuộn lại dữ liệu cũ, TanStack Query đọc từ Cache (0 request phát sinh).
          </span>
        </div>
      </div>

      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="logs-empty">Chưa có request mạng nào được ghi nhận...</div>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id} className={`log-row status-${log.status.toLowerCase()}`}>
                <div className="log-col-time">{log.timestamp}</div>
                <div className="log-col-badge">
                  <span className={`tag-${log.type.toLowerCase()}`}>{log.type}</span>
                </div>
                <div className="log-col-page">Trang {log.page}</div>
                <div className="log-col-url" title={log.url}>
                  {log.url.replace('https://jsonplaceholder.typicode.com', '')}
                </div>
                <div className="log-col-status">
                  {log.status === 'PENDING' && (
                    <span className="status-indicator pending">
                      <Clock size={12} /> Đang gọi...
                    </span>
                  )}
                  {log.status === 'SUCCESS' && (
                    <span className="status-indicator success">
                      <Check size={12} /> {log.durationMs}ms
                    </span>
                  )}
                  {log.status === 'ERROR' && (
                    <span className="status-indicator error">
                      <AlertTriangle size={12} /> Thất bại
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="monitor-footer">
        <span className="legend-item">
          <CheckCircle2 size={12} className="text-emerald" /> <strong>Prefetch:</strong> Tải ngầm trước khi bấm chuyển trang
        </span>
        <span className="legend-item">
          <CheckCircle2 size={12} className="text-cyan" /> <strong>Cache Hit:</strong> Nhảy trang cũ không tạo thêm log nào tại đây!
        </span>
      </div>
    </div>
  );
}
