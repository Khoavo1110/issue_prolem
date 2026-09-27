# Một vũ trụ sinh nhật cho Hồng Hạnh

Website sinh nhật tương tác, ưu tiên trải nghiệm trên điện thoại: chạm bánh để nhận lời chúc, khám phá ba ngôi sao, cào thiệp bí mật, viết điều ước, giữ nút để thổi nến và nghe nhạc sinh nhật tự tạo bằng Web Audio. Các hiệu ứng chuyển động tự giảm khi thiết bị bật chế độ giảm chuyển động.

## Chạy trên máy

Dùng Node.js 22 và npm:

```bash
npm ci
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal. Để xem trên điện thoại cùng Wi-Fi, mở địa chỉ **Network** Vite hiển thị.

Tạo và xem thử bản phát hành:

```bash
npm run build
npm run preview
```

Vite tạo website tĩnh trong thư mục `dist/`.

## Đưa lên GitHub Pages

1. Tạo repository trên GitHub và đưa mã nguồn dự án vào nhánh `main`. Giữ các tệp `package.json`, `package-lock.json`, `vite.config.js`, `index.html`, thư mục `src/`, `public/` và `.github/`. Nếu tải lên bằng giao diện web, nhớ kiểm tra tệp ẩn `.github/workflows/deploy.yml` đã được đưa lên. `node_modules/` và `dist/` đã được loại trong `.gitignore`.
2. Vào repository → **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
3. Vào **Actions → Deploy birthday website to Pages → Run workflow**, chọn nhánh `main` rồi chạy. Sau đó mỗi lần đẩy mã lên `main`, website tự cập nhật.
4. Khi công việc triển khai hoàn thành màu xanh, mở link trong mục **Deployments** hoặc **Settings → Pages**. Với repository thông thường, địa chỉ sẽ là `https://TEN-TAI-KHOAN.github.io/TEN-REPOSITORY/`.

Nếu dùng tên nhánh khác `main`, đổi `branches: [main]` trong [workflow](.github/workflows/deploy.yml) cho khớp.

Workflow tự chạy `npm ci`, tạo bản phát hành rồi triển khai `dist/`. Cấu hình Vite dùng `base: './'` nên tài nguyên hoạt động khi website nằm dưới đường dẫn tên repository; không cần sửa cấu hình khi đổi tên repository. Website không dùng máy chủ riêng hay kho dữ liệu.

Xem hướng dẫn chính thức của [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) và [đường dẫn tương đối của Vite](https://vite.dev/guide/build#relative-base).

## Đổi lời chúc

Sửa tên, bức thư, 10 điều, các lời nhắn và `secretNote` trong [src/content.js](src/content.js). Các lời chúc hiện là nội dung mẫu; bạn có thể thay bằng cách xưng hô và câu nói riêng trước khi gửi Hạnh.

## Nhạc và điện thoại

Nhạc bắt đầu sau khi người xem mở món quà vì trình duyệt điện thoại cần thao tác để phát âm thanh. Nút nhạc trên trang dùng để bật hoặc tắt. Sau khi chuyển ứng dụng hoặc khóa màn hình, có thể cần chạm nút nhạc để tiếp tục.

Trước khi gửi link, mở bản GitHub Pages trên Safari hoặc Chrome ở điện thoại: thử mở món quà, bật/tắt nhạc, giữ nút thổi nến và phần bất ngờ cuối. Nếu xem bằng trình duyệt bên trong ứng dụng nhắn tin mà âm thanh không phát, hãy mở link bằng Safari hoặc Chrome.
