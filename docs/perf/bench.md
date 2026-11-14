# Kết quả đo hiệu năng tự động (`npm run bench`)

So TRƯỚC / SAU trên cùng máy — không thay đo máy thật.

## Bench 2026-11-14 03:16

### GPU máy tính — tải 1.7 s · AMD, AMD Radeon(TM) Graphics (0x00001900) Direct · 1.5× · 585×1266

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 120 | 8.3 | 13 | 0.0 | 53 | 125k |
| Đi + rẽ (W + D) | 120 | 8.3 | 24 | 0.0 | 38 | 120k |
| Đi thẳng xa (W) | 120 | 8.3 | 9 | 0.0 | 26 | 115k |
| Zoom ra cả sân | 120 | 8.3 | 9 | 0.0 | 28 | 115k |

### Máy yếu (SwiftShader + CPU ×4) — tải 2.5 s · Google, Vulkan 1.3.0 (SwiftShader Device (Subzer · 1.5× · 585×1266

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 10 | 105.3 | 139 | 18.4 | 53 | 125k |
| Đi + rẽ (W + D) | 13 | 78.8 | 282 | 20.5 | 50 | 123k |
| Đi thẳng xa (W) | 13 | 78.9 | 223 | 22.6 | 28 | 115k |
| Zoom ra cả sân | 15 | 66.5 | 90 | 29.2 | 28 | 115k |

## Bench 2026-11-14 03:23

### GPU máy tính — tải 1.6 s · AMD, AMD Radeon(TM) Graphics (0x00001900) Direct · 1.5× · 585×1266

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 120 | 8.3 | 15 | 0.0 | 65 | 80k |
| Đi + rẽ (W + D) | 120 | 8.3 | 22 | 0.0 | 48 | 56k |
| Đi thẳng xa (W) | 120 | 8.3 | 9 | 0.0 | 35 | 49k |
| Zoom ra cả sân | 120 | 8.3 | 9 | 0.0 | 38 | 50k |

### Máy yếu (SwiftShader + CPU ×4) — tải 2.8 s · Google, Vulkan 1.3.0 (SwiftShader Device (Subzer · 1.5× · 585×1266

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 11 | 94.6 | 196 | 20.4 | 65 | 80k |
| Đi + rẽ (W + D) | 15 | 67.5 | 196 | 24.7 | 63 | 93k |
| Đi thẳng xa (W) | 13 | 74.3 | 154 | 24.9 | 36 | 49k |
| Zoom ra cả sân | 16 | 61.9 | 136 | 26.9 | 38 | 50k |

## Bench 2026-11-14 03:43

### GPU máy tính — tải 1.6 s · AMD, AMD Radeon(TM) Graphics (0x00001900) Direct · Cao 1.5× · 585×1266

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 120 | 8.3 | 30 | 0.0 | 65 | 80k |
| Đi + rẽ (W + D) | 120 | 8.3 | 10 | 0.0 | 47 | 57k |
| Đi thẳng xa (W) | 120 | 8.3 | 12 | 0.0 | 35 | 49k |
| Zoom ra cả sân | 120 | 8.3 | 9 | 0.0 | 38 | 50k |

### Máy yếu (SwiftShader + CPU ×4) — tải 2.8 s · Google, Vulkan 1.3.0 (SwiftShader Device (Subzer · Thấp 0.7× · 273×590

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 34 | 29.3 | 113 | 0.8 | 65 | 80k |
| Đi + rẽ (W + D) | 50 | 20.6 | 125 | 2.4 | 50 | 73k |
| Đi thẳng xa (W) | 57 | 17.5 | 51 | 0.3 | 28 | 45k |
| Zoom ra cả sân | 59 | 16.9 | 52 | 0.3 | 26 | 43k |

## Bench 2026-11-14 03:51

### GPU máy tính — tải 1.6 s · AMD, AMD Radeon(TM) Graphics (0x00001900) Direct · Cao 1.5× · 60 fps · 585×1266

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 60 | 16.7 | 18 | 0.0 | 65 | 80k |
| Đi + rẽ (W + D) | 60 | 16.7 | 23 | 0.0 | 47 | 57k |
| Đi thẳng xa (W) | 60 | 16.7 | 18 | 0.0 | 28 | 45k |
| Zoom ra cả sân | 60 | 16.7 | 23 | 0.0 | 26 | 43k |

### Máy yếu (SwiftShader + CPU ×4) — tải 3.0 s · Google, Vulkan 1.3.0 (SwiftShader Device (Subzer · Thấp 0.7× · 30 fps · 273×590

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 39 | 26.2 | 113 | 0.6 | 65 | 80k |
| Đi + rẽ (W + D) | 30 | 33.3 | 99 | 0.6 | 47 | 57k |
| Đi thẳng xa (W) | 30 | 33.5 | 58 | 0.2 | 35 | 49k |
| Zoom ra cả sân | 30 | 33.3 | 35 | 0.0 | 38 | 50k |

