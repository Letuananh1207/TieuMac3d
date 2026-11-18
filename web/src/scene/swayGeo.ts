/**
 * Gom hình lay theo gió (dải lụa, ống chuông gió — V-113) vào MỘT lưới màu theo đỉnh, mỗi đỉnh mang trọng số `aSway`
 * (0 = đứng yên … 1 = lay hết biên độ) cho `softMaterial(…, { sway: true })` — gió chạy trong vertex shader, không cập nhật
 * CPU, 1 draw call. Toạ độ thế giới (lưới đặt ở gốc cảnh).
 */
import * as THREE from 'three';

export class SwayBuilder {
  private readonly pos: number[] = [];
  private readonly nrm: number[] = [];
  private readonly col: number[] = [];
  private readonly sway: number[] = [];

  private vert(p: THREE.Vector3, n: THREE.Vector3, c: THREE.Color, s: number): void {
    this.pos.push(p.x, p.y, p.z);
    this.nrm.push(n.x, n.y, n.z);
    this.col.push(c.r, c.g, c.b);
    this.sway.push(s);
  }

  private tri(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, n: [THREE.Vector3, THREE.Vector3, THREE.Vector3], color: THREE.Color, s: [number, number, number]): void {
    this.vert(a, n[0], color, s[0]);
    this.vert(b, n[1], color, s[1]);
    this.vert(c, n[2], color, s[2]);
  }

  /** Dải mỏng theo đường `pts`, nửa bề rộng `half` (bề rộng nằm theo phương gần thẳng đứng, vuông góc đường); `swayAt(u)` u 0…1. */
  strip(pts: THREE.Vector3[], half: number, color: string, swayAt: (u: number) => number): void {
    const c = new THREE.Color(color);
    const up = new THREE.Vector3(0, 1, 0);
    const edges = pts.map((p, i) => {
      const tan = pts[Math.min(i + 1, pts.length - 1)].clone().sub(pts[Math.max(i - 1, 0)]).normalize();
      let w = up.clone().addScaledVector(tan, -up.dot(tan));
      if (w.lengthSq() < 1e-6) w = new THREE.Vector3(1, 0, 0);
      w.normalize();
      const n = tan.clone().cross(w).normalize();
      return { a: p.clone().addScaledVector(w, half), b: p.clone().addScaledVector(w, -half), n, s: swayAt(i / (pts.length - 1)) };
    });
    for (let i = 0; i < edges.length - 1; i++) {
      const e = edges[i];
      const f = edges[i + 1];
      this.tri(e.a, e.b, f.b, [e.n, e.n, f.n], c, [e.s, e.s, f.s]);
      this.tri(e.a, f.b, f.a, [e.n, f.n, f.n], c, [e.s, f.s, f.s]);
    }
  }

  /** Ống treo: miệng trên tâm `top`, dài `len` xuống dưới, bán kính `r`; lay `s0` ở đỉnh → `s1` ở đáy. */
  hangingTube(top: THREE.Vector3, r: number, len: number, color: string, s0: number, s1: number, seg = 6): void {
    const c = new THREE.Color(color);
    const bottom = top.clone().add(new THREE.Vector3(0, -len, 0));
    const down = new THREE.Vector3(0, -1, 0);
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      const n0 = new THREE.Vector3(Math.sin(a0), 0, Math.cos(a0));
      const n1 = new THREE.Vector3(Math.sin(a1), 0, Math.cos(a1));
      const t0 = top.clone().addScaledVector(n0, r);
      const t1 = top.clone().addScaledVector(n1, r);
      const b0 = bottom.clone().addScaledVector(n0, r);
      const b1 = bottom.clone().addScaledVector(n1, r);
      this.tri(t0, b0, b1, [n0, n0, n1], c, [s0, s1, s1]);
      this.tri(t0, b1, t1, [n0, n1, n1], c, [s0, s1, s0]);
      this.tri(bottom, b1, b0, [down, down, down], c, [s1, s1, s1]);
    }
  }

  get empty(): boolean {
    return this.pos.length === 0;
  }

  mesh(material: THREE.Material): THREE.Mesh {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    geo.setAttribute('aSway', new THREE.Float32BufferAttribute(this.sway, 1));
    return new THREE.Mesh(geo, material); // lay ≤ 0,5 m — hộp bao tĩnh đủ dùng cho cắt khung nhìn
  }
}
