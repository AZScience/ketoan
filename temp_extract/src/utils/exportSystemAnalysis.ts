import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  AlignmentType
} from "docx";
import { saveAs } from "file-saver";

export const exportSystemAnalysisToWord = async () => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "TÀI LIỆU PHÂN TÍCH HỆ THỐNG PHẦN MỀM KẾ TOÁN VAS",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          
          new Paragraph({
            text: "1. Giới thiệu hệ thống",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun("Hệ thống kế toán VAS là một ứng dụng quản lý tài chính chuyên sâu, hỗ trợ các đơn vị hành chính sự nghiệp và doanh nghiệp nhỏ thực hiện các nghiệp vụ kế toán theo chuẩn mực kế toán Việt Nam (VAS). Hệ thống tập trung vào tính chính xác, thời gian thực và khả năng báo cáo tự động."),
            ],
          }),

          new Paragraph({
            text: "2. Phân tích chức năng (Functional Requirements)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "- Quản lý Chứng từ: Lập phiếu thu, chi, nhập, xuất, hóa đơn, bảng lương.",
          }),
          new Paragraph({
            text: "- Hệ thống Tài khoản: Quản lý danh mục tài khoản đa cấp.",
          }),
          new Paragraph({
            text: "- Quản lý Danh mục: Đối tác, Nhân viên, Vật tư hàng hóa.",
          }),
          new Paragraph({
            text: "- Báo cáo Tài chính: Bảng cân đối, Kết quả kinh doanh, Lưu chuyển tiền tệ.",
          }),
          new Paragraph({
            text: "- Dashboard: Tổng quan tình hình tài chính qua biểu đồ.",
          }),

          new Paragraph({
            text: "3. Thiết kế Cơ sở dữ liệu (Database Design)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Hệ thống sử dụng Google Firestore (NoSQL) với cấu trúc các Collection chính như sau:",
          }),
          new Paragraph({ text: "" }),

          // Table for Database Design
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Collection", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Trường dữ liệu (Fields)", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kiểu dữ liệu", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "accounts" })] }),
                  new TableCell({ children: [new Paragraph({ text: "code, name, type, parentCode, level" })] }),
                  new TableCell({ children: [new Paragraph({ text: "String, String, String, String, Number" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "vouchers" })] }),
                  new TableCell({ children: [new Paragraph({ text: "date, number, type, description, totalAmount, items (Array)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "String, String, String, String, Number, Array<Object>" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "partners" })] }),
                  new TableCell({ children: [new Paragraph({ text: "code, name, taxId, address, phone, type" })] }),
                  new TableCell({ children: [new Paragraph({ text: "String, String, String, String, String, String" })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "" }),
          new Paragraph({
            text: "4. Sơ đồ phân tích hệ thống",
            heading: HeadingLevel.HEADING_2,
          }),
          
          new Paragraph({
            text: "4.1 Sơ đồ Use Case",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "[Mô tả: Actor (Kế toán viên) tương tác với các Use Case: Đăng nhập, Lập chứng từ, Xem báo cáo, Quản lý danh mục, Cấu hình hệ thống].",
          }),

          new Paragraph({
            text: "4.2 Sơ đồ Lớp (Class Diagram)",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "[Mô tả: Lớp Voucher chứa danh sách TransactionItem. Lớp Account liên kết với TransactionItem qua mã tài khoản. Lớp Partner liên kết với Voucher qua đối tượng giao dịch].",
          }),

          new Paragraph({
            text: "4.3 Sơ đồ Trình tự (Sequence Diagram - Lập chứng từ)",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "1. Người dùng nhập thông tin chứng từ trên UI.",
          }),
          new Paragraph({
            text: "2. UI gửi yêu cầu lưu dữ liệu đến Firebase Service.",
          }),
          new Paragraph({
            text: "3. Firebase Service kiểm tra quyền (Security Rules).",
          }),
          new Paragraph({
            text: "4. Dữ liệu được lưu vào Firestore.",
          }),
          new Paragraph({
            text: "5. Firestore trả về kết quả thành công.",
          }),
          new Paragraph({
            text: "6. UI hiển thị thông báo và cập nhật danh sách.",
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Phan_Tich_He_Thong_VAS.docx");
};
