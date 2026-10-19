# Bài Tập Dev 009 - Phần 02: Danh Sách Lớn, Phân Trang & Cuộn Vô Tận

Ứng dụng React 19 + TypeScript + Vite + TanStack Query v5 thực hiện và giải quyết trọn vẹn 3 yêu cầu cốt lõi:

---

## 🎯 3 Yêu Cầu Đã Được Giải Quyết

### 1. Trang danh sách lớn có phân trang / infinite
- **Numbered Pagination**: Phân trang theo số trang (`page`, `limit`), thanh điều hướng trang đầu, trang trước, trang sau, trang cuối cùng danh sách số trang trực quan.
- **Infinite Scroll**: Hỗ trợ cuộn vô tận mượt mà bằng `useInfiniteQuery` tích hợp `IntersectionObserver` tự động kích hoạt tải khối dữ liệu tiếp theo khi cuộn tới cuối trang (sentinel anchor).
- Cung cấp nút chuyển đổi linh hoạt giữa 2 chế độ ngay trên thanh điều khiển.

### 2. Chuyển trang không load lại (Seamless Zero-Flicker Transition)
- **`placeholderData: keepPreviousData`**: Trong lúc TanStack Query đang gửi request tải trang mới, UI vẫn giữ nguyên nội dung trang hiện tại kèm hiệu ứng mờ nhẹ và badge trạng thái đang tải.
- Tuyệt đối **không xuất hiện màn hình trắng**, không nhảy layout giật cục (layout shift).
- **Proactive Prefetching**: Khi người dùng hover chuột vào bất kỳ nút số trang nào (`onMouseEnter`), hệ thống tự động gọi `queryClient.prefetchQuery` để nạp trước trang đó vào RAM cache. Khi người dùng click, chuyển trang diễn ra với độ trễ **0ms tức thì**!

### 3. Kiểm tra Network không request trùng (Request Deduplication & Caching)
- **Network Request Auditor Trực Tiếp**: Tích hợp sẵn panel theo dõi toàn bộ request mạng thực tế theo thời gian thực (URL, query param, thời gian phản hồi, trạng thái thành công/thất bại).
- **Chống request trùng khi lướt lại**: Khi quay lại bất kỳ trang nào đã duyệt trước đó trong thời hạn `staleTime`, dữ liệu được lấy ngay từ Cache mà **không phát sinh bất kỳ request HTTP nào**.
- **Chế độ kiểm thử bản sao đồng thời (Dedup Test)**: Cho phép bật đồng thời 2 component cùng gọi fetch trang đồng thời: TanStack Query tự động gom nhóm (deduplicate) và chỉ gửi **duy nhất 1 request HTTP** lên server.

---

## 🚀 Khởi chạy dự án

```bash
cd bai-tap-dev-009-02
npm install
npm run dev
```

Truy cập địa chỉ hiển thị trong terminal (ví dụ `http://localhost:5173/` hoặc port tiếp theo).
