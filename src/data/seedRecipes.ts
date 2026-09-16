import { Recipe, PendingRecipe } from '../types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'pho-bo-gia-truyen',
    title: 'Phở Bò Gia Truyền',
    description: 'Món phở truyền thống đậm đà, thơm lừng hương thảo mộc, nấu tại nhà ngon như ngoài hàng.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4NBh3NNhtOti_SFH9N3XAJSdSCyx4t3HryLWxnN6Fp-2AvaMlCQpr8cJP8CurSgQO53qXnp4YtKERurYtlzJF-og-HPEzuzKNbwPrL6RHhmjIAPW3HoelRj4BDESY5OHwA_lS4cd1smP6vaGfYKbvAuQM_8pS-eFGypCyOmoXIBvVvRWHqlE4RMVPIKT_MQMlw9ZsteKy0C3Tqe1dHMsrQU64VYWuoFnXA0_sgE_ZIxAlFJ_Oj90jGA',
    prepTime: '3 Giờ',
    servings: '4 Người',
    difficulty: 'Trung bình',
    calories: 450,
    nutrition: {
      protein: 35,
      fat: 12,
      carbs: 48,
      calories: 450
    },
    categories: ['man', 'mien-bac', 'Đồ mặn', 'Miền Bắc', 'Tất cả'],
    ingredients: [
      { name: 'Xương ống bò', amount: '1 kg' },
      { name: 'Thịt bò bắp (hoặc nạm)', amount: '500g' },
      { name: 'Thịt bò phi lê (để tái)', amount: '300g' },
      { name: 'Bánh phở tươi', amount: '1 kg' },
      { name: 'Hành tây, gừng', amount: '2 củ' },
      { name: 'Hành lá, rau mùi, húng quế', amount: '1 bó' }
    ],
    spiceIngredients: [
      { name: 'Quế, hồi, thảo quả, đinh hương', amount: '1 gói' },
      { name: 'Nước mắm ngon, muối, đường phèn', amount: 'Vừa đủ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Sơ chế và ninh xương',
        description: 'Rửa sạch xương ống, chần qua nước sôi 5 phút với chút muối để khử mùi. Đổ nước đầu đi, rửa lại xương. Cho xương vào nồi lớn ngập nước, đun sôi rồi hạ lửa nhỏ, hớt bọt thường xuyên để nước dùng được trong. Ninh xương trong khoảng 3 tiếng.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxZMMhMXrb-vl3DjhNKlqEEFtMu_y9BQhGSCQ8061ADSnWkOYybLi_bQuWWTBZK9ELJ6JqUOfV1fmL7OeSOle-qZqpalh5h76cFFCFERPr1rV5Z082agH3eJjBQXTxPUIfadteLjaJeeh1DWrPrQ1ckBFKbqIrVi9GBQEGFOub-1Q-2_7_LhwZ4lIrnQERQGqnN3HsdUPyUNLnprwj9jR14EwdVnKKWVKLI4QVdNDxOwc9yucXa4-9NQ'
      },
      {
        step: 2,
        title: 'Nướng gia vị',
        description: 'Nướng gừng, hành tây (để nguyên vỏ) cho cháy xém bên ngoài, sau đó bóc vỏ, rửa sạch xâu đen. Rang sơ quế, hồi, thảo quả cho dậy mùi thơm. Cho tất cả vào túi lọc bọc kín rồi thả vào nồi nước dùng.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCyBKk6seTB3w5QeJr2dZuJ9_0_nhz2AcOxvzDUw3xnbaXS9mNC9hrdRdjibK1rbsm38ofDuGCo-Ypxd3vVLKkWM6GJr7q4GuLI7wzWWpWfPS_Ex2kp_usd4dKxdTJWRddPY96QoUXBQZh6MvwiQjTZVED68fdQ8WTrrK_eJ_xXJ7lcDVyIEHfAFQOnB6AQOuqE_CiGItmITx6rDb5c0jdo7qcPdVOHvC5uqAiY4Gh-M66jZsr-kcKrQ'
      },
      {
        step: 3,
        title: 'Hoàn thiện nước dùng',
        description: 'Luộc thịt bắp bò chung với nồi nước dùng đến khi chín mềm thì vớt ra, ngâm vào nước lạnh cho giòn, sau đó thái lát mỏng. Nêm nếm nước dùng với muối, nước mắm, xíu đường phèn cho vừa khẩu vị.'
      },
      {
        step: 4,
        title: 'Trình bày và thưởng thức',
        description: 'Chần bánh phở qua nước sôi, cho vào tô. Xếp thịt chín thái mỏng, thịt tái băm nhỏ lên trên. Thêm hành lá, rau mùi thái nhỏ. Chan nước dùng thật sôi ngập mặt bánh phở. Ăn kèm chanh, ớt, rau thơm.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYDEZNVg9f1p6UNel778csFr6JmmYdcT9zAn7KRsrOp9n6zBpaTHPs-QJqbh9YoPMOcdmklBZcX2_klodFoE6in56pxFWpNIQFvIHkjWMm_EI_CUtT_7L1s5AMf9BaNG3DzlW8c4VeNWbmCVrRDVJO0lGjeyQBfFxwSIwH4lYQCD-Eu5QydtG3OIHsUvqcj10HLgB16dOjqtZcU71_Gg7F3Jji_gwV6NQi3_-QwyEayAs7GlHUYG61MQ'
      }
    ],
    rating: 4.9,
    reviewCount: 120,
    author: {
      name: 'Minh Châu',
      avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1WUGRKwJt61yJxD-Dlmzsu7TDTJj4LVw04i1duXEQ7azBuRk4ENCUrQD9Ml9nQ-3Vtf3Z61UHhqmhaf8H1v7wAqWFmti_VF1aaYM841DJ7I3uKBTi-lubE9IFGPpsVZ2YP5du2bmEs7F4eY-SbjMnU2Py4vVfHhTbmVeRhXRE15wfg0227_MspzRNa45vZsCTqyVUqWLNy5TMbJJDKufkbTIfa9VVlGLQTWK--u7Ph-UTEE57r6uQzhrhVz',
      badge: 'Đầu bếp năng nổ'
    },
    isSaved: true,
    createdAt: '2026-08-10'
  },
  {
    id: 'thit-kho-to',
    title: 'Thịt kho tộ đậm đà hao cơm',
    description: 'Thịt ba chỉ kho tộ thơm lừng tiêu ớt, nước sốt sánh mịn đậm đà hương vị mặn ngọt truyền thống.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuPEDtuDvCbA_pc8r3LSuXPP0RBI8oR9aaBZzdTxHe_T_tglPb8oq4ZtebWysoaINtRo8VvWYlFMHr3HKKQ9Op37-NLZ28aybVi83ndchl_MbKSSBJJNEPK8zBVKnlw6ivrqCZEjadoiKXzbrpE48BN_vtBfqpxb9olumeqArPkz16oacxFdsEOWkXon-clGPHp30lBEyKLc0RqbkUWB7p19dxJLkpcnRCjndrqtSq-_V4nbtNGY7D9w',
    prepTime: '45 Phút',
    servings: '4 Người',
    difficulty: 'Dễ',
    calories: 450,
    nutrition: {
      protein: 28,
      fat: 32,
      carbs: 15,
      calories: 450
    },
    categories: ['man', 'mien-nam', 'Đồ mặn', 'Miền Nam', 'Tất cả'],
    ingredients: [
      { name: 'Thịt ba chỉ heo', amount: '500g' },
      { name: 'Trứng cút (hoặc trứng gà)', amount: '6 quả' },
      { name: 'Nước mắm ngon', amount: '3 thìa canh' },
      { name: 'Đường phèn / Đường thốt nốt', amount: '2 thìa canh' },
      { name: 'Hành khô, tỏi, ớt', amount: 'Vừa đủ' },
      { name: 'Nước dừa tươi', amount: '300ml' }
    ],
    steps: [
      {
        step: 1,
        title: 'Sơ chế thịt',
        description: 'Thịt ba chỉ cạo sạch bì, rửa muối, chần qua nước sôi 2 phút rồi vớt ra cắt khối vuông 3cm.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoVTo9hHRMxGLqCJAhrIHIlvmuYPf2oBQzIjjdXVljZt8-pjKBPwWJkHHBLa4aX3669ughq_0WwWbeHSIhbzGVlVl02bx5O3yisieyy4HsPbbFnWAmzTTmZtSa0AJxOIgE4wkUB-ALuC44LUH4asT7yNzS9e-nkrITnnlrC_qWJ3V8CIUpSiJlS1P7DOP_iDGbTQpHNXBqBvPF_S4npQVl4IrMWgGS50_5MS9Ny13WdAJClCKXl47k1w'
      },
      {
        step: 2,
        title: 'Ướp và thắng nước màu',
        description: 'Ướp thịt cùng hành tỏi băm, tiêu, 2 muỗng nước mắm, 1 muỗng hạt nêm. Thắng 2 muỗng đường đến khi ngả màu cánh gián thì cho thịt vào đảo săn.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzrBRgzol2awTVIKttpU_2HwgjysOKq4KDtqSkL66ExNur6wYRQ27d_GOXSy1JwovsqEQPlk0QXRcFST0763Gxikbj77bctBYjBjN4KM1UIXcta5RHmq_veZp6Sec2rAlaYvamZ9eOb0igiX1oMtwo7xJIHviREQhEfZG2TImtnYOdxlX0U0wZIPWjbsXkam5h4MOat-a8kkv-Wd2y_laLhxtFpoj2YlP7S28cQzRsp1kHzJfm4MZrwQ'
      },
      {
        step: 3,
        title: 'Kho thịt liu riu',
        description: 'Đổ nước dừa tươi vào nồi tộ đất ngập mặt thịt. Đun sôi rồi hạ lửa riu riu kho 35 phút cho thịt mềm ngậy, nước sốt keo đặc lại.'
      }
    ],
    rating: 4.9,
    reviewCount: 120,
    author: {
      name: 'Minh Châu',
      badge: 'Đầu bếp năng nổ'
    },
    isSaved: true,
    createdAt: '2026-08-12'
  },
  {
    id: 'canh-ca-chua-trung',
    title: 'Canh Cà Chua Trứng (Egg Drop Soup)',
    description: 'Món canh thanh mát, dễ nấu trong 15 phút, giải nhiệt mùa hè cực kỳ ngon miệng.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHFMXMjQsaZLp1cYSb-pRGFUXLa3_s55gb5bgNuAzxC6l7J4uvV7b0FDSPl3aGGSRYkYSkHtgWr35IpWWa3p3bnUnnimhCEwmZsNQVlPIgOmXZXNvf8zXVApywpiNsf4vzB1J_zNMMY-GuW1GapJzykbpJpoWIquZtSB4Lb50VqRnQsAjgWQM-EmCeCa1w0dAuwQzXyY8p5M3FOrGoAUTi_qt4bd_W-nKkO_xLY-i3tB0M-FYmbJXyfw',
    prepTime: '15 Phút',
    servings: '3-4 Người',
    difficulty: 'Rất dễ',
    calories: 120,
    nutrition: {
      protein: 8,
      fat: 5,
      carbs: 10,
      calories: 120
    },
    categories: ['quick', 'Dưới 15 phút', 'Ít calo', 'Tất cả'],
    ingredients: [
      { name: 'Cà chua', amount: '2 quả' },
      { name: 'Trứng gà', amount: '2 quả' },
      { name: 'Hành lá, ngò rí', amount: '1 nắm' },
      { name: 'Hành khô', amount: '1 củ' },
      { name: 'Gia vị: Muối, hạt nêm, dầu ăn', amount: 'Vừa đủ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Sơ chế nguyên liệu',
        description: 'Cà chua rửa sạch bổ múi cau. Hành tím băm nhỏ. Trứng đập ra bát đánh tan. Hành lá thái nhỏ.'
      },
      {
        step: 2,
        title: 'Xào cà chua tạo màu',
        description: 'Phi thơm hành tím với 1 thìa dầu ăn, cho cà chua vào đảo mềm với chút muối để ra màu đỏ đẹp mắt.'
      },
      {
        step: 3,
        title: 'Nấu canh và tạo vân trứng',
        description: 'Thêm 600ml nước đun sôi. Hạ lửa nhỏ, rót từ từ bát trứng vào đồng thời khuấy nhẹ một chiều để tạo vân hoa trứng bồng bềnh. Rắc hành lá và tắt bếp.'
      }
    ],
    rating: 4.8,
    reviewCount: 95,
    author: {
      name: 'Minh Châu'
    },
    isSaved: false,
    createdAt: '2026-08-14'
  },
  {
    id: 'trung-sot-ca-chua',
    title: 'Trứng Sốt Cà Chua (Scrambled Eggs with Tomato)',
    description: 'Trứng xốp mềm kết hợp cùng sốt cà chua chua ngọt mọng nước, ăn kèm cơm nóng vô cùng cuốn hút.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGtJzPJLYbNTm246zKP14Bvy-WUpCd0DWhLl9ZKWw4q6CjRrtuYfbSWzoiiwKZ9A4yhaNxRQVy9iAgmMrHfzf9Qps_2_mkejBPkkJhle1lA8nFin-WxkEkdb-klCjOfB2yeJbSplNNEA4GgUZNzv_LJCg89b0wAdDpcZvfkj5COVxi8-Fx0cl_JoSW9nvfnz-xNAJv7nQDEVSlHw76pP925W-HtSUA_QeW1G33qkAKp3wn9AlOXIcpMw',
    prepTime: '10 Phút',
    servings: '2 Người',
    difficulty: 'Rất dễ',
    calories: 180,
    nutrition: {
      protein: 12,
      fat: 11,
      carbs: 9,
      calories: 180
    },
    categories: ['quick', 'Dưới 15 phút', 'Đồ mặn', 'Tất cả'],
    ingredients: [
      { name: 'Trứng gà', amount: '3 quả' },
      { name: 'Cà chua chín', amount: '2 quả' },
      { name: 'Hành lá', amount: '2 nhánh' },
      { name: 'Dầu hào (tùy chọn)', amount: '1 thìa cafe' },
      { name: 'Nước mắm, đường, tiêu', amount: 'Vừa đủ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Chiên trứng xốp',
        description: 'Đánh đều trứng với xíu nước mắm. Làm nóng chảo, cho trứng vào đảo vừa chín tới (khoảng 80%) rồi trút ra đĩa.'
      },
      {
        step: 2,
        title: 'Nấu sốt cà chua',
        description: 'Cắt nhỏ cà chua, xào trên chảo với 1 thìa đường, xíu dầu hào đến khi cà chua nhuyễn mềm thành sốt sệt.'
      },
      {
        step: 3,
        title: 'Hòa quyện',
        description: 'Trút trứng vào đảo nhẹ tay cùng sốt cà chua trong 1 phút, rắc hành lá và tiêu thơm rồi tắt bếp.'
      }
    ],
    rating: 4.9,
    reviewCount: 142,
    author: {
      name: 'Minh Châu'
    },
    isSaved: false,
    createdAt: '2026-08-15'
  },
  {
    id: 'com-rang-trung-ca-chua',
    title: 'Cơm Rang Trứng Cà Chua',
    description: 'Tận dụng cơm nguội có sẵn trong tủ lạnh để tạo nên món cơm rang hạt vàng tơi thơm phức, điểm xuyết cà chua tươi.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj8HH-aw4aX9yJE6oK5dyOQlheN6CYAZ6w9G3HoEq3f7LuiR-NEpifYS0LYQYPzyaD6aC22pJmjRPklWtRk5vCsQQIF_A_HKuSVuMY4Hj4gSsdxXMPd8rtRtY_5lcxtdyrAK6r9EYSaUJr9NJHZl2hySmvv_T0CzEUAZZkyO2F6aS_3v2XNnR80D8H_BDvCh5R4ef9z5h06pmgGyqbMwrx3AZ0Rv3WNtmYaGUUcFButLZWLIboZ0AUeg',
    prepTime: '20 Phút',
    servings: '2 Người',
    difficulty: 'Trung bình',
    calories: 350,
    nutrition: {
      protein: 14,
      fat: 10,
      carbs: 52,
      calories: 350
    },
    categories: ['man', 'Đồ mặn', 'Tất cả'],
    ingredients: [
      { name: 'Cơm nguội', amount: '2 chén' },
      { name: 'Trứng gà', amount: '2 quả' },
      { name: 'Cà chua', amount: '1 quả' },
      { name: 'Hành lá, tỏi', amount: 'Vừa đủ' },
      { name: 'Nước tương, tiêu, dầu ăn', amount: 'Vừa đủ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Trộn cơm với lòng đỏ',
        description: 'Trộn 1 lòng đỏ trứng vào cơm nguội bóp đều để hạt cơm tơi xốp và có màu vàng óng đẹp.'
      },
      {
        step: 2,
        title: 'Rang cơm lửa lớn',
        description: 'Phi thơm tỏi, cho cơm vào rang đều tay trên lửa lớn đến khi hạt cơm săn lại và thơm.'
      },
      {
        step: 3,
        title: 'Thêm trứng và cà chua',
        description: 'Xào trứng còn lại và cà chua cắt hạt lựu riêng, sau đó trút vào chảo cơm rang đảo đều cùng nước tương và hành lá.'
      }
    ],
    rating: 4.7,
    reviewCount: 68,
    author: {
      name: 'Minh Châu'
    },
    isSaved: false,
    createdAt: '2026-08-16'
  },
  {
    id: 'canh-chua-ca-dieu-hong',
    title: 'Canh chua cá diêu hồng',
    description: 'Vị chua thanh mát của me và thơm, hòa quyện với thịt cá diêu hồng mềm ngọt và rau củ tươi giòn.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm2R6656cxyZ7DLnRJlegc8eCZK9OYL7KIToXEuJUt_i9zLKknuLT-qx9PjhQlbCaurZSM6D4SeFLSyE90au71GcvBsA0g3BEWgjW3fZpOWKAtC1OIVqbJUZmUgATceddg7-QI3RfjuiiO7VpGFMOSb4yMEqBQPsMUYujJcmq3SxzeJmw0a-yQSc3ubJdePlGKxWxN3re4lpggR9lFdGxTeYRtfGpDZRY_kUfyiC7AGG4kh_zRxjqwNA',
    prepTime: '30 Phút',
    servings: '4 Người',
    difficulty: 'Dễ',
    calories: 250,
    nutrition: {
      protein: 26,
      fat: 6,
      carbs: 18,
      calories: 250
    },
    categories: ['man', 'mien-nam', 'Đồ mặn', 'Miền Nam', 'Ít calo', 'Tất cả'],
    ingredients: [
      { name: 'Cá diêu hồng', amount: '600g' },
      { name: 'Cà chua', amount: '2 quả' },
      { name: 'Thơm (dứa)', amount: '1/4 quả' },
      { name: 'Đậu bắp, bạc hà (dọc mùng)', amount: '100g' },
      { name: 'Giá đỗ, ngò ôm, ngò gai', amount: '100g' },
      { name: 'Nước cốt me, ớt, tỏi phi', amount: 'Vừa đủ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Sơ chế cá và rau',
        description: 'Làm sạch cá, cắt khúc vừa ăn. Cà chua cắt múi cau, thơm cắt lát tam giác, đậu bắp và bạc hà tước vỏ cắt xéo.'
      },
      {
        step: 2,
        title: 'Nấu nước dùng chua ngọt',
        description: 'Đun sôi nước với nước cốt me, nêm đường, muối, nước mắm cho vị chua ngọt đậm đà. Thả cá vào luộc chín trong 10 phút.'
      },
      {
        step: 3,
        title: 'Thêm rau và hoàn thiện',
        description: 'Cho thơm, cà chua, đậu bắp, bạc hà vào đun sôi 2 phút. Cuối cùng cho giá đỗ, ngò ôm và tỏi phi thơm lên trên rồi tắt bếp.'
      }
    ],
    rating: 5.0,
    reviewCount: 89,
    author: {
      name: 'Minh Châu'
    },
    isSaved: true,
    createdAt: '2026-08-16'
  },
  {
    id: 'pho-chay-thanh-tinh',
    title: 'Phở chay thanh tịnh',
    description: 'Nước dùng ngọt lịm từ củ quả tự nhiên ninh kỹ, kết hợp nấm tươi và đậu hũ chiên béo ngậy.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzo7-iHzMwL9jaE5p8y-XETF4QOQZKzAEUA7kr8aNrK0I0Dd8-qVn1CZTqyAplloPzZhk-r3EOvovGM386GV7Iziy5pU1VUXuIrb2B73qbbzIy1VD02etJR5sApuZcDxitL789rsU8DV4lxYlpTMNseTV1xKQMeVHGdZvo2xCkmMTU1NdwfcjGg38gkRpcf1J6qWIqONmKaGgro9D9dGcGIuHA7wE23tnMbbYbTK93wn9XjwBu_GpUCw',
    prepTime: '60 Phút',
    servings: '4 Người',
    difficulty: 'Trung bình',
    calories: 320,
    nutrition: {
      protein: 16,
      fat: 8,
      carbs: 46,
      calories: 320
    },
    categories: ['chay', 'Ăn chay', 'Ít calo', 'Tất cả'],
    ingredients: [
      { name: 'Bánh phở tươi', amount: '800g' },
      { name: 'Đậu hũ chiên', amount: '3 miếng' },
      { name: 'Nấm đùi gà, nấm hương tươi', amount: '200g' },
      { name: 'Củ cải trắng, cà rốt, lê, bắp ngọt', amount: 'Mỗi loại 1 củ' },
      { name: 'Gia vị phở: Hoa hồi, quế, thảo quả', amount: '1 gói nhỏ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Ninh nước dùng củ quả',
        description: 'Cho củ cải, cà rốt, bắp ngọt, lê vào ninh 45 phút lấy nước ngọt thanh.'
      },
      {
        step: 2,
        title: 'Rang thảo mộc & xào nấm',
        description: 'Rang thơm quế hồi thả vào nước dùng. Xào sơ nấm và đậu hũ với dầu hào chay.'
      },
      {
        step: 3,
        title: 'Trình bày tô phở',
        description: 'Chần bánh phở, xếp nấm, đậu hũ lên tô, chan nước dùng sôi và rắc hành ngò thơm.'
      }
    ],
    rating: 4.9,
    reviewCount: 76,
    author: {
      name: 'Minh Châu'
    },
    isSaved: false,
    createdAt: '2026-08-17'
  },
  {
    id: 'bo-luc-lac-tieu-den',
    title: 'Bò lúc lắc sốt tiêu đen',
    description: 'Thịt bò thăn mềm mọng nước, đảo nhanh trên lửa lớn phủ lớp sốt tiêu đen bóng bẩy thơm nức.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKR93ZMgWbazthpspwBrgCKCUg2jZvaPNOdd7pP2izv2AB1vVvMKiuxk9zou33k1qgOzWhta3na3RONly4kUaM1O2FqFyw46rVC5GXsuZZihU3-Mx6LlxiWoXFZXzbVFokHsNOOIrnIcycYij2qNLFD18LuCUAmiW-aYTii1v5XGyJAoluFjlfERxxbE8W6njp1Q9bILN4gp2sLUpgqt2FGqKM0ElyCGw3YbkDXqY2KAm2l2R1P2dMcw',
    prepTime: '20 Phút',
    servings: '3 Người',
    difficulty: 'Dễ',
    calories: 520,
    nutrition: {
      protein: 38,
      fat: 26,
      carbs: 18,
      calories: 520
    },
    categories: ['man', 'quick', 'Đồ mặn', 'Dưới 15 phút', 'Tất cả'],
    ingredients: [
      { name: 'Thịt thăn bò', amount: '400g' },
      { name: 'Ớt chuông đỏ, xanh', amount: '1 quả' },
      { name: 'Hành tây', amount: '1 củ' },
      { name: 'Xà lách, cà chua ăn kèm', amount: '1 đĩa' },
      { name: 'Bơ thực vật, tỏi băm, tiêu đen đập dập', amount: 'Vừa đủ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Cắt và ướp thịt bò',
        description: 'Thịt bò cắt khối vuông quân cờ 2x2cm. Ướp với tỏi băm, dầu hào, nước tương, dầu mè và tiêu đen trong 15 phút.'
      },
      {
        step: 2,
        title: 'Xào rau củ',
        description: 'Xào nhanh hành tây, ớt chuông với xíu bơ ở lửa lớn để giữ độ giòn ngọt rồi trút ra đĩa.'
      },
      {
        step: 3,
        title: 'Lắc bò trên lửa lớn',
        description: 'Đun chảo thật nóng, cho bò vào áp chảo đảo nhanh tay trong 2-3 phút cho xém cạnh mà bên trong vẫn mềm ngọt.'
      }
    ],
    rating: 4.8,
    reviewCount: 110,
    author: {
      name: 'Minh Châu'
    },
    isSaved: false,
    createdAt: '2026-08-18'
  },
  {
    id: 'dau-hu-sot-ca-chua',
    title: 'Đậu Hũ Sốt Cà Chua Đưa Cơm',
    description: 'Miếng đậu hũ chiên vàng giòn rụm ngấm đẫm sốt cà chua đậm đà, món ăn bình dân mà hao cơm nhất mâm cơm Việt.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaTv8BZ-zND64DDdNuB47Nk7ovH2_DKQDzW0MwRz8EQkAc4iKSeinJ6rltQkMvJlf_rJTz3gWgwa_2drBaSB3sWvrBx4RV02eKePPbrtINft-PtK0TKwqSn5kBSBPHOjh9m6kTyyxT8ohkyM_qkQ9yjO1VdZe78Qx58eFukrfn_a195-NqDCtlF4ewHa7xLNz68tlwUZggOxbQZEYCVDRO4x9pGeuEPEzmlNaJes1qP_8ix4pc8iHGBg',
    prepTime: '20 Phút',
    servings: '3 Người',
    difficulty: 'Rất dễ',
    calories: 240,
    nutrition: {
      protein: 14,
      fat: 12,
      carbs: 16,
      calories: 240
    },
    categories: ['chay', 'Ăn chay', 'quick', 'Tất cả'],
    ingredients: [
      { name: 'Đậu hũ trắng', amount: '3 bìa' },
      { name: 'Cà chua chín', amount: '3 quả' },
      { name: 'Hành tím, hành lá', amount: '1 nắm' },
      { name: 'Nước mắm (hoặc nước tương chay)', amount: '2 thìa canh' },
      { name: 'Đường, hạt nêm, tiêu', amount: 'Vừa đủ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Chiên đậu hũ',
        description: 'Cắt đậu hũ thành các miếng vuông vừa ăn, chiên trong chảo dầu nóng đến khi các mặt vàng giòn.'
      },
      {
        step: 2,
        title: 'Làm sốt cà chua',
        description: 'Phi thơm hành tím, cho cà chua thái hạt lựu vào xào mềm nhuyễn cùng 50ml nước và gia vị.'
      },
      {
        step: 3,
        title: 'Om đậu hũ',
        description: 'Thả đậu hũ đã chiên vào đảo nhẹ với sốt cà chua trên lửa nhỏ 5 phút để ngấm đều vị, rắc hành lá và dùng nóng.'
      }
    ],
    rating: 4.9,
    reviewCount: 88,
    author: {
      name: 'Minh Châu'
    },
    isSaved: false,
    createdAt: '2026-08-19'
  },
  {
    id: 'goi-cuon-tom-thit',
    title: 'Gỏi Cuốn Tôm Thịt Thanh Mát',
    description: 'Tôm tươi ngọt thịt cùng ba chỉ luộc, bún tươi và rau sống giòn mát cuộn trong bánh tráng, chấm sốt tương đậu phộng béo bùi.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnQ0uKxReQDl_mLHfH3WWL9rf09-r8IrR40_HtPr5Tm2NnpXp9pGigSag04FQEdrcRgJ0bzKj_XXLfYIJL63KSWnphl8G3HIp9sxKDFqIp9LMHVo-IYRkOE18M2a-DhqX8iIIZXWq1Q6aW8jCKv51hkpYcFapQ_Ty5YvhePGSyFkz2Rb5ZzPTjNIccTnuAwXg-PHkeAGhrwjzi2MR2WPiOLTG9l4m1vUvV0vny5C6oggO4susrN06wfQ',
    prepTime: '20 Phút',
    servings: '4 Người',
    difficulty: 'Dễ',
    calories: 180,
    nutrition: {
      protein: 15,
      fat: 4,
      carbs: 22,
      calories: 180
    },
    categories: ['man', 'mien-nam', 'Ít calo', 'Miền Nam', 'Đồ mặn', 'Tất cả'],
    ingredients: [
      { name: 'Tôm sú tươi', amount: '300g' },
      { name: 'Thịt ba chỉ heo', amount: '300g' },
      { name: 'Bánh tráng cuốn', amount: '1 xấp' },
      { name: 'Bún tươi', amount: '300g' },
      { name: 'Rau xà lách, rau thơm, hẹ', amount: '200g' },
      { name: 'Tương đen, đậu phộng rang giã nhỏ', amount: '1 chén' }
    ],
    steps: [
      {
        step: 1,
        title: 'Luộc tôm và thịt',
        description: 'Luộc chín tôm, bóc vỏ bỏ chỉ lưng và chẻ đôi. Thịt ba chỉ luộc với xíu muối thái mỏng.'
      },
      {
        step: 2,
        title: 'Cuốn gỏi',
        description: 'Làm ẩm bánh tráng, xếp xà lách, rau thơm, bún, thịt rồi cuộn 1 vòng. Xếp tôm và cọng hẹ ra ngoài mép rồi cuộn chặt tay.'
      },
      {
        step: 3,
        title: 'Pha nước chấm',
        description: 'Xào tương đen cùng bơ đậu phộng và xíu nước dùng cho sệt mịn, rắc đậu phộng rang và ớt băm lên trên.'
      }
    ],
    rating: 5.0,
    reviewCount: 165,
    author: {
      name: 'Minh Châu'
    },
    isSaved: true,
    createdAt: '2026-08-20'
  }
];

export const INITIAL_PENDING_RECIPES: PendingRecipe[] = [
  {
    id: 'pending-1',
    title: 'Gà Hấp Lá Chanh Nước Dừa Siêu Tốc',
    description: 'Công thức gà hấp da giòn thịt ngọt ngào với hương lá chanh truyền thống.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6Fg-0zMlgYOFxmflhQH6yPC1RDFLIQ-wep1D8nYhnOOpqJH9SOa9j04Jg-PL1YJMdLnlv4hX7nJcJ1cQFrMsaH8WHx3NytBDqdvqO7R6hYtmjzegLRCkMDXbSBCam_ShEEqqGpjv5XSJlQA1U96qqieGOnNr52elW2qs49Zu6gXTqwSyUegmr4UTO3TUb6NdppIWSa0BZcTMH2qWY-UDr-B8KY248GloZ8i42BEvAm0xm8KPoymVbsQ',
    prepTime: '25 Phút',
    servings: '4 Người',
    difficulty: 'Dễ',
    calories: 380,
    nutrition: {
      protein: 34,
      fat: 14,
      carbs: 6,
      calories: 380
    },
    categories: ['man', 'mien-bac', 'Đồ mặn'],
    ingredients: [
      { name: 'Thịt gà ta', amount: '1 kg' },
      { name: 'Lá chanh tươi', amount: '10 lá' },
      { name: 'Nước dừa tươi', amount: '1 quả' },
      { name: 'Muối ớt chanh', amount: '1 chén nhỏ' }
    ],
    steps: [
      {
        step: 1,
        title: 'Ướp gà',
        description: 'Chà xát gà với muối và lá chanh đập dập trong 15 phút.'
      },
      {
        step: 2,
        title: 'Hấp gà',
        description: 'Đổ nước dừa vào nồi hấp, hấp gà cách thủy trong 20 phút.'
      }
    ],
    rating: 4.8,
    reviewCount: 0,
    author: {
      name: 'Người dùng ẩn danh'
    },
    status: 'pending',
    isValid: true,
    needsManualReview: true,
    aiReviewReason: 'Công thức hợp lệ, cần kiểm tra ảnh đại diện và định lượng muối để đảm bảo chuẩn vị.',
    aiConfidenceScore: 0.88,
    aiSuggestedTags: ['Đồ mặn', 'Miền Bắc', 'Ít calo'],
    submittedAt: '2026-08-22T20:15:00Z',
    createdAt: '2026-08-22T20:15:00Z'
  }
];

export const COMMENTS_MAP: Record<string, any[]> = {
  'pho-bo-gia-truyen': [
    {
      id: 'c1',
      userName: 'Lan Anh',
      rating: 5,
      content: 'Công thức rất chi tiết. Mình nấu thử cuối tuần cho cả nhà, ai cũng khen nước dùng ngọt thanh, không bị đục. Cảm ơn admin!',
      createdAt: '2 ngày trước'
    },
    {
      id: 'c2',
      userName: 'Minh Tuấn',
      rating: 5,
      content: 'Dễ làm hơn mình nghĩ. Khâu nướng hành gừng rất quan trọng để nước phở thơm mùi đặc trưng.',
      createdAt: '3 ngày trước'
    }
  ]
};
