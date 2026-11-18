/**
 * Ghép ngày đêm (kế hoạch docs/tasks/2026-11-14-ngay-dem.md, NV8; R-NGAY-1…3): đồng hồ giờ Việt Nam → pha → áp lên cảnh
 * (`world.dayNight`, `scene/apGio.ts`) + tối mép màn. Đọc đồng hồ mỗi ~5 s (tua nhanh `?toc=` thì mỗi khung); chỉ áp lại
 * khi trạng thái lệch > 0,005 — những lúc đứng yên giữa ngày / giữa đêm không tốn gì. App về từ nền (vòng lặp dừng rồi
 * chạy lại) → lần gọi đầu đã quá 5 s nên áp ngay giờ hiện tại (R-NGAY-2). Trong nhà ban đêm sáng vàng ấm, chuyển 0,5 s.
 * Thử: `?gio=21` ép giờ · `?gio=17&toc=60` 1 phút thật = 1 giờ.
 */
import type { DayNight } from './scene/apGio';
import { docEpGio, gioLuc, gioVN, lechPha, nhanGio, phaNgay, TEN_PHA, tronMau, tronSo, type EpGio, type PhaNgay } from './scene/ngayDem';
import type { SceneSpec } from './scene/spec';
import { setVignette } from './ui/vignette';

const CHECK_MS = 5000;
const SCAN_MS = 2000;
const INDOOR_SECONDS = 0.5;

export class NgayDem {
  private readonly ep: EpGio;
  private readonly start = Date.now();
  private lastCheck = -Infinity;
  private lastScan = 0;
  private applied: PhaNgay | null = null;
  private indoor = 0;
  private appliedIndoor = -1;
  private gio = 12;

  constructor(
    private readonly dn: DayNight | null,
    private readonly spec: SceneSpec,
    params: URLSearchParams,
    private readonly vignette: HTMLElement | null,
  ) {
    this.ep = docEpGio(params);
    this.update(0, false); // khung đầu đã đúng giờ (R-NGAY-2)
  }

  /** giờ trong game đặt tay (thanh trượt Canvas 3D) — bỏ đồng hồ */
  private manual: number | null = null;

  setHour(gio: number | null): void {
    this.manual = gio;
    this.lastCheck = -Infinity;
  }

  /** cảnh có bật ngày đêm không */
  get enabled(): boolean {
    return !!this.dn;
  }

  /** "21:04 đêm" cho bảng gỡ lỗi; tắt ngày đêm → rỗng */
  get label(): string {
    return this.dn ? `${nhanGio(this.gio)} ${TEN_PHA[phaNgay(this.gio, this.spec.dayNight.moc).pha]}` : '';
  }

  update(dt: number, indoor: boolean): void {
    if (!this.dn) return;
    const now = performance.now();
    const fast = this.ep.toc > 1;
    let p = this.applied;
    if (!p || fast || this.manual !== null || now - this.lastCheck >= CHECK_MS) {
      this.lastCheck = now;
      this.gio = this.manual ?? gioLuc(this.ep, this.start, Date.now(), this.spec.dayNight.gioCoDinh);
      p = phaNgay(this.gio, this.spec.dayNight.moc);
      this.dn.hour(this.gio); // bướm, sương sớm theo giờ (V-46)
    }
    // trong nhà / ngoài sân: chuyển mượt 0,5 s
    const target = indoor ? 1 : 0;
    if (this.indoor !== target) this.indoor = target > this.indoor ? Math.min(1, this.indoor + dt / INDOOR_SECONDS) : Math.max(0, this.indoor - dt / INDOOR_SECONDS);
    if (dt === 0) this.indoor = target;
    const changed = !this.applied || lechPha(this.applied, p) > 0.005 || Math.abs(this.indoor - this.appliedIndoor) > 0.005;
    if (changed) {
      this.dn.apply(p, this.indoor);
      this.applied = p;
      this.appliedIndoor = this.indoor;
      if (this.vignette) {
        const l = this.spec.look;
        setVignette(this.vignette, tronSo(l.vignette, this.spec.dayNight.dem.vignette, p.dem), tronMau(l.vignetteColor, this.spec.dayNight.dem.vignetteColor, p.dem));
      }
    }
    // model nạp sau (nhân vật, NPC, cổng AI, đồ trang trí) → tìm vật liệu mới, áp màu đêm hiện tại
    if (now - this.lastScan >= SCAN_MS) {
      this.lastScan = now;
      this.dn.scan();
    }
  }
}

/** Thanh trượt giờ 0–24 của Canvas 3D (`designPreview.ts`): kéo → cảnh đổi ngay; nhãn giờ + pha. */
export function hourSlider(nd: NgayDem, slider: HTMLInputElement, label: HTMLElement, params: URLSearchParams): void {
  const g0 = Number(params.get('gio'));
  slider.value = String(params.has('gio') && Number.isFinite(g0) ? g0 : gioVN(Date.now()));
  slider.disabled = !nd.enabled;
  const show = (): void => {
    label.textContent = nd.enabled ? nd.label : 'Cảnh chưa bật ngày đêm (dayNight.enabled)';
  };
  slider.addEventListener('input', () => {
    nd.setHour(Number(slider.value));
    nd.update(0, false);
    show();
  });
  show();
}
