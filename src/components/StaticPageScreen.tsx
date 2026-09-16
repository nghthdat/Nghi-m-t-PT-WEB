import React from 'react';
import { Shield, FileText, HelpCircle, Info, Mail, MapPin, Phone, MessageSquare } from 'lucide-react';

interface StaticPageScreenProps {
  pageType: 'about' | 'privacy' | 'terms' | 'faq' | 'contact';
}

export const StaticPageScreen: React.FC<StaticPageScreenProps> = ({ pageType }) => {
  const renderContent = () => {
    switch (pageType) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#F7F2EE] pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-[#2B2118]">Về chúng tôi</h2>
            </div>
            <div className="prose prose-stone max-w-none text-[#4A3A2C]">
              <p>Chào mừng bạn đến với <strong>Ăn Gì Hôm Nay</strong> - cộng đồng chia sẻ công thức nấu ăn và đam mê ẩm thực hàng đầu tại Việt Nam.</p>
              <p>Chúng tôi được thành lập với sứ mệnh kết nối những người yêu bếp, giúp mọi người có thể dễ dàng tìm kiếm, học hỏi và sáng tạo những bữa ăn ngon miệng, dinh dưỡng cho gia đình và người thân mỗi ngày.</p>
              <h3>Tầm nhìn & Sứ mệnh</h3>
              <p>Trở thành nền tảng số 1 Việt Nam về ẩm thực số, nơi mọi công thức, mẹo vặt nhà bếp đều được chia sẻ một cách trực quan, rõ ràng và truyền cảm hứng.</p>
              <h3>Giá trị cốt lõi</h3>
              <ul>
                <li><strong>Cộng đồng:</strong> Mọi thành viên đều có thể đóng góp và học hỏi lẫn nhau.</li>
                <li><strong>Chất lượng:</strong> Các công thức được kiểm duyệt kỹ càng, đảm bảo thành công khi thực hành.</li>
                <li><strong>Sáng tạo:</strong> Không ngừng cập nhật các xu hướng ẩm thực mới và gợi ý thông minh từ AI.</li>
              </ul>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#F7F2EE] pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-[#2B2118]">Chính sách bảo mật</h2>
            </div>
            <div className="prose prose-stone max-w-none text-[#4A3A2C]">
              <p>Cập nhật lần cuối: 15/09/2026</p>
              <h3>1. Thu thập thông tin</h3>
              <p>Chúng tôi chỉ thu thập các thông tin cần thiết nhằm cải thiện trải nghiệm người dùng, bao gồm: thông tin tài khoản (email, tên), dữ liệu sử dụng công thức và các tương tác trong cộng đồng.</p>
              <h3>2. Sử dụng thông tin</h3>
              <p>Thông tin của bạn được sử dụng để cá nhân hóa gợi ý món ăn, gửi thông báo cập nhật, và bảo vệ tài khoản khỏi các hoạt động gian lận.</p>
              <h3>3. Bảo vệ dữ liệu</h3>
              <p>Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ dữ liệu cá nhân của bạn. Không bán hoặc chia sẻ thông tin cho bên thứ 3 vì mục đích thương mại mà không có sự đồng ý của bạn.</p>
              <h3>4. Quyền của người dùng</h3>
              <p>Bạn có quyền yêu cầu truy xuất, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình bất kỳ lúc nào thông qua phần Cài đặt tài khoản hoặc liên hệ với chúng tôi.</p>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#F7F2EE] pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-[#2B2118]">Điều khoản sử dụng</h2>
            </div>
            <div className="prose prose-stone max-w-none text-[#4A3A2C]">
              <p>Bằng việc truy cập và sử dụng website <strong>Ăn Gì Hôm Nay</strong>, bạn đồng ý với các điều khoản sau:</p>
              <h3>1. Tài khoản người dùng</h3>
              <p>Bạn có trách nhiệm bảo mật thông tin đăng nhập của mình. Bất kỳ hành động nào từ tài khoản của bạn sẽ được xem là do bạn thực hiện.</p>
              <h3>2. Bản quyền nội dung</h3>
              <p>Bạn giữ bản quyền đối với các công thức và hình ảnh do bạn đăng tải. Tuy nhiên, bằng việc đăng tải, bạn cấp cho chúng tôi quyền sử dụng, phân phối và hiển thị nội dung đó trên nền tảng của chúng tôi.</p>
              <h3>3. Tiêu chuẩn cộng đồng</h3>
              <p>Không đăng tải các nội dung độc hại, vi phạm pháp luật, ngôn từ thù địch, hoặc spam. Chúng tôi có quyền gỡ bỏ các nội dung vi phạm mà không cần báo trước.</p>
              <h3>4. Từ chối trách nhiệm</h3>
              <p>Các công thức nấu ăn mang tính tham khảo. Chúng tôi không chịu trách nhiệm về các vấn đề sức khỏe, dị ứng hoặc thiệt hại phát sinh từ việc thực hành theo công thức.</p>
            </div>
          </div>
        );
      case 'faq':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#F7F2EE] pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-[#2B2118]">Giải đáp thường gặp (FAQ)</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-[#FAF5F0] p-4 rounded-xl">
                <h3 className="font-bold text-[#2B2118] mb-2 text-lg">Làm sao để đăng công thức mới?</h3>
                <p className="text-sm text-[#4A3A2C]">Bạn có thể nhấn vào nút "Viết công thức" hoặc mục "Đăng công thức" ở menu, sau đó điền đầy đủ các thông tin yêu cầu và nhấn nút Lưu. Bài của bạn sẽ được AI và ban quản trị kiểm duyệt trước khi xuất bản.</p>
              </div>
              <div className="bg-[#FAF5F0] p-4 rounded-xl">
                <h3 className="font-bold text-[#2B2118] mb-2 text-lg">Tính năng gợi ý món ăn AI hoạt động thế nào?</h3>
                <p className="text-sm text-[#4A3A2C]">Bạn chỉ cần nhập các nguyên liệu đang có sẵn trong tủ lạnh vào mục Gợi ý AI, hệ thống sẽ phân tích và đề xuất các món ăn phù hợp nhất, kèm theo danh sách những nguyên liệu còn thiếu cần mua thêm.</p>
              </div>
              <div className="bg-[#FAF5F0] p-4 rounded-xl">
                <h3 className="font-bold text-[#2B2118] mb-2 text-lg">Tôi có thể lưu lại công thức yêu thích không?</h3>
                <p className="text-sm text-[#4A3A2C]">Có. Bạn chỉ cần nhấn vào biểu tượng Trái tim trên mỗi thẻ công thức. Công thức sẽ được lưu vào mục "Đã lưu" trong Hồ sơ cá nhân của bạn.</p>
              </div>
              <div className="bg-[#FAF5F0] p-4 rounded-xl">
                <h3 className="font-bold text-[#2B2118] mb-2 text-lg">Làm sao để mua dụng cụ nấu ăn?</h3>
                <p className="text-sm text-[#4A3A2C]">Bạn có thể truy cập mục Cửa hàng hoặc xem các dụng cụ được gợi ý trong từng công thức. Nhấn "Mua trên Shopee/Lazada" để được chuyển đến sàn TMĐT chính hãng.</p>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#F7F2EE] pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-[#2B2118]">Liên hệ với chúng tôi</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <p className="text-[#4A3A2C]">Nếu bạn có bất kỳ câu hỏi, góp ý hay yêu cầu hợp tác nào, đừng ngần ngại liên hệ với chúng tôi. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24h làm việc.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-[#FAF5F0] p-4 rounded-xl">
                    <Mail className="w-5 h-5 text-[#a33e07]" />
                    <div>
                      <p className="text-xs text-[#8C7D6F]">Email hỗ trợ</p>
                      <p className="font-bold text-[#2B2118]">hotro@angihomnay.vn</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#FAF5F0] p-4 rounded-xl">
                    <Phone className="w-5 h-5 text-[#a33e07]" />
                    <div>
                      <p className="text-xs text-[#8C7D6F]">Hotline (8:00 - 18:00)</p>
                      <p className="font-bold text-[#2B2118]">1900 1234</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#FAF5F0] p-4 rounded-xl">
                    <MapPin className="w-5 h-5 text-[#a33e07]" />
                    <div>
                      <p className="text-xs text-[#8C7D6F]">Văn phòng</p>
                      <p className="font-bold text-[#2B2118]">Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP.HCM</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 border border-[#EAE0D5] rounded-2xl shadow-sm">
                <h3 className="font-bold text-[#2B2118] mb-4">Gửi tin nhắn</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Tin nhắn của bạn đã được gửi. Cảm ơn bạn!"); }}>
                  <div>
                    <label className="block text-xs font-bold text-[#2B2118] mb-1">Họ tên</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#FAF5F0] border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#a33e07] focus:ring-1 focus:ring-[#a33e07]" placeholder="Nhập tên của bạn" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2B2118] mb-1">Email</label>
                    <input type="email" className="w-full px-3 py-2 bg-[#FAF5F0] border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#a33e07] focus:ring-1 focus:ring-[#a33e07]" placeholder="Nhập email của bạn" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2B2118] mb-1">Nội dung</label>
                    <textarea rows={4} className="w-full px-3 py-2 bg-[#FAF5F0] border border-[#EAE0D5] rounded-lg focus:outline-none focus:border-[#a33e07] focus:ring-1 focus:ring-[#a33e07]" placeholder="Nhập nội dung cần hỗ trợ..." required></textarea>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#a33e07] hover:bg-[#8c3405] text-white font-bold rounded-xl transition-colors">
                    Gửi tin nhắn
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE0D5] shadow-xs">
        {renderContent()}
      </div>
    </div>
  );
};
