/**
 * Luống chè (V-46): dải bụi chè xén liền theo bậc ruộng — hình mẫu `design/models/thuc-vat/luong-che.glb` (hedge
 * "Tiny Treats – Pretty Park", CC0, đã nướng màu đỉnh + giảm tam giác bằng `npm run model:thuc-vat`). Mọi đoạn của mọi luống
 * một `InstancedMesh` (1 draw call), vật liệu mềm có gió, pha gió theo toạ độ đỉnh (đoạn nối không hở khe). Màu tô lại theo
 * độ cao từ đặc tả (`teaStyle.colors`): chân tối (bóng nướng) → sườn → mặt hái sáng; giữ phần sáng / tối của gói.
 * Hình nạp sau (Vite gói file vào bản build — offline); va chạm đăng ký ngay lúc dựng.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { Colliders } from '../collision/colliders';
import type { LookSpec } from './look';
import { teaBox, teaSegments, type TeaSegment } from './luongCheLayout';
import { softMaterial } from './materials';
import { markDynamic } from './merge';
import { seededRandom } from './random';
import type { TeaRowSpec, TeaStyle } from './spec';
import { bakeTransforms } from './staticModel';
import type { GroundY } from './terrainHeight';

const MODELS = import.meta.glob('../../../design/models/thuc-vat/*.glb', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const MODEL_URL = MODELS['../../../design/models/thuc-vat/luong-che.glb'] ?? null;

/** Chiều dài hình mẫu sau chuẩn hoá (m) — cao 1, ngang 1; instance co giãn về số đo thật (gần 1 nên gió không phóng to). */
const L0 = 4;
/** chìm chân xuống đất một chút để không lộ khe trên đất hơi gồ */
const SINK = 0.05;

export interface TeaRows {
  mesh: THREE.InstancedMesh;
  segments: (TeaSegment & { y: number })[];
}

/** Chuẩn hoá hình: dài `L0` theo x, cao 1, ngang 1, chân ở y = 0; tô màu theo độ cao × độ sáng gốc của gói. */
export function shapeTeaGeometry(src: THREE.BufferGeometry, colors: TeaStyle['colors']): THREE.BufferGeometry {
  const geo = src.clone();
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  const size = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  geo.translate(-c.x, -box.min.y, -c.z);
  geo.scale(L0 / (size.x || 1), 1 / (size.y || 1), 1 / (size.z || 1));
  geo.deleteAttribute('normal');
  geo.computeVertexNormals();
  const pos = geo.getAttribute('position');
  const nor = geo.getAttribute('normal');
  const old = geo.getAttribute('color');
  // độ sáng gốc từng đỉnh so với trung bình (giữ vân sáng tối của gói, ±15 %)
  const lum = Array.from({ length: pos.count }, (_, i) => (old ? (old.getX(i) + old.getY(i) + old.getZ(i)) / 3 : 1));
  const mean = lum.reduce((a, b) => a + b, 0) / (lum.length || 1) || 1;
  const [foot, side, top] = colors.map((h) => new THREE.Color(h));
  const out = new Float32Array(pos.count * 3);
  const col = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // màu búp non chỉ ở mặt hái (pháp tuyến hướng lên); sườn đứng giữ lục sẫm tới gần mép trên
    const t = Math.min(1, y * 0.75 + Math.max(0, nor.getY(i)) * 0.35);
    if (t < 0.5) col.copy(foot).lerp(side, t / 0.5);
    else col.copy(side).lerp(top, (t - 0.5) / 0.5);
    col.multiplyScalar(Math.min(1.15, Math.max(0.85, lum[i] / mean)));
    col.toArray(out, i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(out, 3));
  return geo;
}

/** Hình dự phòng khi thiếu / nạp lỗi model: hộp bo tròn thô (vẫn đúng chỗ, đúng màu). */
function fallbackGeometry(colors: TeaStyle['colors']): THREE.BufferGeometry {
  const g = new THREE.CapsuleGeometry(0.5, L0 - 1, 3, 6).rotateZ(Math.PI / 2);
  g.deleteAttribute('uv');
  return shapeTeaGeometry(g, colors);
}

async function loadTeaGeometry(url: string, colors: TeaStyle['colors']): Promise<THREE.BufferGeometry> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const meshes = bakeTransforms(gltf.scene);
  if (!meshes.length) throw new Error('luong-che.glb: không có lưới');
  return shapeTeaGeometry(meshes[0].geometry, colors);
}

/**
 * Dựng mọi luống: một InstancedMesh (đoạn mẫu chồng mép, sáng tối lệch ±6 % từng đoạn), hộp va chạm mỗi luống (thấp, không
 * che camera — như lan can). `groundY`: chân đoạn đặt theo mặt đất ở tâm đoạn.
 */
export function addTeaRows(scene: THREE.Scene, colliders: Colliders, rows: TeaRowSpec[], st: TeaStyle, look: LookSpec, groundY: GroundY = () => 0): TeaRows {
  const segments = rows.flatMap((r) => teaSegments(r, st)).map((s) => ({ ...s, y: groundY(s.x, s.z) }));
  const mat = softMaterial(look.wrap, THREE.FrontSide, { amp: look.wind * st.wind, tip: 0.8, world: true });
  const mesh = new THREE.InstancedMesh(new THREE.BufferGeometry(), mat, segments.length);
  const rand = seededRandom(segments.length * 131 + 7);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const tint = new THREE.Color();
  segments.forEach((s, i) => {
    // lật ngẫu nhiên đầu đuôi (gợn mặt trên không lặp đều)
    const flip = rand() < 0.5 ? Math.PI : 0;
    q.setFromAxisAngle(up, (s.alongX ? 0 : Math.PI / 2) + flip);
    m.compose(new THREE.Vector3(s.x, s.y - SINK, s.z), q, new THREE.Vector3(s.length / L0, s.height + SINK, s.width));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, tint.setScalar(0.94 + rand() * 0.12));
  });
  for (const r of rows) {
    const b = teaBox(r, st);
    colliders.add(b.x, b.z, b.w, b.d);
  }
  markDynamic(mesh); // hình nạp sau — không gộp
  scene.add(mesh);
  const use = (g: THREE.BufferGeometry): void => {
    mesh.geometry.dispose();
    mesh.geometry = g;
    mesh.computeBoundingSphere();
  };
  if (!MODEL_URL) use(fallbackGeometry(st.colors));
  else if (typeof window !== 'undefined')
    loadTeaGeometry(MODEL_URL, st.colors)
      .then(use)
      .catch((e: unknown) => {
        console.warn('luống chè: nạp design/models/thuc-vat/luong-che.glb lỗi — dùng hình dự phòng', e);
        use(fallbackGeometry(st.colors));
      });
  return { mesh, segments };
}
