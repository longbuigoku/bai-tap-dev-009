import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api/posts';

interface QueryPostListProps {
  label: string;
  staleTimeMs?: number;
  gcTimeMs?: number;
}

export function QueryPostList({ label, staleTimeMs = 10000, gcTimeMs = 5 * 60 * 1000 }: QueryPostListProps) {
  /**
   * useQuery Configuration:
   * 1. queryKey: ['posts'] -> Định danh query trong cache store.
   * 2. staleTime: Thời gian dữ liệu được coi là "fresh". Trong thời gian này, không refetch khi component mount lại.
   * 3. gcTime (trước đây là cacheTime): Thời gian lưu data trong RAM sau khi component unmount.
   * 4. Deduplication: Nếu nhiều component cùng gọi queryKey ['posts'] đồng thời, TanStack Query chỉ gửi DUY NHẤT 1 network request!
   */
  const {
    data: posts,
    isLoading,
    isFetching,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: staleTimeMs, // Dữ liệu giữ trạng thái fresh trong staleTimeMs
    gcTime: gcTimeMs,       // Garbage Collection time: giữ trong cache sau khi inactive
  });

  return (
    <div className="card query-card">
      <div className="card-badge query-badge">TanStack useQuery (Tối ưu hóa)</div>
      <div className="card-header-row">
        <h3>{label}</h3>
        {isFetching && <span className="fetching-pill">🔄 Background Refetching...</span>}
      </div>

      <div className="config-indicator">
        <span>⏱️ staleTime: <strong>{staleTimeMs / 1000}s</strong></span>
        <span>🧹 gcTime: <strong>{gcTimeMs / 1000}s</strong></span>
        {dataUpdatedAt > 0 && (
          <span>🕒 Updated: <strong>{new Date(dataUpdatedAt).toLocaleTimeString()}</strong></span>
        )}
      </div>

      <p className="card-subtitle">
        ✨ <strong>Lợi ích:</strong> Tự động Request Deduping, Background caching, không tải lại nếu data vẫn fresh!
      </p>

      {isLoading && (
        <div className="status-box loading">
          <span className="spinner"></span> Đang tải lần đầu (Initial Loading)...
        </div>
      )}

      {error && <div className="status-box error">Lỗi: {(error as Error).message}</div>}

      {posts && (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <span className="post-id">#{post.id}</span>
              <strong>{post.title}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
