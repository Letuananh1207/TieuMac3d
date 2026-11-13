/**
 * Trận sư 陣師 đọc tiến độ hành trình (R-NPC-5): số chữ / bộ thủ đã học, vùng còn khoá đầu tiên theo thứ tự hành trình
 * (thứ tự `places` của bản đồ) và còn thiếu bao nhiêu. Thuần — `main.ts` đưa tiến độ (`getProgress`) + `JOURNEY_MAP.places`.
 */

export interface JourneyCount {
  chars: number;
  /** số bộ thủ đã học */
  radicals: number;
  /** mốc của vùng còn khoá (docs/bridge.md `getProgress.need`) */
  need: Record<string, { chars?: number; radicals?: number }>;
}

/** Câu trận sư nói. `null` = không có tiến độ (trình duyệt không có Flutter) → câu chung. */
export function journeyLine(p: JourneyCount | null, places: readonly { id: string; ten: string }[]): string {
  if (!p) {
    return 'Rừng trúc mở sẵn cho người mới. Học đủ bộ thủ ở Rừng trúc thì Giang Nam mở; từ đó cứ học thêm chữ, mỗi mốc lại mở một vùng xa hơn.';
  }
  const head = `Đạo hữu đã học ${p.chars} chữ, ${p.radicals} bộ thủ.`;
  const next = places.find((pl) => p.need[pl.id]);
  if (!next) return `${head} Trận đồ đã sáng hết — các vùng đều đã mở cho đạo hữu.`;
  const need = p.need[next.id];
  if (need.radicals !== undefined) {
    const left = Math.max(0, need.radicals - p.radicals);
    return `${head} Vùng kế tiếp là ${next.ten}: cần đủ ${need.radicals} bộ thủ — còn thiếu ${left} bộ.`;
  }
  const want = need.chars ?? 0;
  return `${head} Vùng kế tiếp là ${next.ten}: cần ${want} chữ — còn thiếu ${Math.max(0, want - p.chars)} chữ.`;
}
