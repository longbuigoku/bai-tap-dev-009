import { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchPostsByPage } from '../api/posts';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface PaginatedPostListProps {
  staleTimeMs: number;
}

export function PaginatedPostList({ staleTimeMs }: PaginatedPostListProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 6;

  // useQuery with keepPreviousData to ensure seamless page transitions without flicker
  const { data, isPending, isFetching, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['posts', 'pagination', { page, limit }],
    queryFn: ({ signal }) => fetchPostsByPage({ page, limit, requestType: 'PAGINATION', signal }),
    placeholderData: keepPreviousData, // KEY REQUIREMENT: Chuyển trang không giật, giữ nguyên UI cũ cho tới khi có trang mới
    staleTime: staleTimeMs,
    gcTime: 5 * 60 * 1000,
  });

  const totalPages = data?.totalPages || Math.ceil(100 / limit);

  // Prefetch next page on hover or proactively to achieve instant 0ms transition!
  const prefetchPage = (targetPage: number) => {
    if (targetPage > 0 && targetPage <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['posts', 'pagination', { page: targetPage, limit }],
        queryFn: ({ signal }) =>
          fetchPostsByPage({ page: targetPage, limit, requestType: 'PREFETCH', signal }),
        staleTime: staleTimeMs,
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  return (
    <div className="feature-card">
      <div className="card-top-bar">
        <div>
          <h3 className="card-title">
            📄 Phân Trang Số Trang (Numbered Pagination)
          </h3>
          <p className="card-desc">
            Sử dụng <code>placeholderData: keepPreviousData</code> để chuyển trang siêu mượt mà không bị trắng màn hình / giật lag. Có cơ chế Prefetch khi hover!
          </p>
        </div>
        <div className="card-badges">
          <span className={`status-pill ${isFetching ? 'pill-fetching' : 'pill-fresh'}`}>
            {isFetching ? (
              <>
                <Loader2 className="spin-icon" size={13} /> Đang tải mạng...
              </>
            ) : (
              '⚡ Data Sẵn Sàng (Từ Cache)'
            )}
          </span>
          <button
            className="action-icon-btn"
            onClick={() => refetch()}
            title="Refetch trang hiện tại"
          >
            <RefreshCw size={15} className={isFetching ? 'spin-icon' : ''} />
          </button>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="pagination-controls">
        <div className="pagination-nav-group">
          <button
            className="p-btn"
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            title="Trang đầu"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="p-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            title="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="page-numbers">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === page;
            return (
              <button
                key={pageNum}
                className={`page-chip ${isCurrent ? 'current' : ''}`}
                onClick={() => handlePageChange(pageNum)}
                onMouseEnter={() => prefetchPage(pageNum)}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <div className="pagination-nav-group">
          <button
            className="p-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            title="Trang sau"
            onMouseEnter={() => prefetchPage(page + 1)}
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="p-btn"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            title="Trang cuối"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        <div className="page-summary">
          Trang <strong>{page}</strong> / {totalPages}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`posts-container ${isFetching && isPending ? 'loading-blur' : ''}`}>
        {isPending && !data ? (
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="post-skeleton" />
            ))}
          </div>
        ) : isError ? (
          <div className="error-box">
            <p>Có lỗi xảy ra: {(error as Error)?.message || 'Không thể lấy dữ liệu'}</p>
            <button className="btn btn-secondary" onClick={() => refetch()}>
              Thử lại
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {data?.data.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <span className="post-id-tag">#{post.id}</span>
                  <span className="post-user-tag">User {post.userId}</span>
                </div>
                <h4 className="post-title">{post.title}</h4>
                <p className="post-body">{post.body}</p>
                <div className="post-footer">
                  <span className="source-hint">
                    <Sparkles size={13} /> Trang {page} • Page Size {limit}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="footer-meta">
        <span>Cập nhật lúc: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'N/A'}</span>
        <span>
          💡 Di chuột vào các nút số trang để trải nghiệm <strong>Prefetch</strong> trước dữ liệu!
        </span>
      </div>
    </div>
  );
}
