import { ProductItem, CouponDiscount } from '../types';

// Deprecated coupons for legacy references; affiliate model replaces in-app codes
export const POPULAR_COUPONS: CouponDiscount[] = [];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-noi-dat-kho-ca',
    productCode: 'SP-ND-BATTRANG-01',
    name: 'Nồi Đất Nung Bát Tràng Tráng Men Kho Cá Thịt (2.0L)',
    category: 'tools',
    platform: 'shopee',
    platformName: 'Shopee',
    affiliateUrl: 'https://shopee.vn/search?keyword=noi+dat+bat+trang+kho+ca',
    price: 145000,
    priceMax: 225000,
    originalPrice: 260000,
    discountPercent: 23,
    image: 'https://images.unsplash.com/photo-1584990347449-399042b47596?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584990347449-399042b47596?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 142,
    salesCount: 620,
    badge: 'Bán chạy nhất',
    brand: 'Gốm Sứ Bát Tràng',
    origin: 'Việt Nam',
    inStock: true,
    stockCount: 45,
    shortDescription: 'Giữ nhiệt cực lâu, kho cá và thịt kho tàu keo sánh, dậy mùi truyền thống.',
    description: 'Nồi đất nung cao cấp từ làng gốm Bát Tràng truyền thống. Được tráng men bóng chống dính tự nhiên, chịu sốc nhiệt tốt, dùng được trên bếp gas, bếp than, và bếp hồng ngoại. Món kho giữ được vị ngọt thanh đậm đà của nguyên liệu.',
    specifications: {
      'Dung tích': '2.0 Lít',
      'Chất liệu': 'Đất sét tinh luyện tráng men cao cấp',
      'Kích thước': 'Đường kính 22cm x Cao 11cm',
      'Loại bếp': 'Bếp gas, Bếp hồng ngoại, Lò nướng'
    },
    features: [
      'Khả năng giữ nhiệt sâu giúp thịt cá chín nhừ mềm tan',
      'Chống cháy xém đáy và giữ trọn hương vị nước mắm kho',
      'Quai cầm đúc liền chắc chắn, nắp đậy kín giữ hơi'
    ],
    options: ['Dung tích 1.5L', 'Dung tích 2.0L', 'Dung tích 2.8L'],
    relatedRecipeIds: ['recipe-1', 'recipe-3'],
    relatedTags: ['kho', 'man', 'mien-bac', 'mien-nam']
  },
  {
    id: 'prod-dao-bep-santoku',
    productCode: 'SP-DAO-SANTOKU-02',
    name: 'Dao Bếp Santoku Thép Nhật Cao Cấp VG-10 Vân Damascus (18cm)',
    category: 'tools',
    platform: 'lazada',
    platformName: 'Lazada',
    affiliateUrl: 'https://www.lazada.vn/catalog/?q=dao+santoku+nhat+ban',
    price: 490000,
    priceMax: 590000,
    originalPrice: 650000,
    discountPercent: 25,
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    reviewCount: 98,
    salesCount: 310,
    badge: 'Đầu bếp khuyên dùng',
    brand: 'Yoshihiro Craft',
    origin: 'Nhật Bản',
    inStock: true,
    stockCount: 28,
    shortDescription: 'Lưỡi thép siêu sắc bén, cắt thái thịt cá và rau củ mượt mà không dính.',
    description: 'Dao bếp đa năng Santoku lưỡi thép VG-10 đạt độ cứng 60±1 HRC, được tôi rèn 67 lớp thép Damascus tuyệt mỹ. Cán gỗ cẩm lai công thái học chống trượt, đầm tay, hỗ trợ thái thịt, lọc cá, băm tỏi ớt cực kỳ chuẩn xác.',
    specifications: {
      'Chiều dài lưỡi': '18cm (Tổng dài 31cm)',
      'Chất liệu lưỡi': 'Thép VG-10 Damascus 67 lớp',
      'Chất liệu cán': 'Gỗ Cẩm Lai Pakkawood chống nước',
      'Độ cứng': '60 - 62 HRC'
    },
    features: [
      'Góc mài lưỡi 15 độ siêu bén, thái mỏng như giấy',
      'Chống gỉ sét, kháng axit thực phẩm hoàn hảo',
      'Khắc laser hoa văn Damascus sang trọng'
    ],
    options: ['Lưỡi 18cm Cán Gỗ Đỏ', 'Lưỡi 21cm Chef Knife Cán Đen'],
    relatedRecipeIds: ['recipe-2', 'recipe-4'],
    relatedTags: ['quick', 'nuong', 'xao']
  },
  {
    id: 'prod-chao-gang-chong-dinh',
    productCode: 'SP-CHAO-LODGE-03',
    name: 'Chảo Gang Đúc Nguyên Khối Lodge 26cm Tôi Dầu Tự Nhiên',
    category: 'tools',
    platform: 'shopee',
    platformName: 'Shopee',
    affiliateUrl: 'https://shopee.vn/search?keyword=chao+gang+duc+lodge+26cm',
    price: 380000,
    priceMax: 650000,
    originalPrice: 720000,
    discountPercent: 19,
    image: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewCount: 86,
    salesCount: 450,
    badge: 'Chính hãng',
    brand: 'Lodge Cast Iron',
    origin: 'Mỹ',
    inStock: true,
    stockCount: 32,
    shortDescription: 'Truyền nhiệt đều, chiên xào xém cạnh thơm phức, áp chảo bò và cá giòn rụm.',
    description: 'Chảo gang đúc nguyên khối được tôi sẵn lớp dầu hạt lanh tự nhiên, hoàn toàn không chứa hóa chất PTFE/PFOA. Càng dùng càng chống dính tốt, chịu được nhiệt độ cao trên mọi loại bếp kể cả bếp từ và lò nướng.',
    specifications: {
      'Đường kính': '26cm (Đáy 21cm, Sâu 5cm)',
      'Chất liệu': 'Gang đúc nguyên khối Seasoned Cast Iron',
      'Trọng lượng': '2.3 kg',
      'Loại bếp': 'Bếp từ, Bếp gas, Hồng ngoại, Lò nướng, Than củi'
    },
    features: [
      'Tạo lớp crust giòn xém tuyệt hảo cho món chiên và áp chảo',
      'Bổ sung vi lượng sắt tự nhiên vào thức ăn',
      'Độ bền trọn đời truyền qua nhiều thế hệ'
    ],
    options: ['Size 20cm (1-2 người)', 'Size 26cm (Gia đình 3-5 người)', 'Size 30cm (Có quai phụ)'],
    relatedRecipeIds: ['recipe-2', 'recipe-5'],
    relatedTags: ['chien', 'xao', 'nuong']
  },
  {
    id: 'prod-set-gia-vi-pho-truyen-thong',
    productCode: 'SP-GV-PHOHANOI-04',
    name: 'Set Gia Vị Nấu Phở Bò / Gà Chuẩn Vị Hà Nội Xưa (Hộp 5 Gói)',
    category: 'spices',
    platform: 'tiki',
    platformName: 'Tiki',
    affiliateUrl: 'https://tiki.vn/search?q=set+gia+vi+pho+bo+truyen+thong',
    price: 95000,
    priceMax: 135000,
    originalPrice: 150000,
    discountPercent: 21,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 210,
    salesCount: 1280,
    badge: 'Gia vị chuẩn vị',
    brand: 'Ăn Gì Bếp Nhà',
    origin: 'Việt Nam (Hà Nội)',
    inStock: true,
    stockCount: 150,
    shortDescription: 'Gồm hoa hồi Lạng Sơn, quế Yên Bái, thảo quả, thảo mộc sao thơm kèm túi lọc cotton.',
    description: 'Hộp combo 5 set gia vị nấu nước dùng phở bò, phở gà đậm đà thanh trong. Nguyên liệu được tuyển chọn từ các vùng đặc sản Tây Bắc, rang sấy tự nhiên và đóng túi lọc tiện lợi không làm đục nước dùng.',
    specifications: {
      'Quy cách': 'Hộp 5 gói (mỗi gói nấu cho nồi 4-5 lít nước dùng)',
      'Thành phần': 'Hoa hồi, Quế chi, Thảo quả nướng, Tiểu hồi, Đinh hương, Hạt mùi già',
      'Hạn sử dụng': '12 tháng từ ngày sản xuất',
      'Bảo quản': 'Nơi khô ráo, thoáng mát'
    },
    features: [
      'Nước dùng thơm ngào ngạt mùi thảo mộc phở xưa',
      'Tặng kèm túi lọc vải cotton tự nhiên dễ vớt bã',
      'Tiết kiệm 80% thời gian chuẩn bị gia vị nước dùng'
    ],
    options: ['Hộp 5 Set Phở Bò', 'Hộp 5 Set Phở Gà Thảo Mộc', 'Combo 3 Phở Bò + 2 Bún Bò Huế'],
    relatedRecipeIds: ['recipe-4'],
    relatedTags: ['canh', 'pho', 'mien-bac', 'truyen-thong']
  },
  {
    id: 'prod-nuoc-mam-truyen-thong-phu-quoc',
    productCode: 'SP-NM-PHUQUOC-05',
    name: 'Nước Mắm Cốt Nhĩ Cá Cơm Than Phú Quốc 43 Độ Đạm (Chai Thủy Tinh 520ml)',
    category: 'spices',
    platform: 'shopee',
    platformName: 'Shopee',
    affiliateUrl: 'https://shopee.vn/search?keyword=nuoc+mam+phu+quoc+truyen+thong',
    price: 135000,
    priceMax: 250000,
    originalPrice: 280000,
    discountPercent: 15,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 5.0,
    reviewCount: 175,
    salesCount: 890,
    badge: 'Đặc sản 43 độ đạm',
    brand: 'Nước Mắm Cốt Nhĩ Phú Quốc',
    origin: 'Kiên Giang, Việt Nam',
    inStock: true,
    stockCount: 60,
    shortDescription: 'Ủ chượp thùng gỗ bời lời 18 tháng, màu cánh gián hổ phách, vị ngọt hậu sâu.',
    description: 'Nước mắm nhĩ truyền thống cốt đầu tiên từ 100% cá cơm than tươi đánh bắt tại vùng biển Phú Quốc ủ cùng muối hạt Bà Rịa. Không chất bảo quản, không mì chính phụ gia, dùng chấm sống thơm nức và nêm kho tạo màu cánh gián tự nhiên.',
    specifications: {
      'Dung tích': '520ml chai thủy tinh cao cấp',
      'Độ đạm': '43°N (Đạm tự nhiên từ cá cơm)',
      'Phương pháp': 'Ủ chượp gài nén thùng gỗ tự nhiên 18 tháng',
      'Thành phần': 'Cá cơm than 75%, Muối biển 25%'
    },
    features: [
      'Vị mặn đầu lưỡi, ngọt bùi hậu vị sâu lắng nơi cuống họng',
      'Màu nâu đỏ cánh gián sóng sánh tuyệt đẹp',
      'Chai thủy tinh nắp rót chống rớt giọt tiện lợi'
    ],
    options: ['Chai đơn 520ml', 'Combo 2 Chai Tặng Muỗng Gỗ'],
    relatedRecipeIds: ['recipe-1', 'recipe-3', 'recipe-5'],
    relatedTags: ['kho', 'man', 'nuoc-cham', 'truyen-thong']
  },
  {
    id: 'prod-noi-chien-khong-dau-dien-tu',
    productCode: 'SP-NC-LOCKCHEF-06',
    name: 'Nồi Chiên Không Dầu Điện Tử Dung Tích Lớn 6.5L Cửa Kính Trong Suốt',
    category: 'appliances',
    platform: 'tiktok',
    platformName: 'TikTok Shop',
    affiliateUrl: 'https://www.tiktok.com/tag/noichienkhongdau',
    price: 1250000,
    originalPrice: 1690000,
    discountPercent: 26,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewCount: 64,
    salesCount: 180,
    badge: 'Ưu đãi sàn 26%',
    brand: 'Lock&Chef Smart',
    origin: 'Hàn Quốc',
    inStock: true,
    stockCount: 15,
    shortDescription: 'Công nghệ đốt nhiệt Rapid Air 360°, giảm 85% dầu mỡ, cửa kính nhìn xuyên.',
    description: 'Nồi chiên không dầu thế hệ mới màn hình cảm ứng LED một chạm với 12 chế độ cài sẵn cho món Việt (nướng gà nguyên con, sườn xào, khoai tây chiên, nướng cá, sấy hoa quả). Khoang nướng inox 304 kèm đèn chiếu sáng bên trong.',
    specifications: {
      'Dung tích': '6.5 Lít (Nướng vừa gà nguyên con 2.2kg)',
      'Công suất': '1800W nhiệt nhanh',
      'Khoảng nhiệt': '40°C - 200°C',
      'Chất liệu lồng': 'Hợp kim nhôm phủ Ceramic chống dính y tế'
    },
    features: [
      'Cửa sổ kính chịu nhiệt + Đèn halogen xem trực tiếp quá trình thức ăn chín',
      'Khay nướng có thể tháo rời và rửa an toàn trong máy rửa bát',
      'Tự ngắt khi kéo lòng nồi và chống quá nhiệt an toàn'
    ],
    options: ['Màu Đen Nhám Platinum', 'Màu Trắng Kem Vintage'],
    relatedRecipeIds: ['recipe-2', 'recipe-5'],
    relatedTags: ['nuong', 'chien', 'quick']
  },
  {
    id: 'prod-combo-gia-vi-tay-bac',
    productCode: 'SP-GV-TAYBAC-07',
    name: 'Combo Gia Vị Đặc Sản Tây Bắc: Hạt Dổi Rừng + Mắc Khén Sấy Thơm (Hũ 100g)',
    category: 'spices',
    platform: 'shopee',
    platformName: 'Shopee',
    affiliateUrl: 'https://shopee.vn/search?keyword=hat+doi+mac+khen+tay+bac',
    price: 145000,
    priceMax: 210000,
    originalPrice: 240000,
    discountPercent: 24,
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 112,
    salesCount: 540,
    badge: 'Đặc sản Tây Bắc',
    brand: 'Đặc Sản Hoàng Liên',
    origin: 'Điện Biên, Việt Nam',
    inStock: true,
    stockCount: 75,
    shortDescription: 'Hạt dổi nếp rừng thơm lừng cùng mắc khén tạo nên hương vị ướp thịt nướng trứ danh.',
    description: 'Bộ đôi gia vị "linh hồn" của ẩm thực Tây Bắc. Hạt dổi rừng nếp hạt tròn mẩy, nướng trên than hồng thơm nức mũi; mắc khén sao giòn xay nhuyễn tạo vị the tê dịu dàng khó quên cho món thịt nướng, chẩm chéo, sườn xào.',
    specifications: {
      'Quy cách': 'Set gồm 1 hũ Hạt Dổi nếp (50g) + 1 hũ Mắc Khén xay sẵn (100g)',
      'Xuất xứ': 'Rừng tự nhiên Mường Tè & Điện Biên',
      'Hạn sử dụng': '18 tháng'
    },
    features: [
      'Gia vị tuyệt phẩm để ướp thịt xiên nướng, gà nướng, cá nướng Pa Pỉnh Tộp',
      'Dùng làm gia vị chấm Chẩm chéo chuẩn Tây Bắc',
      'Đóng hũ thủy tinh kín nắp bảo toàn tinh dầu thơm'
    ],
    options: ['Combo Tiêu chuẩn (2 Hũ)', 'Combo Đại tiệc (Kèm Muối Chẩm Chéo)'],
    relatedRecipeIds: ['recipe-2', 'recipe-5'],
    relatedTags: ['nuong', 'tay-bac', 'dac-san']
  },
  {
    id: 'prod-thot-go-nghien-tay-bac',
    productCode: 'SP-THOT-NGHIEN-08',
    name: 'Thớt Gỗ Nghiến Tự Nhiên Tây Bắc Siêu Bền Chống Mùn Mốc (30cm x 5cm)',
    category: 'tools',
    platform: 'lazada',
    platformName: 'Lazada',
    affiliateUrl: 'https://www.lazada.vn/catalog/?q=thot+go+nghien+tay+bac',
    price: 285000,
    priceMax: 395000,
    originalPrice: 450000,
    discountPercent: 18,
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 78,
    salesCount: 390,
    badge: 'Gỗ nguyên khối',
    brand: 'Mộc Tây Bắc',
    origin: 'Hà Giang, Việt Nam',
    inStock: true,
    stockCount: 40,
    shortDescription: 'Gỗ nghiến đanh cứng như đá, băm chặt gà vịt không ra mùn, có tai treo inox tiện lợi.',
    description: 'Thớt tròn gỗ nghiến lõi tự nhiên già tuổi vùng núi cao Hà Giang. Thớ gỗ mịn, đanh chắc, không xước dăm mùn khi chặt xương, đã được sấy và xử lý chống mốc bằng dầu khoáng thực phẩm an toàn tuyệt đối.',
    specifications: {
      'Kích thước': 'Đường kính 30cm, Độ dày 5cm',
      'Chất liệu': 'Gỗ nghiến lõi tự nhiên 100%',
      'Trọng lượng': 'Khoảng 3.2 kg',
      'Phụ kiện': 'Quai treo inox 304'
    },
    features: [
      'Bền bỉ vĩnh cửu, chịu lực băm chặt cực mạnh',
      'Kháng khuẩn và không tạo mùi tanh sau khi vệ sinh',
      'Vân gỗ tròn đồng tâm tự nhiên độc bản'
    ],
    options: ['Đường kính 28cm (Dày 4.5cm)', 'Đường kính 30cm (Dày 5cm)', 'Đường kính 35cm (Dày 6cm)'],
    relatedRecipeIds: ['recipe-1', 'recipe-2', 'recipe-4'],
    relatedTags: ['tools', 'so-che']
  },
  {
    id: 'prod-can-dien-tu-nha-bep',
    productCode: 'SP-CAN-DIENTU-09',
    name: 'Cân Điện Tử Nhà Bếp Đo Độ Chính Xác 0.1g Mặt Kính Cường Lực',
    category: 'appliances',
    platform: 'shopee',
    platformName: 'Shopee',
    affiliateUrl: 'https://shopee.vn/search?keyword=can+dien+tu+nha+bep+0.1g',
    price: 165000,
    originalPrice: 220000,
    discountPercent: 25,
    image: 'https://images.unsplash.com/photo-1584990347449-399042b47596?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584990347449-399042b47596?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewCount: 156,
    salesCount: 720,
    badge: 'Bán chạy',
    brand: 'ChefScale Pro',
    origin: 'Việt Nam',
    inStock: true,
    stockCount: 85,
    shortDescription: 'Cân định lượng gia vị, bột mì, calo ăn kiêng chuẩn xác đến 0.1g, chức năng trừ bì Tare.',
    description: 'Trợ thủ đắc lực giúp bạn nấu các công thức chuẩn chỉ từng gram gia vị. Màn hình LCD nền xanh rõ nét, cảm ứng nhạy, chuyển đổi linh hoạt giữa g, ml, oz, lb và sạc pin USB tiện dụng.',
    specifications: {
      'Tải trọng': 'Tối đa 5kg, Độ chia nhỏ nhất 0.1g',
      'Màn hình': 'LCD đèn nền hiển thị rõ',
      'Nguồn': 'Pin sạc Lithium Type-C tiện lợi',
      'Chất liệu mặt': 'Kính cường lực / Inox 304 xước mờ'
    },
    features: [
      'Tính năng trừ bì TARE thông minh không cần nhấc bát đĩa',
      'Hỗ trợ đong định lượng làm bánh và nấu ăn chuẩn công thức',
      'Tự động tắt nguồn sau 2 phút không dùng tiết kiệm pin'
    ],
    options: ['Mặt Inox Bạc Xước', 'Mặt Kính Cường Lực Đen'],
    relatedRecipeIds: ['recipe-1', 'recipe-3', 'recipe-4', 'recipe-5'],
    relatedTags: ['tools', 'baking', 'healthy']
  },
  {
    id: 'prod-set-meal-kit-canh-chua',
    productCode: 'SP-MK-CANHCHUA-10',
    name: 'Set Meal-Kit: Nguyên Liệu Canh Chua Cá Lóc Nam Bộ (Cho 4 Người)',
    category: 'meal_kits',
    platform: 'tiki',
    platformName: 'Tiki',
    affiliateUrl: 'https://tiki.vn/search?q=set+nguyen+lieu+canh+chua',
    price: 155000,
    priceMax: 195000,
    originalPrice: 220000,
    discountPercent: 16,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 89,
    salesCount: 420,
    badge: 'Set nấu 15 phút',
    brand: 'Ăn Gì Fresh Kit',
    origin: 'Việt Nam',
    inStock: true,
    stockCount: 25,
    shortDescription: 'Cá lóc tươi làm sạch cắt khúc + Bạc hà, đậu bắp, dứa, cà chua, me vắt + Nước cốt súp chuẩn vị.',
    description: 'Set sơ chế sẵn tươi ngon chuẩn bị bữa ăn trong 15 phút. Cá lóc đồng phi lê tươi rói được ướp nhẹ, rau củ rửa sạch hút chân không kèm gói xốt cốt me chua ngọt hài hòa hương vị Nam Bộ.',
    specifications: {
      'Khẩu phần': '3 - 4 người ăn',
      'Bảo quản': 'Ngăn mát tủ lạnh 2-3 ngày hoặc ngăn đá 1 tháng',
      'Thời gian nấu': '10 - 15 phút'
    },
    features: [
      'Nguyên liệu tươi sạch 100% đạt chuẩn VietGAP',
      'Kèm tờ hướng dẫn nấu 3 bước bất bại',
      'Không tốn công đi chợ, sơ chế hay nêm nếm phức tạp'
    ],
    options: ['Set Cá Lóc Đồng', 'Set Cá Hồi Tươi'],
    relatedRecipeIds: ['recipe-3'],
    relatedTags: ['canh', 'mien-nam', 'quick', 'fresh']
  }
];
