/**
 * Vào nhà chính bằng chạm (R-NHA-1, V-96 — người dùng 2026-11-16: "phải nhấn vào nhà thì mới vào chứ không tự vào"). File ghép
 * (gốc `web/src/`): cửa nhà chính là cổng bấm nút có vòng sáng nhỏ (`PortalSpec.ring`) — đứng trong vòng thì nút "Vào nhà"
 * (`ui/exitButton.ts`, cùng nút "Ra sân") lo; file này lo **chạm vào nhà** (mái / tường / cửa — hộp bao `World.closedHouses`):
 * đang đứng trong vòng → vào ngay; ở xa → nhân vật tự đi tới tâm vòng (`PlayerController.walkTo`) rồi vào; đẩy joystick /
 * phím, ngồi, nhảy giữa đường → huỷ (walkTo tự báo), không vào.
 */
import type * as THREE from 'three';
import { portalCenter, portalContains } from './scene/portals';
import type { PortalSpec } from './scene/spec';

/** Phần của `PlayerController` cần dùng. */
export interface DoorWalker {
  position: { x: number; z: number };
  walkTo(x: number, z: number, faceX: number, faceZ: number, onArrive: () => void, onCancel?: () => void): boolean;
}

/** Nhà cách tâm vòng quá bấy nhiêu mét (mép hộp bao) thì không coi là cửa của vòng đó. */
const DOOR_NEAR = 3;

export interface HouseDoorDeps {
  /** cổng cửa nhà (bấm nút, có `ring`) */
  door: Pick<PortalSpec, 'area' | 'ring' | 'scene'>;
  /** hộp bao nhà có cửa đó (toạ độ cảnh) */
  box: THREE.Box3;
  player: DoorWalker;
  /** sang gian trong (màn tải "Trong nhà") */
  enter: (to: string) => void;
  /** đang bận (ngồi, trang trí, làm vườn, đang đổi cảnh…) → chạm nhà không làm gì */
  busy: () => boolean;
}

export class HouseDoor {
  private going = false;

  constructor(private readonly d: HouseDoorDeps) {}

  /**
   * Cửa nhà chính của cảnh: cổng bấm nút có `ring` + nhà kín có hộp bao sát vòng đó. Không có (cảnh khác, đặc tả cũ) → `null`.
   */
  static find(
    portals: readonly PortalSpec[],
    houses: readonly { box: THREE.Box3 }[],
    deps: Omit<HouseDoorDeps, 'door' | 'box'>,
  ): HouseDoor | null {
    for (const door of portals) {
      if (door.via !== 'nut' || !door.ring) continue;
      const c = portalCenter(door);
      const house = houses.find((h) => boxGap(h.box, c.x, c.z) <= DOOR_NEAR);
      if (house) return new HouseDoor({ ...deps, door, box: house.box });
    }
    return null;
  }

  get box(): THREE.Box3 {
    return this.d.box;
  }

  /** đang tự đi tới vòng để vào */
  get walking(): boolean {
    return this.going;
  }

  /** Chạm trúng nhà. Trả `true` khi đã nhận (vào ngay / bắt đầu tự đi). */
  tapHouse(): boolean {
    const { door, player } = this.d;
    if (this.d.busy()) return false;
    const { x, z } = player.position;
    if (portalContains(door, x, z)) {
      this.enter();
      return true;
    }
    const c = portalCenter(door);
    const { min, max } = this.d.box;
    // tới tâm vòng thì quay mặt vào nhà
    this.going = player.walkTo(
      c.x,
      c.z,
      (min.x + max.x) / 2,
      (min.z + max.z) / 2,
      () => {
        this.going = false;
        if (!this.d.busy()) this.enter();
      },
      () => (this.going = false),
    );
    return this.going;
  }

  private enter(): void {
    this.going = false;
    this.d.enter(this.d.door.scene);
  }
}

/** Khoảng cách mặt đất từ (x, z) tới hộp (0 = trong hộp). */
function boxGap(b: THREE.Box3, x: number, z: number): number {
  return Math.hypot(Math.max(b.min.x - x, 0, x - b.max.x), Math.max(b.min.z - z, 0, z - b.max.z));
}

/** Chạm có trúng nhà không: tia trúng hộp nhà và không có mặt đất chắn trước (đồi / sân gần camera hơn). */
export function tapHitsHouse(houseDist: number | null, groundDist: number | null): boolean {
  return houseDist !== null && (groundDist === null || houseDist <= groundDist);
}
