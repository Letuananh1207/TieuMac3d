# Bối cảnh công phu 6 vùng hành trình
- Yêu cầu: "hiện nay bối cảnh cho các vùng đất từ rừng trúc trở đi đang đơn giản tôi muốn công phu hơn hãy phối hợp
  với skill khao-cuu để làm, ngoài ra mục tiêu của tôi là các vùng đất có nhiều nét riêng, khu giao lưu, trò chơi
  (xoay quanh tiếng trung và chữ hán) để người dùng trải nghiệm"
- Đã chọn (người dùng 2026-11-14): hướng khuyên của cả 6 hồ sơ · chữ trò chơi giản thể kèm phồn nhỏ · **làm bối cảnh cả
  6 vùng trước**, trò chơi sau.
- Loại: thêm (kiểu vật / trường đặc tả mới) + thiết kế cảnh (làm thay `/canh`) · Cỡ: lớn · Trạng thái: đang làm (6 mốc xong, chờ duyệt + "chốt")

Hồ sơ (nguồn số đo, màu, toạ độ): `docs/tham_khao/{rung-truc,giang-nam,bong-lai,truong-thanh,tu-cam-thanh,to-lua}.md`,
mục "Bố cục", "Dựng low-poly", "Đưa vào cảnh".

## Phạm vi đợt này (bối cảnh)
**Làm**: đặc tả `design/scene/<vùng>.json` theo hồ sơ + kiểu vật / trường mới trong `web/src/scene/` (mặc định giữ cảnh
cũ) + khu giao lưu ở dạng **cảnh** (sân, bàn, chỗ ngồi, vật) — chưa có trò.
**Để đợt sau** (kế hoạch riêng, mỗi trò cần sổ quy tắc + phiếu giao diện + dữ liệu): trò chơi, NPC mới, thẻ kể chuyện,
âm thanh, người chơi ngồi thuyền, hang vào được, chế độ Tết, dữ liệu HSK 3–9.

**Sẽ sửa**: `web/src/scene/{spec,specCheck,props,vat_vung,world,walls,bridges,water,trees,buildings,terrain*}.ts`,
`kien_truc/*` (kiểu nhà / mái mới), file mới theo nhóm (vd. `vat_tho.ts` đất nện, `ven_song.ts` bến / lang bồng,
`cung_dien.ts` lan can / ngự lộ / thú nóc) — giữ mỗi file < 400 dòng; `design/scene/*.json` 6 vùng;
`.claude/skills/canh/references/truong-dac-ta.md`; Bản đồ tính năng `/lead`.
**Cần kiểm tra**: `collision/ground.ts` (mặt tường đi được, bậc bến), `merge.ts`, `signAtlas.ts` (chỗ trống cho chữ),
`check-scene.mjs`, ngân sách mỗi vùng ≤ 150 draw call / 150k tam giác.
**Không đụng**: `scene.json` tông môn, app Flutter, cầu nối, HUD.

## Luật bị chạm (sửa sổ trước khi code phần đó)
- R-VA-1/2: mặt tường Trường Thành đi được + mã đạo; bậc bến Giang Nam đứng được; cầu tàu Bồng Lai; lan can đá.
- R-NGOI-1: chỗ ngồi mới (ghế lang bồng, bồ đoàn khúc thuỷ, đôn mặt tường) — nếu cho ngồi.
- R-VUNG-1: khói phong hoả / chén trôi chỉ là cảnh chung, giống mọi người.

## Nhiệm vụ (mỗi vùng một mốc — xong vùng nào đăng Canvas 3D + ảnh, người dùng duyệt rồi sang vùng sau)
- [x] 0. Dùng chung: atlas chữ cho bia thơ / câu đối / biển (`steles[].text` hoặc `bien`), lửa trại `lua-trai`,
      ngựa `ngua`, phong hoả đài `phong-hoa`, đèn lồng giấy treo — làm khi vùng đầu tiên cần.
- [x] 1. **Rừng trúc** (Lan Đình nhã tập): mương khúc thuỷ uốn khúc + chén trôi (`channels`), Trúc Xá mái tranh,
      Vọng Trúc Đài (bục + bậc + đình), rào trúc, giá phơi thẻ, đèn trúc, đá khắc 曲水流觴, ao ngỗng, lá rơi.
- [x] 2. **Giang Nam** (thuỷ trấn mưa bụi): kênh 8 m mặt nước thấp hơn phố (`riverbanks`), bậc xuống nước (`docks`),
      hiên lang bồng (`langPeng`), thuyền neo / thuyền hàng, Song Kiều + cầu lỗ vuông, thuỷ các, vệt ẩm tường, giàn đèn
      đố / vò rượu / chậu sen / sào phơi; ánh chiều + sương.
- [x] 3. **Bồng Lai** (tam thần sơn): vách Đan Nhai đỏ + bục cao, Bồng Lai Các 2 tầng (`cac`), cây đào `dao`, ba đảo
      nối cầu treo, cầu tàu ra mây (`pier`), thành ảo (`mirage`), pháp bảo Bát Tiên, thuyền Từ Phúc, cự ngao, hạc / hươu
      trắng, đảo nổi có cỏ; sân Bàn Đào Yến.
- [x] 4. **Trường Thành** (quan ải Yên Sơn): địch lâu vuông, cổng quan thành rời + ung thành, mặt tường đi được một đoạn
      + mã đạo, phong hoả đài trên đỉnh, Long Đầu ra biển mây, tường xám xanh dày, lều / soái trướng / lửa trại, ngựa,
      bụi lá thu, Thi Bích; sân Mã Thị.
- [x] 5. **Tử Cấm Thành** (trục khoa cử): mở rộng `walls.half` 60, Tam Đài 3 bục + lan can đá trắng, ngự lộ chạm rồng,
      mái vũ điện hiên kép, Ngọ Môn chữ 凹, thú nóc, 5 cầu Kim Thuỷ, Văn Uyên Các, Ngự Hoa Viên, sư tử đồng, khảo án,
      giá sách, câu đối, Kim Bảng; sửa Văn Hoa (đông) / Võ Anh (tây).
- [x] 6. **Con đường tơ lụa** (ốc đảo Thịnh Đường): cồn cát sống sắc (`dunes`), hồ lưỡi liềm + lau sậy, vách Mạc Cao
      nhiều tầng hang + sạn đạo, Cửu Tầng Lâu áp vách (`lau-vach`), đất nện (tường, nhà mái bằng, cổng Dương Quan),
      đoàn lạc đà đi (`caravans`), lều vải chợ, giá thẻ dịch trạm, bia thơ 渭城曲.
- [ ] 7. Tài liệu trường đặc tả, Bản đồ tính năng, `npm run build`, chốt CHANGELOG + ảnh (khi người dùng nói "chốt").

Mỗi mốc: luật (nếu chạm) → spec + specCheck + test hàm thuần → dựng → đặc tả vùng → `scene:check` → Canvas 3D + ảnh
góc chơi / trên xuống + số draw call / tam giác → báo người dùng.

## Kiểm tra cuối (mỗi mốc)
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build ·
dart tool/rule_trace.dart
