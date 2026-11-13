/**
 * Trận sư 陣師 đọc tiến độ (R-NPC-5): số chữ / bộ thủ đã học, vùng đi được (đã có cảnh) và vùng sắp mở (chưa có cảnh).
 * Không nói chuyện khoá vùng — vùng không khoá theo tiến độ học (R-HANH-1). Thuần — `main.ts` đưa tiến độ
 * (`getProgress`), `JOURNEY_MAP.places` (thứ tự hành trình) và tập vùng đã có cảnh.
 */

export interface LearnedCount {
  chars: number;
  /** số bộ thủ đã học */
  radicals: number;
}

/** Câu trận sư nói. `p` null = không có tiến độ (trình duyệt không có Flutter) → bỏ phần đã học. `home` = mã nơi tông môn. */
export function journeyLine(
  p: LearnedCount | null,
  places: readonly { id: string; ten: string }[],
  hasScene: ReadonlySet<string>,
  home = 'van-uyen',
): string {
  const regions = places.filter((pl) => pl.id !== home);
  const ready = regions.filter((pl) => hasScene.has(pl.id)).map((pl) => pl.ten);
  const soon = regions.filter((pl) => !hasScene.has(pl.id)).map((pl) => pl.ten);
  const head = p ? `Đạo hữu đã học ${p.chars} chữ, ${p.radicals} bộ thủ. ` : '';
  const go = ready.length ? `Trận đồ đã sáng: ${ready.join(', ')} — bước vào vòng trận là đi được.` : 'Trận đồ chưa sáng nút nào.';
  const later = soon.length ? ` Sắp mở: ${soon.join(', ')}.` : ' Các vùng đều đã mở cho đạo hữu.';
  return head + go + later;
}
