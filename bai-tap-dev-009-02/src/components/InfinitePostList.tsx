import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPostsByPage } from '../api/posts';
import { Loader2, ArrowDownCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface InfinitePostListProps {
  staleTimeMs: number;
}

export function InfinitePostList({ staleTimeMs }: InfinitePostListProps) {
  const limit = 8;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam = 1, signal }) =>
      fetchPostsByPage({ page: pageParam, limit, requestType: 'INFINITE', signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: staleTimeMs,
    gcTime: 5 * 60 * 1000,
  });

  // IntersectionObserver for auto trigger infinite scroll
  useEffect(() => {
    const observerTarget = loadMoreRef.current;
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(observerTarget);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all posts across loaded pages
  const allPosts = data?.pages.flatMap((page) => page.data) || [];
  const loadedPagesCount = data?.pages.length || 0;

  return (
    <div className="feature-card">
      <div className="card-top-bar">
        <div>
          <h3 className="card-title">
            📜 Cuộn Vô Tận (Infinite Scroll Pagination)
          </h3>
          <p className="card-desc">
            Sử dụng <code>useInfiniteQuery</code> + <code>IntersectionObserver</code>. Tải liên tục mượt mà, ghi nhớ lịch sử trang và deduplicate tất cả request.
          </p>
        </div>
        <div className="card-badges">
          <span className="counter-pill">
            Đã tải: <strong>{allPosts.length}</strong> bài ({loadedPagesCount} trang)
          </span>
          <span className={`status-pill ${isFetchingNextPage ? 'pill-fetching' : 'pill-fresh'}`}>
            {isFetchingNextPage ? (
              <>
                <Loader2 className="spin-icon" size={13} /> Đang tải trang tiếp...
              </>
            ) : hasNextPage ? (
              '⚡ Sẵn sàng cuộn tiếp'
            ) : (
              '✅ Đã tải toàn bộ'
            )}
          </span>
        </div>
      </div>

      {/* Posts Infinite Container */}
      <div className="infinite-scroll-area">
        {status === 'pending' ? (
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="post-skeleton" />
            ))}
          </div>
        ) : status === 'error' ? (
          <div className="error-box">
            <AlertCircle size={20} />
            <p>Lỗi tải dữ liệu: {(error as Error)?.message}</p>
            <button className="btn btn-secondary" onClick={() => refetch()}>
              Thử lại
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {allPosts.map((post, idx) => (
              <article key={`infinite-${post.id}-${idx}`} className="post-card">
                <div className="post-header">
                  <span className="post-id-tag">#{post.id}</span>
                  <span className="post-user-tag">User {post.userId}</span>
                </div>
                <h4 className="post-title">{post.title}</h4>
                <p className="post-body">{post.body}</p>
                <div className="post-footer">
                  <span className="source-hint">
                    Khối thứ {Math.floor(idx / limit) + 1} • Vị trí #{idx + 1}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Sentinel trigger element for IntersectionObserver */}
        <div ref={loadMoreRef} className="scroll-sentinel">
          {isFetchingNextPage ? (
            <div className="loading-more-indicator">
              <Loader2 className="spin-icon" size={20} />
              <span>Đang kéo thêm bài viết mới từ API...</span>
            </div>
          ) : hasNextPage ? (
            <button
              className="btn btn-secondary load-more-btn"
              onClick={() => fetchNextPage()}
              disabled={isFetching}
            >
              <ArrowDownCircle size={16} /> Tải thêm trang tiếp (hoặc cuộn chuột xuống)
            </button>
          ) : (
            <div className="end-of-list">
              <CheckCircle2 size={18} className="text-success" />
              <span>Bạn đã xem hết tất cả 100 bài viết trong cơ sở dữ liệu!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
