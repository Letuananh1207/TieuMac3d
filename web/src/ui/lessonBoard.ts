import type { Lesson } from '../zones/zones';
import { el } from './dom';

/** Bảng bài học HTML. Mốc 3 sẽ thay bằng màn hình Flutter native. */
export class LessonBoard {
  private readonly root = el('lesson');

  constructor(onClose: () => void) {
    el('lsClose').addEventListener('click', () => {
      this.root.hidden = true;
      onClose();
    });
  }

  open(l: Lesson): void {
    el('lsHan').textContent = l.han;
    el('lsPy').textContent = l.pinyin;
    el('lsMean').textContent = l.meaning;
    const rows = l.info.flatMap(([k, v]) => {
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      return [dt, dd];
    });
    el('lsInfo').replaceChildren(...rows);
    this.root.hidden = false;
  }
}
