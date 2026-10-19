import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ManualPostList } from './components/ManualPostList';
import { QueryPostList } from './components/QueryPostList';
import { getNetworkRequestCount, resetNetworkRequestCount } from './api/posts';

export function App() {
  const queryClient = useQueryClient();
  const [requestCount, setRequestCount] = useState(getNetworkRequestCount());
  
  // Toggle mount states to test cache & staleTime behaviors
  const [showManualComponents, setShowManualComponents] = useState(false);
  const [showQueryComponents, setShowQueryComponents] = useState(true);
  const [instanceCount, setInstanceCount] = useState(2); // Render multiple instances to test Dedup!
  const [staleTimePreset, setStaleTimePreset] = useState<number>(10000); // 10s

  useEffect(() => {
    const interval = setInterval(() => {
      setRequestCount(getNetworkRequestCount());
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    queryClient.clear();
  };

  const handleInvalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const handleResetCounter = () => {
    resetNetworkRequestCount();
    setRequestCount(0);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="title-area">
          <span className="logo-badge">Vite + React TS</span>
          <h1>TanStack Query v5 Optimization Demo</h1>
          <p className="subtitle">
            Minh họa chuyển đổi Fetch thủ công sang <code>useQuery</code>, cấu hình <code>staleTime</code>, <code>gcTime</code> và kiểm tra <strong>Request Deduplication (Chống request trùng)</strong>.
          </p>
        </div>

        {/* Global Live Network Request Monitor */}
        <div className="stats-card">
          <div className="stat-item">
            <span className="stat-label">Tổng Network Request thực tế</span>
            <span className="stat-value highlight">{requestCount}</span>
          </div>
          <button className="btn btn-secondary" onClick={handleResetCounter}>
            Reset Đếm Request
          </button>
        </div>
      </header>

      {/* Control Dashboard */}
      <section className="control-panel">
        <div className="panel-group">
          <span className="group-title">🛠️ Thao tác & Kiểm thử:</span>
          <div className="btn-group">
            <button
              className={`toggle-btn ${showQueryComponents ? 'active' : ''}`}
              onClick={() => setShowQueryComponents(!showQueryComponents)}
            >
              {showQueryComponents ? 'Ẩn' : 'Bật'} useQuery ({instanceCount} instances)
            </button>
            <button
              className={`toggle-btn manual ${showManualComponents ? 'active' : ''}`}
              onClick={() => setShowManualComponents(!showManualComponents)}
            >
              {showManualComponents ? 'Ẩn' : 'Bật'} Fetch thủ công ({instanceCount} instances)
            </button>
          </div>
        </div>

        <div className="panel-group">
          <span className="group-title">⚡ Dedup Testing (Số component đồng thời):</span>
          <div className="btn-group">
            {[1, 2, 3, 5].map((num) => (
              <button
                key={num}
                className={`chip ${instanceCount === num ? 'selected' : ''}`}
                onClick={() => setInstanceCount(num)}
              >
                {num} {num === 1 ? 'Component' : 'Components'}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-group">
          <span className="group-title">⏱️ staleTime Preset:</span>
          <div className="btn-group">
            <button
              className={`chip ${staleTimePreset === 0 ? 'selected' : ''}`}
              onClick={() => setStaleTimePreset(0)}
            >
              0s (Luôn Stale)
            </button>
            <button
              className={`chip ${staleTimePreset === 10000 ? 'selected' : ''}`}
              onClick={() => setStaleTimePreset(10000)}
            >
              10s (Khuyên dùng)
            </button>
            <button
              className={`chip ${staleTimePreset === 60000 ? 'selected' : ''}`}
              onClick={() => setStaleTimePreset(60000)}
            >
              60s
            </button>
          </div>
        </div>

        <div className="panel-group">
          <span className="group-title">🔄 Query Actions:</span>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleInvalidate}>
              Invalidate ['posts']
            </button>
            <button className="btn btn-danger" onClick={handleClearCache}>
              Xóa Cache (gcTime)
            </button>
          </div>
        </div>
      </section>

      {/* Knowledge explanations box */}
      <section className="knowledge-section">
        <div className="knowledge-card">
          <h4>💡 1. Request Deduplication (Chống trùng request)</h4>
          <p>
            Khi bạn mount {instanceCount} component cùng gọi <code>fetchPosts()</code>:
            <br />
            - <strong>Fetch thủ công</strong>: Gửi đúng {instanceCount} request HTTP song song lên server (lãng phí tài nguyên).
            <br />
            - <strong>useQuery</strong>: TanStack gom nhóm chung <code>queryKey: ['posts']</code> và chỉ gửi <strong>DUY NHẤT 1</strong> request HTTP thực tế!
          </p>
        </div>
        <div className="knowledge-card">
          <h4>⏳ 2. staleTime (Độ tươi của data)</h4>
          <p>
            Thời gian data được xem là <em>Fresh</em>. Khi bạn ẩn rồi bật lại component trong vòng {staleTimePreset / 1000}s, TanStack Query sẽ lấy ngay data từ cache mà <strong>KHÔNG</strong> kích hoạt request mạng.
          </p>
        </div>
        <div className="knowledge-card">
          <h4>🧹 3. gcTime (Garbage Collection Time)</h4>
          <p>
            Thời gian dữ liệu không hoạt động (khi tất cả các component unmount) vẫn được lưu trong bộ nhớ RAM trước khi bị xóa bỏ hoàn toàn (Mặc định: 5 phút).
          </p>
        </div>
      </section>

      {/* Main Grid Display */}
      <main className="comparison-grid">
        {/* Section 1: TanStack Query */}
        <div className="grid-column">
          <div className="column-header">
            <h2>✨ TanStack useQuery ({showQueryComponents ? instanceCount : 0} đang chạy)</h2>
            <span className="badge-optimal">Tối ưu & Tự Dedup</span>
          </div>

          {showQueryComponents ? (
            <div className="instance-list">
              {Array.from({ length: instanceCount }).map((_, index) => (
                <QueryPostList
                  key={`query-${index}-${staleTimePreset}`}
                  label={`Query Instance #${index + 1}`}
                  staleTimeMs={staleTimePreset}
                  gcTimeMs={5 * 60 * 1000}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Component useQuery đang bị unmount. Hãy bật lại để xem cơ chế lấy dữ liệu từ cache mà không gọi network nếu còn Fresh!
            </div>
          )}
        </div>

        {/* Section 2: Manual Fetch */}
        <div className="grid-column">
          <div className="column-header">
            <h2>⚠️ Fetch thủ công ({showManualComponents ? instanceCount : 0} đang chạy)</h2>
            <span className="badge-warning">Không Dedup - Request trùng lặp</span>
          </div>

          {showManualComponents ? (
            <div className="instance-list">
              {Array.from({ length: instanceCount }).map((_, index) => (
                <ManualPostList
                  key={`manual-${index}`}
                  label={`Manual Instance #${index + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Component thủ công đang tắt. Bật lên để thấy số Network Request tăng vọt theo số component!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export default App;
