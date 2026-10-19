export interface Post {
  id: number;
  title: string;
  body: string;
}

// Track API request count globally to clearly prove deduplication and cache hits
let networkRequestCount = 0;

export const getNetworkRequestCount = () => networkRequestCount;
export const resetNetworkRequestCount = () => {
  networkRequestCount = 0;
};

export async function fetchPosts(): Promise<Post[]> {
  networkRequestCount += 1;
  const currentCount = networkRequestCount;
  console.log(`[API Call #${currentCount}] Fetching posts from remote server...`);

  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }
  
  // Artificial delay to simulate real network latency so user can observe loading state & dedup in flight
  await new Promise((resolve) => setTimeout(resolve, 600));

  return response.json();
}
