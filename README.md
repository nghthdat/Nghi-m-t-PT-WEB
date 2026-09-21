🍽️ Ăn Gì Hôm Nay? (Ăn Gì Đi)

Giải pháp giải cứu bữa ăn hàng ngày – Giúp bạn và đồng nghiệp/bạn bè không còn phải đau đầu với câu hỏi kinh điển: "Hôm nay ăn gì?"

🔗 Live Website: https://angihomnay11.vercel.app/

📌 Giới thiệu dự án

Ăn Gì Hôm Nay là một ứng dụng web tiện ích được phát triển bởi nhóm PT-11, ra đời nhằm giải quyết vấn đề nan giải mỗi bữa ăn: mất thời gian suy nghĩ, tranh cãi lựa chọn món ăn và địa điểm.

Dự án cung cấp giao diện trực quan, tính năng gợi ý nhanh chóng, vòng quay may mắn ngẫu nhiên và danh sách món ăn đa dạng theo sở thích, ngân sách và địa điểm.

✨ Tính năng nổi bật

🎲 Gợi ý ngẫu nhiên / Vòng quay may mắn: Bấm là có món, giải quyết nhanh cơn "khủng hoảng lựa chọn".

🍜 Bộ lọc thông minh: Lọc món theo thể loại (Cơm, Bún/Phở, Đồ ăn vặt, Trà sữa/Cà phê, Ăn chay,...), theo mức giá hoặc thời điểm trong ngày (Sáng, Trưa, Tối).

📍 Gợi ý địa điểm & Quán ăn: Liên kết gợi ý món kèm theo địa chỉ hoặc định vị quán ăn lân cận.

📋 Quản lý danh sách yêu thích: Lưu lại những món ăn khoái khẩu hoặc các quán ăn muốn thử sau.

📱 Giao diện Responsive: Trải nghiệm mượt mà, tối ưu trên cả thiết bị di động, tablet và máy tính để bàn.

🛠️ Công nghệ sử dụng (Tech Stack)

Frontend: React / Next.js / Vue.js (tuỳ chỉnh theo stack của nhóm)

Styling: Tailwind CSS / CSS Modules

Deployment & CI/CD: Vercel

Quản lý mã nguồn: Git & GitHub

🚀 Hướng dẫn cài đặt & Chạy cục bộ (Local Development)

Dành cho các thành viên muốn tham gia phát triển dự án trên máy cá nhân:

1. Yêu cầu môi trường

Node.js (phiên bản 18 trở lên khuyến nghị)

Trình quản lý gói: npm, yarn hoặc pnpm

2. Clone mã nguồn

git clone https://github.com/<your-username>/<your-repo-name>.git
cd Nghi-m-t-PT-WEB


3. Cài đặt các thư viện phụ thuộc

npm install
# hoặc
yarn install
# hoặc
pnpm install


4. Thiết lập biến môi trường (Environment Variables)

Sao chép tệp mẫu hoặc kéo cấu hình từ Vercel:

# Tự tạo file .env.local hoặc liên kết với Vercel CLI
vercel env pull .env.local


5. Chạy dự án ở chế độ Local Development

npm run dev
# hoặc
yarn dev


Mở trình duyệt và truy cập http://localhost:3000 để xem kết quả.

👥 Quy trình làm việc nhóm (Team Workflow)

Để việc cộng tác code diễn ra suôn sẻ, không bị conflict (xung đột mã nguồn), các thành viên tuân theo quy tắc sau:

Cập nhật code mới nhất từ nhánh chính trước khi code:

git checkout main
git pull origin main


Tạo nhánh riêng cho tính năng hoặc sửa lỗi:

git checkout -b feature/ten-tinh-nang
# hoặc: git checkout -b fix/ten-loi


Commit và đẩy lên GitHub:

git add .
git commit -m "feat: thêm tính năng gợi ý món ăn ngẫu nhiên"
git push origin feature/ten-tinh-nang


Tạo Pull Request (PR):

Mở PR trên GitHub để nhóm review code.

Khi được duyệt và vượt qua kiểm tra từ Vercel Preview, tiến hành merge vào main.

👨‍💻 Đội ngũ phát triển (Team PT-11)

Thành viên nhóm phát triển dự án môn học / thực hành Web PT-11.

Mọi đóng góp, báo lỗi vui lòng mở Issues hoặc gửi Pull Request trực tiếp.

Dự án được xây dựng với niềm đam mê ẩm thực và công nghệ!
