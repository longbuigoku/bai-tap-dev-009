export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface NetworkLogEntry {
  id: string;
  timestamp: string;
  type: 'PAGINATION' | 'INFINITE' | 'PREFETCH';
  page: number;
  limit: number;
  url: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  durationMs?: number;
}

// Global network request log tracker & deduplication auditor
let networkRequestCount = 0;
const networkLogs: NetworkLogEntry[] = [];
const logSubscribers = new Set<() => void>();

export const getNetworkRequestCount = () => networkRequestCount;
export const getNetworkLogs = () => [...networkLogs];

export const subscribeNetworkLogs = (callback: () => void) => {
  logSubscribers.add(callback);
  return () => {
    logSubscribers.delete(callback);
  };
};

const notifySubscribers = () => {
  logSubscribers.forEach((cb) => cb());
};

export const resetNetworkRequestStats = () => {
  networkRequestCount = 0;
  networkLogs.length = 0;
  notifySubscribers();
};

export interface FetchPostsParams {
  page: number;
  limit?: number;
  requestType?: 'PAGINATION' | 'INFINITE' | 'PREFETCH';
  signal?: AbortSignal;
}

export interface PaginatedPostsResponse {
  data: Post[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

const TOTAL_POSTS = 100; // JSONPlaceholder has 100 posts

export async function fetchPostsByPage({
  page,
  limit = 8,
  requestType = 'PAGINATION',
  signal,
}: FetchPostsParams): Promise<PaginatedPostsResponse> {
  networkRequestCount += 1;
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const startTime = performance.now();
  const url = `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`;

  const logEntry: NetworkLogEntry = {
    id: requestId,
    timestamp: new Date().toLocaleTimeString(),
    type: requestType,
    page,
    limit,
    url,
    status: 'PENDING',
  };

  networkLogs.unshift(logEntry);
  if (networkLogs.length > 50) networkLogs.pop();
  notifySubscribers();

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Artificial realistic latency (450ms) to inspect in-flight deduplication & loading states
    await new Promise((resolve) => setTimeout(resolve, 450));

    const data: Post[] = await response.json();
    const durationMs = Math.round(performance.now() - startTime);

    logEntry.status = 'SUCCESS';
    logEntry.durationMs = durationMs;
    notifySubscribers();

    const totalPages = Math.ceil(TOTAL_POSTS / limit);

    return {
      data,
      page,
      limit,
      totalCount: TOTAL_POSTS,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    logEntry.status = 'ERROR';
    logEntry.durationMs = Math.round(performance.now() - startTime);
    notifySubscribers();
    throw error;
  }
}
