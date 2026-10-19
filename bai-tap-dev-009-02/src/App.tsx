import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PaginatedPostList } from './components/PaginatedPostList';
import { InfinitePostList } from './components/InfinitePostList';
import { NetworkMonitor } from './components/NetworkMonitor';
import { BookOpen, Infinity as InfinityIcon, Layers, RefreshCw, Trash2, Cpu } from 'lucide-react';

export function App() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pagination' | 'infinite'>('pagination');
  const [staleTimeMs, setStaleTimeMs] = useState<number>(30000); // 30s fresh
  const [showDuplicateViewer, setShowDuplicateViewer] = useState<boolean>(false);

  const handleClearCache = () => {
    queryClient.clear();
  };

  const handleInvalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  return (
    <div className="container">
      {/* Top Banner / Hero */}
      <header className="header">
        <div className="header-badge">
          <Cpu size={14} />
          <span>Vite + React 19 + TypeScript + TanStack Query v5</span>
        </div>
        <h1 className="main-title">
          Danh Sách Lớn: Phân Trang & Cuộn Vô Tận Tối Ưu
        </h1>
        <p className="main-subtitle">
          Giải quyết bài toán: <strong>Danh sách lớn</strong>, <strong>Chuyển trang không giật / không reload</strong>, và <strong>Chống trùng Request (Request Deduplication & Caching)</strong>.
        </p>

        {/* Global Toolbar Controls */}
        <div className="toolbar">
          <div className="toolbar-group">
            <span className="toolbar-label">Chế độ hiển thị:</span>
            <div className="tab-pill-group">
              <button
                className={`tab-pill ${activeTab === 'pagination' ? 'active' : ''}`}
                onClick={() => setActiveTab('pagination')}
              >
                <BookOpen size={15} />
                <span>1. Phân Trang (keepPreviousData)</span>
              </button>
              <button
                className={`tab-pill ${activeTab === 'infinite' ? 'active' : ''}`}
                onClick={() => setActiveTab('infinite')}
              >
                <InfinityIcon size={15} />
                <span>2. Cuộn Vô Tận (useInfiniteQuery)</span>
              </button>
            </div>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Cấu hình staleTime:</span>
            <div className="chip-group">
              <button
                className={`chip ${staleTimeMs === 0 ? 'selected' : ''}`}
                onClick={() => setStaleTimeMs(0)}
              >
                0s (Luôn Stale)
              </button>
              <button
                className={`chip ${staleTimeMs === 30000 ? 'selected' : ''}`}
                onClick={() => setStaleTimeMs(30000)}
              >
                30s (Khuyên dùng)
              </button>
              <button
                className={`chip ${staleTimeMs === 120000 ? 'selected' : ''}`}
                onClick={() => setStaleTimeMs(120000)}
              >
                2 phút
              </button>
            </div>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Kiểm thử đồng thời:</span>
            <button
              className={`toggle-check-btn ${showDuplicateViewer ? 'active' : ''}`}
              onClick={() => setShowDuplicateViewer(!showDuplicateViewer)}
              title="Render song song 2 danh sách cùng lúc để chứng minh request deduplication"
            >
              <Layers size={14} />
              <span>{showDuplicateViewer ? 'Tắt' : 'Bật'} Component Bản Sao (Dedup Test)</span>
            </button>
          </div>

          <div className="toolbar-group actions-group">
            <button
              className="btn btn-secondary"
              onClick={handleInvalidateAll}
              title="Kích hoạt refetch nền"
            >
              <RefreshCw size={14} /> Refetch All
            </button>
            <button
              className="btn btn-danger"
              onClick={handleClearCache}
              title="Xóa toàn bộ RAM cache"
            >
              <Trash2 size={14} /> Clear Cache
            </button>
          </div>
        </div>
      </header>

      {/* Network Auditor Live Monitor */}
      <section className="network-section">
        <NetworkMonitor />
      </section>

      {/* Main Content Workspace */}
      <main className="content-workspace">
        <div className={`workspace-layout ${showDuplicateViewer ? 'layout-dual' : 'layout-single'}`}>
          <div className="primary-pane">
            <div className="pane-badge">
              <span>Màn Hình Chính #{1}</span>
            </div>
            {activeTab === 'pagination' ? (
              <PaginatedPostList staleTimeMs={staleTimeMs} />
            ) : (
              <InfinitePostList staleTimeMs={staleTimeMs} />
            )}
          </div>

          {showDuplicateViewer && (
            <div className="duplicate-pane">
              <div className="pane-badge badge-alt">
                <span>Màn Hình Phụ #{2} (Render đồng thời)</span>
              </div>
              <div className="dedup-callout">
                🛡️ Hai component này cùng gửi request dữ liệu trang đồng thời, nhưng hãy nhìn bảng Network Monitor: <strong>Chỉ 1 request duy nhất được gửi!</strong>
              </div>
              {activeTab === 'pagination' ? (
                <PaginatedPostList staleTimeMs={staleTimeMs} />
              ) : (
                <InfinitePostList staleTimeMs={staleTimeMs} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
