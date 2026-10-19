import { useState, useEffect } from 'react';
import { fetchPosts } from '../api/posts';
import type { Post } from '../api/posts';

interface ManualPostListProps {
  label: string;
}

export function ManualPostList({ label }: ManualPostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchPosts()
      .then((data) => {
        if (isMounted) {
          setPosts(data);
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="card manual-card">
      <div className="card-badge manual-badge">Fetch thủ công (useEffect + useState)</div>
      <h3>{label}</h3>
      <p className="card-subtitle">
        ⚠️ <strong>Hạn chế:</strong> Mỗi instance render sẽ trigger 1 HTTP request riêng biệt, không có cache, không dedup!
      </p>

      {isLoading && (
        <div className="status-box loading">
          <span className="spinner"></span> Đang tải dữ liệu...
        </div>
      )}

      {error && <div className="status-box error">Lỗi: {error}</div>}

      {!isLoading && !error && (
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
