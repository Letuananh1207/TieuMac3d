/**
 * Phát âm từ trong trang (R-AM-5) — **chuẩn bị cho gđ 2 kế hoạch V-80**: chưa có file âm nên `am` của mọi từ đang `false`
 * → hàm im lặng, không tải gì. Khi có âm (`npm run am` ghi `zones/tuVung/am.ts`), file nằm ở `am/tu/<mã điểm>.mp3` cạnh
 * `index.html` (Flutter phục vụ qua localhost server / web nạp thẳng asset — offline).
 *
 * Một `<audio>` dùng lại: phát âm mới → âm đang phát dừng (mỗi lúc một âm). WebView chặn tiếng khi chưa chạm → giữ âm chờ,
 * phát ở lần chạm kế tiếp (như tiếng mõ R-AM-1). App xuống nền → `dungAm()`.
 */
import { amCauPath, amTuPath } from '../zones/tuVung/am';
import type { Tu } from '../zones/tuVung/tu';

let audio: HTMLAudioElement | null = null;
let pending: string | null = null;
let unlockBound = false;

/** Đường dẫn âm sẽ phát cho từ (hoặc câu ví dụ); chưa có âm → `null` (loa mờ — R-AM-5). Thuần, test được. */
export function amCuaTu(t: Pick<Tu, 'id' | 'am' | 'amCau'>, cau = false): string | null {
  if (cau ? !t.amCau : !t.am) return null;
  return cau ? amCauPath(t.id) : amTuPath(t.id);
}

function play(src: string): void {
  audio ??= new Audio();
  audio.pause();
  audio.src = src;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // bị chặn (chưa chạm) → phát ở lần chạm kế tiếp
    pending = src;
    if (unlockBound) return;
    unlockBound = true;
    window.addEventListener(
      'pointerdown',
      () => {
        unlockBound = false;
        const p = pending;
        pending = null;
        if (p) play(p);
      },
      { once: true },
    );
  });
}

/** Phát âm từ [t] (hoặc câu ví dụ); chưa có âm → không làm gì, trả `false`. */
export function phatTu(t: Pick<Tu, 'id' | 'am' | 'amCau'>, cau = false): boolean {
  const src = amCuaTu(t, cau);
  if (!src) return false;
  play(src);
  return true;
}

/** Dừng âm đang phát (app xuống nền, đóng màn). */
export function dungAm(): void {
  pending = null;
  audio?.pause();
}
