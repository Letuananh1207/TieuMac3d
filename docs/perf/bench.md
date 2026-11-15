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

## Bench 2026-11-14 09:26

### GPU máy tính — tải 1.6 s · AMD, AMD Radeon(TM) Graphics (0x00001900) Direct · Cao 1.5× · 60 fps · 585×1266

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 60 | 16.8 | 31 | 0.0 | 65 | 81k |
| Đi + rẽ (W + D) | 59 | 16.9 | 26 | 0.0 | 49 | 58k |
| Đi thẳng xa (W) | 59 | 17 | 25 | 0.0 | 39 | 55k |
| Zoom ra cả sân | 59 | 17 | 25 | 0.0 | 43 | 57k |

### Máy yếu (SwiftShader + CPU ×4) — tải 3.0 s · Google, Vulkan 1.3.0 (SwiftShader Device (Subzer · Thấp 0.7× · 30 fps · 273×590

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 32 | 32.4 | 110 | 1.0 | 65 | 81k |
| Đi + rẽ (W + D) | 30 | 33.5 | 163 | 2.1 | 51 | 59k |
| Đi thẳng xa (W) | 30 | 33.5 | 70 | 0.2 | 39 | 55k |
| Zoom ra cả sân | 30 | 33.5 | 39 | 0.0 | 43 | 57k |

## Bench 2026-11-14 10:35

### GPU máy tính — tải 1.7 s · AMD, AMD Radeon(TM) Graphics (0x00001900) Direct · Cao 1.5× · 60 fps · 585×1266

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 60 | 16.7 | 23 | 0.0 | 49 | 97k |
| Đi + rẽ (W + D) | 60 | 16.7 | 19 | 0.0 | 47 | 74k |
| Đi thẳng xa (W) | 60 | 16.7 | 23 | 0.0 | 40 | 70k |
| Zoom ra cả sân | 59 | 17 | 26 | 0.0 | 42 | 72k |

### Máy yếu (SwiftShader + CPU ×4) — tải 4.7 s · Google, Vulkan 1.3.0 (SwiftShader Device (Subzer · Thấp 0.7× · 30 fps · 273×590

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 23 | 43.2 | 342 | 5.4 | 47 | 94k |
| Đi + rẽ (W + D) | 25 | 40 | 167 | 2.9 | 53 | 90k |
| Đi thẳng xa (W) | 27 | 37 | 50 | 0.0 | 37 | 68k |
| Zoom ra cả sân | 28 | 35.2 | 43 | 0.0 | 40 | 70k |

## Bench 2026-11-15 04:55 — V-58 TRƯỚC (`trees.crown: "cau"`, tùng / bụi cầu cũ)

### GPU máy tính — tải 1.8 s · AMD, AMD Radeon(TM) Graphics (0x00001900) Direct · Cao 1.5× · 60 fps · 585×1266 · 11:55 ngày

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 60 | 16.8 | 25 | 0.0 | 60 | 102k |
| Đi + rẽ (W + D) | 59 | 17.1 | 25 | 0.0 | 59 | 87k |
| Đi thẳng xa (W) | 59 | 16.9 | 26 | 0.0 | 49 | 78k |
| Zoom ra cả sân | 59 | 17.1 | 25 | 0.0 | 54 | 81k |

### Máy yếu (SwiftShader + CPU ×4) — tải 4.4 s · Google, Vulkan 1.3.0 (SwiftShader Device (Subzer · Thấp 0.7× · 30 fps · 273×590 · 11:55 ngày

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 32 | 33.2 | 198 | 3.2 | 57 | 100k |
| Đi + rẽ (W + D) | 29 | 35.5 | 114 | 1.8 | 56 | 84k |
| Đi thẳng xa (W) | 30 | 33.3 | 60 | 0.1 | 45 | 75k |
| Zoom ra cả sân | 30 | 33.3 | 44 | 0.0 | 51 | 79k |

## Bench 2026-11-15 04:56 — V-58 SAU (`trees.crown: "chum"`, tán chùm + LOD 2 bậc)

### GPU máy tính — tải 1.8 s · AMD, AMD Radeon(TM) Graphics (0x00001900) Direct · Cao 1.5× · 60 fps · 585×1266 · 11:56 ngày

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 59 | 17 | 25 | 0.0 | 60 | 103k |
| Đi + rẽ (W + D) | 59 | 17.1 | 26 | 0.0 | 58 | 90k |
| Đi thẳng xa (W) | 59 | 17.2 | 26 | 0.0 | 49 | 80k |
| Zoom ra cả sân | 60 | 16.9 | 25 | 0.0 | 54 | 84k |

### Máy yếu (SwiftShader + CPU ×4) — tải 4.4 s · Google, Vulkan 1.3.0 (SwiftShader Device (Subzer · Thấp 0.7× · 30 fps · 273×590 · 11:57 ngày

| Chặng | fps | ms tb | 1 % chậm (ms) | khựng / 2 s | draw call | tam giác |
|---|---|---|---|---|---|---|
| Đứng giữa sân | 32 | 33.6 | 211 | 1.9 | 57 | 100k |
| Đi + rẽ (W + D) | 29 | 35 | 142 | 2.3 | 57 | 88k |
| Đi thẳng xa (W) | 30 | 33.3 | 58 | 0.1 | 45 | 78k |
| Zoom ra cả sân | 30 | 33.4 | 39 | 0.0 | 51 | 81k |

