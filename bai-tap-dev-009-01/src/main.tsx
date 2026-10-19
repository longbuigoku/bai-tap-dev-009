import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';

// Cấu hình QueryClient mặc định với staleTime & gcTime hợp lý
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000, // 10 giây: data tươi mới, không fetch lại vô cớ
      gcTime: 5 * 60 * 1000, // 5 phút: lưu cache khi inactive
      refetchOnWindowFocus: false, // Tránh refetch ngoài ý muốn khi tab switch trong lúc demo
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
