export interface VoucherTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  circular: string;
  category: 'Payroll' | 'Inventory' | 'Sales' | 'Cash' | 'FixedAssets';
  fullTemplate: string;
}

export const VOUCHER_TEMPLATES: VoucherTemplate[] = [
  // I. Lao động tiền lương
  {
    id: '01 - LĐTL',
    code: 'LĐTL',
    name: 'Bảng thanh toán tiền lương',
    description: 'Dùng để thanh toán tiền lương, phụ cấp cho người lao động.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Payroll',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 01 - LĐTL
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG THANH TOÁN TIỀN LƯƠNG
Tháng …… năm ……
Số: …………
STT	Họ và tên	Ngạch bậc lương hoặc cấp bậc chức vụ	Hệ số	Lương sản phẩm	Lương thời gian	Nghỉ việc ngừng việc hưởng....% lương	Phụ cấp thuộc quỹ lương	Phụ cấp khác	Tổng số	Tạm ứng kỳ I	Các khoản phải khấu trừ vào lương	Kỳ II được lĩnh
				Số SP	Số tiền	Số công	Số tiền	Số công	Số tiền					BH XH	...	Thuế TNCN phải nộp	Cộng	Số tiền	Ký nhận
A	B	1	2	3	4	5	6	7	8	9	10	11	12	13	14	15	16	17	C
																			
																			
																			
																			
	Cộng	x	x	x		x		x											X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '02 - LĐTL',
    code: 'LĐTL',
    name: 'Bảng thanh toán tiền thưởng',
    description: 'Dùng để thanh toán các khoản tiền thưởng cho người lao động.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Payroll',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 02 - LĐTL
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG THANH TOÁN TIỀN THƯỞNG
Quý …. năm …..
Số: ……………..
STT	Họ và tên	Ngạch bậc lương hoặc cấp bậc chức vụ	Mức thưởng	Ghi chú
			Xếp loại thưởng	Số tiền	Ký nhận	
A	B	1	2	3	4	5
																			
																			
																			
																			
	Cộng	x	x		x	X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '03 - LĐTL',
    code: 'LĐTL',
    name: 'Bảng thanh toán tiền làm thêm giờ',
    description: 'Dùng để thanh toán tiền làm thêm giờ cho người lao động.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Payroll',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 03 - LĐTL
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG THANH TOÁN TIỀN LÀM THÊM GIỜ
Tháng …. năm ….
Số: ……………
STT	Họ và tên	Ngạch bậc lương hoặc cấp bậc chức vụ	Hệ số lương	Hệ số phụ cấp chức vụ	Cộng hệ số	Tiền lương tháng	Mức lương	Làm thêm ngày làm việc	Làm thêm ngày thứ bảy, chủ nhật	Làm thêm ngày lễ, ngày tết	Làm thêm buổi đêm	Tổng cộng tiền	Số ngày nghỉ bù	Số tiền thực được thanh toán	Người nhận tiền ký tên
								Ngày	Giờ	Số giờ	Thành tiền	Số giờ	Thành tiền	Số giờ	Thành tiền	Số giờ	Thành tiền			
A	B	1	2	3	4	5	6	7	8	9	10	11	12	13	14	15	16	17	18	19	20
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	x	x	x	x	x	x	x	x	x	x	x	X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '04 - LĐTL',
    code: 'LĐTL',
    name: 'Bảng thanh toán tiền thuê ngoài',
    description: 'Dùng cho thuê nhân công, thuê khoán việc.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Payroll',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 04 - LĐTL
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG THANH TOÁN TIỀN THUÊ NGOÀI
(Dùng cho thuê nhân công, thuê khoán việc)
Số: ………….
Họ và tên người thuê: .................................................................................................................................................................
Bộ phận (hoặc địa chỉ): ................................................................................................................................................................
Đã thuê những công việc sau để: .............................................................................................................................................
tại địa điểm .....................................................................................................................................................................................
từ ngày.../.../... đến ngày.../.../….
STT	Họ và tên người được thuê	CCCD/MST TNCN	Nội dung hoặc tên công việc	Số công hoặc khối lượng	Đơn giá	Thành tiền	Tiền thuế khấu trừ	Số tiền còn lại	Ký nhận
A	B	1	2	3	4	5	6	7	C
																			
																			
																			
																			
	Cộng	x	x	x	x		x	x	X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '05 - LĐTL',
    code: 'LĐTL',
    name: 'Hợp đồng giao khoán',
    description: 'Dùng để ký kết các công việc giao khoán.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Payroll',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 05 - LĐTL
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

HỢP ĐỒNG GIAO KHOÁN
Ngày... tháng... năm...
Số: …………….
Họ và tên: ………………………………. Chức vụ ........................................................................................................................
Đại diện ......................................................................................................................................................... bên giao khoán
Họ và tên: ………………………………. Chức vụ ........................................................................................................................
Đại diện ......................................................................................................................................................... bên nhận khoán
CÙNG KÝ KẾT HỢP ĐỒNG GIAO KHOÁN NHƯ SAU:
I- Điều khoản chung:
- Phương thức giao khoán: ........................................................................................................................................................
- Điều kiện thực hiện hợp đồng: ...............................................................................................................................................
- Thời gian thực hiện hợp đồng: ...............................................................................................................................................
- Các điều kiện khác: ..................................................................................................................................................................
II- Điều khoản cụ thể:
1. Nội dung công việc khoán: ....................................................................................................................................................
2. Trách nhiệm, quyền lợi và nghĩa vụ của người nhận khoán: ........................................................................................
3. Trách nhiệm, quyền lợi và nghĩa vụ của bên giao khoán: .............................................................................................
Hợp đồng này được lập thành .... bản, mỗi bên giữ .... bản có giá trị pháp lý như nhau.
Đại diện bên nhận khoán	Đại diện bên giao khoán
(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '06 - LĐTL',
    code: 'LĐTL',
    name: 'Biên bản thanh lý (nghiệm thu) hợp đồng giao khoán',
    description: 'Dùng để nghiệm thu và thanh lý hợp đồng giao khoán.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Payroll',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 06 - LĐTL
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN BẢN THANH LÝ (NGHIỆM THU) HỢP ĐỒNG GIAO KHOÁN
Ngày... tháng... năm...
Số: …………….
Họ và tên: ………………… Chức vụ ………….. Đại diện ……….Bên giao khoán
Họ và tên: ………………… Chức vụ ………….. Đại diện ……….Bên nhận khoán
Cùng thanh lý Hợp đồng số ................................. ngày... tháng... năm .............................................................................
Nội dung công việc đã được thực hiện: ...................................................................................................................................
Giá trị hợp đồng đã thực hiện: ....................................................................................................................................................
Bên ………….. đã thanh toán cho bên ….. số tiền là ...........................................................................................................
Số tiền bị phạt do vi phạm: .........................................................................................................................................................
Số tiền bên .... còn phải thanh toán cho bên …… là ..........................................................................................................
Kết luận: ..........................................................................................................................................................................................
Biên bản này được lập thành .... bản, mỗi bên giữ .... bản có giá trị pháp lý như nhau.
Đại diện bên nhận khoán	Đại diện bên giao khoán
(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '07 - LĐTL',
    code: 'LĐTL',
    name: 'Bảng kê trích nộp các khoản theo lương',
    description: 'Dùng để kê khai các khoản trích nộp theo lương (BHXH, BHYT, BHTN, KPCĐ).',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Payroll',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 07 - LĐTL
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG KÊ TRÍCH NỘP CÁC KHOẢN THEO LƯƠNG
Tháng .... năm...
Số: …………..
Đơn vị tính: …….
STT	Số tháng trích	Tổng quỹ lương trích	BHXH, BHYT, BHTN	KPCĐ
				Tổng số	Trích vào chi phí	Trừ vào lương	Tổng số	Số phải nộp cấp trên	Số để lại đơn vị
A	B	1	2	3	4	5	6	7
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '08 - LĐTL',
    code: 'LĐTL',
    name: 'Bảng phân bổ tiền lương và các khoản trích theo lương',
    description: 'Dùng để phân bổ chi phí tiền lương và các khoản trích theo lương vào các đối tượng chi phí.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Payroll',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 08 - LĐTL
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG PHÂN BỔ TIỀN LƯƠNG VÀ CÁC KHOẢN TRÍCH THEO LƯƠNG
Tháng... năm...
Số: …………..
Số TT	Đối tượng sử dụng (Ghi Nợ các TK)	TK 334	TK 338	TK 335	Tổng cộng
			Lương	Các khoản khác	Cộng	KPCĐ	BHXH	BHYT	BHTN	Cộng		
A	B	1	2	3	4	5	6	7	8	9	10
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	x	x	X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },

  // II. Hàng tồn kho
  {
    id: '01 - VT',
    code: 'VT',
    name: 'Phiếu nhập kho',
    description: 'Dùng để xác nhận số lượng vật tư, hàng hóa nhập kho.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Inventory',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 01 - VT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

PHIẾU NHẬP KHO
Ngày.... tháng..... năm....
Số: ……..….
Nợ: ….….….
Có: …….…..
- Họ và tên người giao: ...............................................................................................................................................................
- Theo ......................................... số ................... ngày ....... tháng ....... năm ....... của ...................................................
Nhập tại kho: ...................................................................................................... địa điểm .......................................................
STT	Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa	Mã số	Đơn vị tính	Số lượng	Đơn giá	Thành tiền
						Theo chứng từ	Thực nhập		
A	B	C	D	1	2	3	4
																			
																			
																			
																			
	Cộng	x	x	x	x		X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Số chứng từ gốc kèm theo: ....................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập phiếu	Người giao hàng	Thủ kho	Kế toán trưởng (Hoặc bộ phận có nhu cầu lập)	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '02 - VT',
    code: 'VT',
    name: 'Phiếu xuất kho (Bán hàng)',
    description: 'Dùng để xác nhận số lượng vật tư, hàng hóa xuất kho để bán.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Inventory',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 02 - VT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

PHIẾU XUẤT KHO
Ngày.... tháng..... năm ……
Số: ……..….
Nợ: ….….….
Có: …….…..
- Họ và tên người nhận hàng: ................................................................... Địa chỉ (bộ phận) .............................................
- Lý do xuất kho: ..........................................................................................................................................................................
- Xuất tại kho (ngăn lô): ........................................................................... Địa điểm ...............................................................
STT	Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa	Mã số	Đơn vị tính	Số lượng	Đơn giá	Thành tiền
						Yêu cầu	Thực xuất		
A	B	C	D	1	2	3	4
																			
																			
																			
																			
	Cộng	x	x	x	x		X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập phiếu	Người nhận hàng	Thủ kho	Kế toán trưởng (Hoặc bộ phận có nhu cầu lập)	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '02a - VT',
    code: 'VT',
    name: 'Phiếu xuất kho (Vật tư, hàng hóa)',
    description: 'Dùng để xuất kho vật tư, hàng hóa cho sản xuất hoặc tiêu dùng nội bộ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Inventory',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 02 - VT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

PHIẾU XUẤT KHO
Ngày.... tháng..... năm ……
Số: ……..….
Nợ: ….….….
Có: …….…..
- Họ và tên người nhận hàng: ................................................................... Địa chỉ (bộ phận) .............................................
- Lý do xuất kho: ..........................................................................................................................................................................
- Xuất tại kho (ngăn lô): ........................................................................... Địa điểm ...............................................................
STT	Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa	Mã số	Đơn vị tính	Số lượng	Đơn giá	Thành tiền
						Yêu cầu	Thực xuất		
A	B	C	D	1	2	3	4
																			
																			
																			
																			
	Cộng	x	x	x	x		X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập phiếu	Người nhận hàng	Thủ kho	Kế toán trưởng (Hoặc bộ phận có nhu cầu lập)	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '03 - VT',
    code: 'VT',
    name: 'Biên bản kiểm nghiệm vật tư, công cụ, sản phẩm, hàng hóa',
    description: 'Dùng để kiểm nghiệm chất lượng, số lượng vật tư khi nhập kho.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Inventory',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 03 - VT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN BẢN KIỂM NGHIỆM
Vật tư, công cụ, sản phẩm, hàng hóa
Ngày... tháng... năm....
Số: ……………..
- Căn cứ ………. số …… ngày ….. tháng …. năm ….. của .............................................................................................
Ban kiểm nghiệm gồm: .............................................................................................................................................................
STT	Tên nhãn hiệu, quy cách, phẩm chất vật tư, công cụ, sản phẩm, hàng hóa	Mã số	Phương thức kiểm nghiệm	Đơn vị tính	Số lượng theo chứng từ	Kết quả kiểm nghiệm	Ghi chú
							Đúng quy cách	Không đúng quy cách	
A	B	C	D	E	1	2	3	4
																			
																			
																			
																			
	Cộng	x	x	x	x	x	X
Ý kiến của Ban kiểm nghiệm: ...................................................................................................................................................
.........................................................................................................................................................................................................
Đại diện Ban kiểm nghiệm
(Ký, họ tên)`
  },
  {
    id: '04 - VT',
    code: 'VT',
    name: 'Bảng kê chi tiết vật tư còn lại cuối kỳ',
    description: 'Dùng để theo dõi vật tư còn lại tại nơi sử dụng.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Inventory',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 04 - VT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG KÊ CHI TIẾT VẬT TƯ CÒN LẠI CUỐI KỲ
Ngày... tháng... năm...
Số: ……………….
Bộ phận sử dụng: ........................................................................................................................................................................
Số TT	Tên, nhãn hiệu, quy cách, phẩm chất vật tư, công cụ, dụng cụ	Mã số	Đơn vị tính	Số lượng
					Tổng	Để lại sử dụng	Nhập lại kho
A	B	C	D	1	2	3
																			
																			
																			
																			
	Cộng	x	x	x	x	X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Người phụ trách bộ phận sử dụng
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)`
  },
  {
    id: '05 - VT',
    code: 'VT',
    name: 'Biên bản tổng hợp kiểm kê vật tư, công cụ, sản phẩm, hàng hóa',
    description: 'Dùng để tổng hợp kết quả kiểm kê hàng tồn kho.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Inventory',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 05 - VT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN BẢN TỔNG HỢP KIỂM KÊ VẬT TƯ, CÔNG CỤ, SẢN PHẨM, HÀNG HÓA
Số: ………………
- Thời điểm kiểm kê …… giờ ...ngày ...tháng ...năm …..
- Ban kiểm kê gồm: ....................................................................................................................................................................
STT	Tên, nhãn hiệu, quy cách, phẩm chất vật tư, công cụ, sản phẩm, hàng hóa	Mã số	Đơn vị tính	Đơn giá	Theo sổ kế toán	Theo kiểm kê	Chênh lệch	Phẩm chất
						Số lượng	Thành tiền	Số lượng	Thành tiền	Thừa	Thiếu	Tốt	Kém	Mất
A	B	C	D	1	2	3	4	5	6	7	8	9	10
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	x	x	x	X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Trưởng ban kiểm kê
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)`
  },
  {
    id: '06 - VT',
    code: 'VT',
    name: 'Bảng kê mua hàng',
    description: 'Dùng cho người mua hàng kê khai khi mua hàng hóa, dịch vụ lẻ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Inventory',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 06 - VT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG KÊ MUA HÀNG
Ngày.... tháng.... năm ....
Quyển số: ... Số: ...
Nợ: ... Có: ...
- Họ và tên người mua: ..............................................................................................................................................................
- Bộ phận (phòng, ban): .............................................................................................................................................................
STT	Tên, quy cách, phẩm chất vật tư, công cụ, dụng cụ, hàng hóa	Địa chỉ mua hàng	Đơn vị tính	Số lượng	Đơn giá	Thành tiền
A	B	C	D	1	2	3
																			
																			
																			
																			
	Cộng	x	x	x	x	X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '07 - VT',
    code: 'VT',
    name: 'Bảng phân bổ nguyên liệu, vật liệu, công cụ, dụng cụ',
    description: 'Dùng để phân bổ giá trị nguyên vật liệu, công cụ dụng cụ xuất dùng.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Inventory',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số: 07 - VT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG PHÂN BỔ NGUYÊN LIỆU, VẬT LIỆU CÔNG CỤ, DỤNG CỤ
Tháng …. năm ….
Số: …………
STT	Đối tượng sử dụng (Ghi Nợ các TK)	Tài khoản 152	Tài khoản 153	Tài khoản 242
				Giá hạch toán	Giá thực tế	Giá hạch toán	Giá thực tế	
A	B	1	2	3	4	5
																			
																			
																			
																			
	Cộng	x	x	x	x	x	X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },

  // III. Bán hàng
  {
    id: '01 - BH',
    code: 'BH',
    name: 'Bảng thanh toán hàng đại lý, ký gửi',
    description: 'Dùng để thanh toán hàng hóa nhận đại lý, ký gửi.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Sales',
    fullTemplate: `Đơn vị: ................
Địa chỉ:…………	Mẫu số 01 - BH
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG THANH TOÁN HÀNG ĐẠI LÝ, KÝ GỬI
Ngày.... tháng.... năm ....
Quyển số: ... Số: ...
Nợ: ... Có: ...
Căn cứ Hợp đồng số: ................................. ngày... tháng... năm .............................................................................
I- Thanh quyết toán số hàng đại lý:
Số TT	Tên, quy cách, phẩm chất hàng hóa	Đơn vị tính	Số lượng tồn đầu kỳ	Số lượng nhận trong kỳ	Tổng số	Số hàng đã bán	Số lượng tồn cuối kỳ
							Số lượng	Đơn giá	Thành tiền	
A	B	C	1	2	3	4	5	6	7
																			
																			
																			
																			
	Cộng	x	x	x	x	x		X
II- Số tiền hoa hồng đại lý được hưởng: ....................................................................................................................
III- Số tiền thuế khấu trừ (nếu có): .................................................................................................................................
IV- Số tiền còn lại phải thanh toán cho bên giao hàng: ...............................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '02 - BH',
    code: 'BH',
    name: 'Thẻ quầy hàng',
    description: 'Dùng để theo dõi hàng hóa tại quầy bán lẻ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Sales',
    fullTemplate: `Đơn vị: ................
Địa chỉ:…………	Mẫu số 02 - BH
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

THẺ QUẦY HÀNG
Ngày lập thẻ …………… Tờ số: ……………..
- Tên hàng: ........................................................................................................ Quy cách: .................................................
- Đơn vị tính: ....................................................................................................... Đơn giá: ...................................................
Ngày tháng	Tên người bán	Tồn đầu ngày	Nhập từ kho	Nhập khác	Cộng tồn và nhập	Xuất bán	Xuất khác	Tồn cuối ngày
							Lượng	Tiền	Lượng	Tiền	
A	B	1	2	3	4	5	6	7	8	9
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	x	X
Ngày ...... tháng ....... năm .........
Người lập thẻ	Kế toán trưởng	Người bán hàng
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)`
  },

  // IV. Tiền tệ
  {
    id: '01 - TT',
    code: 'TT',
    name: 'Phiếu thu',
    description: 'Xác định số tiền mặt thực tế nhập quỹ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Địa chỉ:…………	Mẫu số 01 - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

PHIẾU THU
Ngày …… tháng ….. năm …..
Quyển số: ... Số: ...
Nợ: ... Có: ...
Họ và tên người nộp tiền: ........................................................................................................................................................
Địa chỉ: ..........................................................................................................................................................................................
Lý do nộp: .....................................................................................................................................................................................
Số tiền: ...........................................................................................................................................................................................
(Viết bằng chữ): ..........................................................................................................................................................................
Kèm theo: ................................................................................................................................................... Chứng từ gốc.
Ngày ...... tháng ....... năm .........
Giám đốc	Kế toán trưởng	Người nộp tiền	Người lập phiếu	Thủ quỹ
(Ký, họ tên, đóng dấu)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)
+ Đã nhận đủ số tiền (viết bằng chữ): ...................................................................................................................................`
  },
  {
    id: '02 - TT',
    code: 'TT',
    name: 'Phiếu chi',
    description: 'Xác định số tiền mặt thực tế xuất quỹ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Địa chỉ:…………	Mẫu số 02 - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

PHIẾU CHI
Ngày …… tháng ….. năm …..
Quyển số: ... Số: ...
Nợ: ... Có: ...
Họ và tên người nhận tiền: ......................................................................................................................................................
Địa chỉ: ..........................................................................................................................................................................................
Lý do chi: .....................................................................................................................................................................................
Số tiền: ...........................................................................................................................................................................................
(Viết bằng chữ): ..........................................................................................................................................................................
Kèm theo: ................................................................................................................................................... Chứng từ gốc.
Ngày ...... tháng ....... năm .........
Giám đốc	Kế toán trưởng	Người nhận tiền	Người lập phiếu	Thủ quỹ
(Ký, họ tên, đóng dấu)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)
+ Đã nhận đủ số tiền (viết bằng chữ): ...................................................................................................................................`
  },
  {
    id: '03 - TT',
    code: 'TT',
    name: 'Giấy đề nghị tạm ứng',
    description: 'Căn cứ để xét duyệt và làm thủ tục tạm ứng tiền.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số 03 - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

GIẤY ĐỀ NGHỊ TẠM ỨNG
Ngày …… tháng ….. năm …..
Số: ……………..

Kính gửi: .....................................................................................................................................................................................
Tên tôi là: .....................................................................................................................................................................................
Địa chỉ: ..........................................................................................................................................................................................
Đề nghị cho tạm ứng số tiền: ...................................................................................................................................................
(Viết bằng chữ): ...........................................................................................................................................................................
Lý do tạm ứng: ............................................................................................................................................................................
Thời hạn thanh toán: ...................................................................................................................................................................

Giám đốc	Kế toán trưởng	Phụ trách bộ phận	Người đề nghị tạm ứng
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)

Ghi chú: Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.`
  },
  {
    id: '04 - TT',
    code: 'TT',
    name: 'Giấy thanh toán tiền tạm ứng',
    description: 'Dùng để thanh toán số tiền đã tạm ứng.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số 04 - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

GIẤY THANH TOÁN TIỀN TẠM ỨNG
Ngày …… tháng ….. năm …..
Số: ……………..
Nợ: ……………..
Có: ……………..

- Họ và tên người thanh toán: ......................................................................................................................................................
- Bộ phận (hoặc địa chỉ): ..........................................................................................................................................................................................
- Số tiền tạm ứng được thanh toán theo bảng dưới đây:
STT	Diễn giải	Số tiền
A	B	1
I	Số tiền tạm ứng	
1	Số tạm ứng các kỳ trước chưa chi hết	
2	Số tạm ứng kỳ này:	
	- Phiếu chi số …… ngày ……	
	- Phiếu chi số …… ngày ……	
II	Số tiền đã chi	
1	Chứng từ số …… ngày ……	
2	Chứng từ số …… ngày ……	
III	Chênh lệch (I - II)	
1	Số tạm ứng chi không hết (nộp lại quỹ)	
2	Chi quá số tạm ứng (được chi thêm)	

Giám đốc	Kế toán trưởng	Phụ trách bộ phận	Người thanh toán
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)`
  },
  {
    id: '05 - TT',
    code: 'TT',
    name: 'Giấy đề nghị thanh toán',
    description: 'Dùng để đề nghị thanh toán các khoản chi hộ hoặc chi phí phát sinh.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Địa chỉ:…….……	Mẫu số 05 - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

GIẤY ĐỀ NGHỊ THANH TOÁN
Ngày ….. tháng ….. năm...
Kính gửi: .....................................................................................................................................................................................
Họ và tên người đề nghị thanh toán: ......................................................................................................................................
Bộ phận (Hoặc địa chỉ): ............................................................................................................................................................
Nội dung thanh toán: .................................................................................................................................................................
Số tiền: ...........................................................................................................................................................................................
(Viết bằng chữ): ..........................................................................................................................................................................
(Kèm theo ................................................................................................................................................... chứng từ gốc).
Ngày ...... tháng ....... năm .........
Người đề nghị thanh toán	Trưởng bộ phận	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  },
  {
    id: '06 - TT',
    code: 'TT',
    name: 'Biên lai thu tiền',
    description: 'Dùng để thu các khoản tiền lẻ, phí, lệ phí.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Địa chỉ:…….……	Mẫu số 06 - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN LAI THU TIỀN
Ngày …. tháng … năm ....
Quyển số: ... Số: ...
- Họ và tên người nộp: ..............................................................................................................................................................
- Địa chỉ: ..........................................................................................................................................................................................
- Nội dung thu: .............................................................................................................................................................................
- Số tiền thu: ..................................................................................................................................................................................
- (Viết bằng chữ): .........................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người nộp tiền	Người thu tiền
(Ký, họ tên)	(Ký, họ tên)`
  },
  {
    id: '07 - TT',
    code: 'TT',
    name: 'Bảng kê vàng tiền tệ',
    description: 'Dùng để kê khai chi tiết các loại vàng tiền tệ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Bộ phận:…….……	Mẫu số 07 - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG KÊ VÀNG TIỀN TỆ
(Đính kèm phiếu ... Ngày …. tháng …. năm …..)
Quyển số: ... Số: ...
STT	Tên, loại, quy cách, phẩm chất vàng tiền tệ	Đơn vị tính	Số lượng	Đơn giá	Thành tiền	Ghi chú
A	B	C	1	2	3	4
																			
																			
																			
																			
	Cộng	x	x	x		X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Thủ quỹ
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)`
  },
  {
    id: '08a - TT',
    code: 'TT',
    name: 'Bảng kiểm kê quỹ (dùng cho VND)',
    description: 'Dùng để kiểm kê quỹ tiền mặt bằng đồng Việt Nam.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số 08a - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG KIỂM KÊ QUỸ
(Dùng cho VNĐ)
Số: ……………..
Hôm nay, vào ….. giờ ….. ngày ....tháng …. năm …..
Chúng tôi gồm:
- Ông/Bà: ................................................................. đại diện kế toán
- Ông/Bà: ................................................................. đại diện thủ quỹ
- Ông/Bà: ................................................................. đại diện ...........
Cùng tiến hành kiểm kê quỹ tiền mặt kết quả như sau
STT	Diễn giải	Số lượng (tờ)	Số tiền
A	B	1	2
I	Số dư theo sổ quỹ	x	
II	Số kiểm kê thực tế	x	
1	Trong đó: - Loại ..........		
2	- Loại ..........		
3	- Loại ..........		
4	- Loại ..........		
5	- Loại ..........		
III	Chênh lệch (III = I - II)	x	
- Lý do: + Thừa:
         + Thiếu:
- Kết luận sau khi kiểm kê quỹ:
Ngày ...... tháng ....... năm .........
Kế toán trưởng	Thủ quỹ	Người chịu trách nhiệm kiểm kê quỹ
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)

Ghi chú: Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.`
  },
  {
    id: '08b - TT',
    code: 'TT',
    name: 'Bảng kiểm kê quỹ (dùng cho ngoại tệ, vàng tiền tệ)',
    description: 'Dùng để kiểm kê quỹ ngoại tệ và vàng tiền tệ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Bộ phận:…………	Mẫu số 08b - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG KIỂM KÊ QUỸ
(Dùng cho ngoại tệ, vàng tiền tệ)
Số: ………………..
Hôm nay, vào ….. giờ ….. ngày ....tháng …. năm …..
Chúng tôi gồm:
- Ông/Bà: ................................................................. đại diện kế toán
- Ông/Bà: ................................................................. đại diện thủ quỹ
- Ông/Bà: ................................................................. đại diện ...........
Cùng tiến hành kiểm kê quỹ tiền mặt kết quả như sau
STT	Diễn giải	Số lượng (tờ)	Số tiền
A	B	1	2
I	Số dư theo sổ quỹ	x	
II	Số kiểm kê thực tế	x	
1	Trong đó: - Loại ..........		
2	- Loại ..........		
3	- Loại ..........		
4	- Loại ..........		
5	- Loại ..........		
III	Chênh lệch (III = I - II)	x	
- Lý do: + Thừa:
         + Thiếu:
- Kết luận sau khi kiểm kê quỹ:
Ngày ...... tháng ....... năm .........
Kế toán trưởng	Thủ quỹ	Người chịu trách nhiệm kiểm kê quỹ
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)

Ghi chú: Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.`
  },
  {
    id: '09 - TT',
    code: 'TT',
    name: 'Bảng kê chi tiền',
    description: 'Dùng để tổng hợp các khoản chi tiền nhỏ lẻ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'Cash',
    fullTemplate: `Đơn vị: ................
Bộ phận:…….……	Mẫu số 09 - TT
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG KÊ CHI TIỀN
Ngày..... tháng..... năm....
Họ và tên người chi: ..................................................................................................................................................................
Bộ phận (hoặc địa chỉ): ...............................................................................................................................................................
Chi cho công việc: .......................................................................................................................................................................
STT	Chứng từ	Nội dung chi	Số tiền
	Số hiệu	Ngày tháng		
A	B	C	D	1
																			
																			
																			
																			
	Cộng	x	x	x	X
Tổng số tiền (viết bằng chữ): .........................................................................................................................................
............................................................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng
(Ký, họ tên)	(Ký, họ tên)`
  },

  // V. Tài sản cố định
  {
    id: '01 - TSCĐ',
    code: 'TSCĐ',
    name: 'Biên bản giao nhận TSCĐ',
    description: 'Xác nhận việc bàn giao và nhận tài sản cố định.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'FixedAssets',
    fullTemplate: `Đơn vị: ................
Bộ phận:…….……	Mẫu số 01 - TSCĐ
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN BẢN GIAO NHẬN TÀI SẢN CỐ ĐỊNH
Ngày... tháng... năm...
Số: ……………..
Nợ: ... Có: ...
- Căn cứ Quyết định số: ................. ngày... tháng... năm ................. của ....................................................................
về việc bàn giao tài sản cố định.
- Ban giao nhận TSCĐ gồm: ...............................................................................................................................................
STT	Tên, ký hiệu, quy cách (cấp hạng) TSCĐ	Số hiệu TSCĐ	Nước sản xuất (xây dựng)	Năm sản xuất	Năm đưa vào sử dụng	Công suất (diện tích, thiết kế)	Giá trị TSCĐ	Tài liệu kèm theo
								Nguyên giá	Hao mòn lũy kế	Giá trị còn lại	
A	B	C	1	2	3	4	5	6	7	8
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	x	X
Dụng cụ, phụ tùng kèm theo: ................................................................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc	Bên giao	Bên nhận
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)	(Ký, họ tên)	(Ký, họ tên)`
  },
  {
    id: '02 - TSCĐ',
    code: 'TSCĐ',
    name: 'Biên bản thanh lý TSCĐ',
    description: 'Xác nhận việc thanh lý tài sản cố định.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'FixedAssets',
    fullTemplate: `Đơn vị: ................
Bộ phận:…….……	Mẫu số 02 - TSCĐ
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN BẢN THANH LÝ TÀI SẢN CỐ ĐỊNH
Ngày... tháng... năm...
Số: ……………..
Nợ: ... Có: ...
- Căn cứ Quyết định thanh lý TSCĐ số: ................. ngày... tháng... năm ................. của ..........................................
- Ban thanh lý TSCĐ gồm: ...................................................................................................................................................
I- Kết quả thanh lý TSCĐ:
STT	Tên, ký hiệu, quy cách (cấp hạng) TSCĐ	Số hiệu TSCĐ	Nước sản xuất (xây dựng)	Năm sản xuất	Năm đưa vào sử dụng	Nguyên giá	Hao mòn lũy kế	Giá trị còn lại
A	B	C	1	2	3	4	5	6
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	X
II- Kết quả kiểm kê phụ tùng, phế liệu thu hồi: ............................................................................................................
III- Kết quả chi phí thanh lý và thu thanh lý: ...............................................................................................................
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc	Trưởng ban thanh lý
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)	(Ký, họ tên)`
  },
  {
    id: '03 - TSCĐ',
    code: 'TSCĐ',
    name: 'Biên bản bàn giao TSCĐ sửa chữa, bảo dưỡng hoặc nâng cấp, cải tạo hoàn thành',
    description: 'Xác nhận việc hoàn thành sửa chữa, nâng cấp TSCĐ.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'FixedAssets',
    fullTemplate: `Đơn vị: ................
Bộ phận:…….……	Mẫu số 03 - TSCĐ
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN BẢN GIAO NHẬN TSCĐ SỬA CHỮA LỚN HOÀN THÀNH
Ngày... tháng... năm...
Số: ……………..
- Căn cứ Hợp đồng sửa chữa số: ................. ngày... tháng... năm ................. của .......................................................
- Ban giao nhận gồm: ...............................................................................................................................................................
STT	Tên, ký hiệu TSCĐ sửa chữa	Số hiệu TSCĐ	Bộ phận sử dụng	Nội dung sửa chữa	Thời gian sửa chữa	Chi phí sửa chữa	Kết quả kiểm tra
							Bắt đầu	Kết thúc	Dự toán	Thực tế	
A	B	C	D	1	2	3	4	5	6
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc	Bên giao	Bên nhận
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)	(Ký, họ tên)	(Ký, họ tên)`
  },
  {
    id: '04 - TSCĐ',
    code: 'TSCĐ',
    name: 'Biên bản đánh giá lại TSCĐ',
    description: 'Xác nhận kết quả đánh giá lại giá trị tài sản cố định.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'FixedAssets',
    fullTemplate: `Đơn vị: ................
Bộ phận:…….……	Mẫu số 04 - TSCĐ
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN BẢN ĐÁNH GIÁ LẠI TÀI SẢN CỐ ĐỊNH
Ngày... tháng... năm...
Số: ……………..
Nợ: ... Có: ...
- Căn cứ Quyết định số: ................. ngày... tháng... năm ................. của ....................................................................
- Hội đồng đánh giá gồm: ...................................................................................................................................................
STT	Tên, ký hiệu TSCĐ	Số hiệu TSCĐ	Số thẻ TSCĐ	Giá trị đang ghi sổ	Giá trị đánh giá lại	Chênh lệch
								Nguyên giá	Hao mòn lũy kế	Giá trị còn lại	Nguyên giá	Hao mòn lũy kế	Giá trị còn lại	Nguyên giá	Hao mòn lũy kế	Giá trị còn lại
A	B	C	D	1	2	3	4	5	6	7	8	9
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	x	x	x	x	x	X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc	Chủ tịch hội đồng
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)	(Ký, họ tên)`
  },
  {
    id: '05 - TSCĐ',
    code: 'TSCĐ',
    name: 'Biên bản tổng hợp kiểm kê TSCĐ',
    description: 'Tổng hợp kết quả kiểm kê tài sản cố định.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'FixedAssets',
    fullTemplate: `Đơn vị: ................
Bộ phận:…….……	Mẫu số 05 - TSCĐ
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BIÊN BẢN TỔNG HỢP KIỂM KÊ TÀI SẢN CỐ ĐỊNH
Số: ………..
Thời điểm kiểm kê …….. giờ ….. ngày … tháng …. năm ….
Ban kiểm kê gồm: ....................................................................................................................................................................
Số TT	Tên TSCĐ	Đơn vị tính	Mã số	Nơi sử dụng	Theo sổ kế toán	Theo kiểm kê	Chênh lệch
						Số lượng	Nguyên giá	Giá trị còn lại	Số lượng	Nguyên giá	Giá trị còn lại	Thừa	Thiếu
A	B	C	D	E	1	2	3	4	5	6	7	8
																			
																			
																			
																			
	Cộng	x	x	x	x	x	x	x	x	x	x	x	X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Trưởng ban kiểm kê
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên)`
  },
  {
    id: '06 - TSCĐ',
    code: 'TSCĐ',
    name: 'Bảng tính và phân bổ khấu hao TSCĐ',
    description: 'Tính toán và phân bổ chi phí khấu hao tài sản cố định.',
    circular: 'Thông tư 99/2018/TT-BTC',
    category: 'FixedAssets',
    fullTemplate: `Đơn vị: ................
Bộ phận:…….……	Mẫu số 06 - TSCĐ
(Ban hành kèm theo Thông tư số 99/2018/TT-BTC
ngày 01 tháng 11 năm 2018 của Bộ trưởng Bộ Tài chính)

BẢNG TÍNH VÀ PHÂN BỔ KHẤU HAO TSCĐ
Tháng ….. năm …..
Số: ………..
STT	Chỉ tiêu	Tỷ lệ khấu hao	Nơi sử dụng (Toàn DN, TK 627, TK 623, TK 641, TK 642, TK 241, TK 242, TK 335, ...)
A	B	1	2
																			
																			
																			
																			
	Cộng	x	x	X
Ngày ...... tháng ....... năm .........
Người lập biểu	Kế toán trưởng	Giám đốc
(Ký, họ tên)	(Ký, họ tên)	(Ký, họ tên, đóng dấu)`
  }
];

