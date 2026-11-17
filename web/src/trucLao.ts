/**
 * Ghép thầy **Trúc Lão** (R-HANH-8, V-45, V-80): khung thoại theo tiến độ (`zones/trucLao.ts`) → màn bài từ (`openWordLesson`)
 * / lượt ôn (`openReview`); màn đóng → khung thoại mở lại ở câu "học tiếp" (R-HANH-3, R-ON-5). `main.ts` chỉ gọi vài dòng.
 */
import type { Dialog, DialogChoice } from './zones/dialogs';
import { TRUC_LAO, trucLaoDialog } from './zones/trucLao';
import type { BaiHoc } from './zones/tuVung/bai';
import { baiKeTiep } from './zones/tuVung/tu';

export interface TrucLaoHost {
  /** mã bài đã học (tiến độ mới nhất) */
  learned(): Iterable<string>;
  /** mã từ đến hạn ôn hôm nay */
  due(): readonly string[];
  openLesson(b: BaiHoc): void;
  openReview(due: readonly string[]): void;
  /** mở khung thoại */
  talk(d: Dialog): void;
}

export class TrucLao {
  /** đang mở màn bài / lượt ôn từ Trúc Lão → đóng màn thì mở lại khung thoại */
  private back = false;

  constructor(private readonly host: TrucLaoHost) {}

  /** Khung thoại của Trúc Lão (khác NPC → `undefined`). */
  dialog(npcId: string): Dialog | undefined {
    return npcId === TRUC_LAO ? this.make(false) : undefined;
  }

  handles(c: DialogChoice | undefined): c is DialogChoice {
    return c?.action === 'truc';
  }

  /** Lựa chọn trong khung thoại (gọi sau khi khung đóng). */
  act(c: DialogChoice): void {
    if (c.truc === 'hoc') {
      const b = baiKeTiep(this.host.learned());
      if (!b) return;
      this.back = true;
      this.host.openLesson(b);
    } else if (c.truc === 'on') {
      this.back = true;
      this.host.openReview(this.host.due());
    }
  }

  /** Màn học / ôn vừa đóng và tiến độ đã cập nhật → mở lại khung thoại với lựa chọn mới (R-HANH-8). */
  resume(): void {
    if (!this.back) return;
    this.back = false;
    this.host.talk(this.make(true));
  }

  private make(again: boolean): Dialog {
    return trucLaoDialog({ learned: this.host.learned(), due: this.host.due() }, again);
  }
}
