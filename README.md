# WebGIS Phương án sử dụng đất — xã Đại Phúc

Phương án sử dụng đất do Công ty Lâm nghiệp Thái Nguyên trả ra (480 thửa – 1.114,44 ha; QĐ 2199/QĐ-UBND ngày 20/9/2024 và QĐ 3073/QĐ-UBND ngày 05/12/2024).
UBND xã Đại Phúc, tỉnh Thái Nguyên — Cơ quan tổ chức lập: **Phòng Xây dựng, Nông nghiệp và Môi trường**.
Đơn vị xây dựng: Công ty Cổ phần Công nghệ Tài nguyên - Môi trường Hà Nội — ĐT 035.293 7823.

## Cấu trúc
```
index.html, app.js, style.css   Giao diện và chức năng
data/diachinh.geojson           472 thửa trên bản đồ địa chính chính quy
data/thua_bosung.geojson        8 thửa không có trên BĐĐC — ranh bản đồ lâm nghiệp (chồng lấn BĐĐC)
tools/build_data.py             Script dựng lại 2 file data khi cập nhật
```

## Đưa lên GitHub Pages
1. Tạo repo Public, upload toàn bộ nội dung thư mục này (giữ thư mục `data/` có đủ 2 file).
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.

## Cập nhật dữ liệu
Sửa biểu Excel (sheet TONG_HOP) hoặc file GeoJSON (VN-2000, KTT 106°30'), rồi chạy:
```
pip install pyproj shapely openpyxl
python tools/build_data.py dc_daiphuc.geojson 8_Thua_khong_Co_BDDC.geojson Bieu_PASDD_Dai_Phuc.xlsx data
```
Danh sách thửa lấy theo sheet TONG_HOP; thửa có cột (12) "Không có" lấy ranh từ file 8 thửa.
Khi 8 thửa được đo đạc, cập nhật lên BĐĐC: sửa cột (11)(12) trong biểu và chạy lại script — thửa tự chuyển sang lớp BĐĐC.

Nếu lớp thửa lệch nền ảnh, chỉnh hằng `OFFSET` ở đầu `app.js`.
