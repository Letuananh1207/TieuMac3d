import * as THREE from 'three';
import { lambert } from '../scene/materials';
import type { Character } from './character';

/**
 * Màu đệ tử ngoại môn theo bản mẫu `design/source/PhongCach-CayNhanVat.dc.html`. Nhân vật không thuộc cảnh nên màu
 * để ở đây (như gấu khối), không ở `scene.json`. Áo theo bậc (nội môn…) để đợt 2.
 */
const DEFAULT_COLOR = {
  robe: '#dce8ee',
  trim: '#3f5fa0',
  skin: '#f3dcc4',
  hair: '#1f1a1a',
  gold: '#d4a64a',
  jade: '#4caf7a',
  shoe: '#2b2b33',
  eye: '#1a120c',
};

function mesh(geo: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, lambert(color));
  m.position.set(x, y, z);
  return m;
}

/**
 * Đệ tử chibi (đầu ≈ 1/2,3 chiều cao ~1,8 m): tóc búi cài trâm vàng, dải buộc tóc lam bay sau, đạo bào cổ giao lĩnh
 * (vạt phải đè trái), đai lam, ngọc bội lục, tay áo rộng rủ. Không xương: thân nhún khi đi, tay áo + dải tóc đung đưa.
 */
/** Bảng màu nhân vật; đổi một phần để làm người khác (vd. thầy áo xà lam) cùng dáng. */
export type DiscipleColors = Partial<typeof DEFAULT_COLOR>;

export function createDiscipleCharacter(colors: DiscipleColors = {}): Character {
  const COLOR = { ...DEFAULT_COLOR, ...colors };
  const root = new THREE.Group();
  const body = new THREE.Group(); // xoay theo hướng đi
  const bob = new THREE.Group(); // nhún lên xuống
  root.add(body);
  body.add(bob);

  // áo: vạt dưới loe, thân trên, viền gấu, đai, cổ giao lĩnh, ngọc bội
  bob.add(mesh(new THREE.CylinderGeometry(0.3, 0.52, 0.9, 12), COLOR.robe, 0, 0.47, 0));
  bob.add(mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.07, 12), COLOR.trim, 0, 0.05, 0));
  bob.add(mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.36, 12), COLOR.robe, 0, 1.08, 0));
  bob.add(mesh(new THREE.CylinderGeometry(0.315, 0.315, 0.1, 12), COLOR.trim, 0, 0.93, 0));
  for (const [x, rz, z] of [
    [-0.06, 0.55, 0.285],
    [0.07, -0.5, 0.29], // vạt phải đè lên trái: nằm ngoài hơn một chút
  ]) {
    const lapel = mesh(new THREE.BoxGeometry(0.06, 0.34, 0.03), COLOR.trim, x, 1.1, z);
    lapel.rotation.z = rz;
    bob.add(lapel);
  }
  bob.add(mesh(new THREE.SphereGeometry(0.07, 8, 6), COLOR.jade, 0.17, 0.8, 0.27));
  bob.add(mesh(new THREE.BoxGeometry(0.02, 0.14, 0.02), COLOR.trim, 0.17, 0.89, 0.27));

  // đầu, tóc, búi, trâm, mắt
  bob.add(mesh(new THREE.SphereGeometry(0.4, 16, 12), COLOR.skin, 0, 1.58, 0));
  const hair = mesh(new THREE.SphereGeometry(0.42, 16, 12), COLOR.hair, 0, 1.64, -0.07);
  hair.scale.set(1, 0.95, 0.95);
  bob.add(hair);
  bob.add(mesh(new THREE.SphereGeometry(0.17, 10, 8), COLOR.hair, 0, 2.05, -0.06));
  const pin = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5), COLOR.gold, 0, 2.06, -0.06);
  pin.rotation.z = Math.PI / 2;
  bob.add(pin);
  for (const s of [-1, 1]) bob.add(mesh(new THREE.SphereGeometry(0.05, 6, 6), COLOR.eye, 0.14 * s, 1.56, 0.37));

  // dải buộc tóc: gốc ở sau búi, đung đưa và bay ra sau khi đi
  const ribbon = new THREE.Group();
  ribbon.position.set(0, 1.92, -0.47); // sát mặt sau khối tóc (tâm z −0,07, bán kính 0,42)
  for (const s of [-1, 1]) {
    const band = mesh(new THREE.BoxGeometry(0.07, 0.55, 0.02).translate(0, -0.275, 0), COLOR.trim, 0.05 * s, 0, 0);
    band.rotation.z = 0.12 * s;
    ribbon.add(band);
  }
  bob.add(ribbon);

  // tay áo rộng: gốc ở vai, loe xuống, viền lam, bàn tay
  const sleeves: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const sleeve = new THREE.Group();
    sleeve.position.set(0.3 * s, 1.2, 0);
    sleeve.rotation.z = 0.25 * s;
    sleeve.add(mesh(new THREE.CylinderGeometry(0.1, 0.21, 0.56, 10).translate(0, -0.28, 0), COLOR.robe));
    sleeve.add(mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 10), COLOR.trim, 0, -0.56, 0));
    sleeve.add(mesh(new THREE.SphereGeometry(0.07, 8, 6), COLOR.skin, 0, -0.6, 0.04));
    bob.add(sleeve);
    sleeves.push(sleeve);
  }

  // giày thò ra dưới vạt áo, bước so le
  const feet: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const foot = mesh(new THREE.BoxGeometry(0.14, 0.08, 0.24), COLOR.shoe, 0.13 * s, 0.04, 0.12);
    body.add(foot);
    feet.push(foot);
  }

  // bóng giả: đĩa mờ dưới chân, rẻ hơn rất nhiều so với shadow realtime
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  let walkT = 0;
  let time = 0;
  let move = 0; // 0..1, mượt theo tốc độ
  return {
    root,
    facing: body,
    animate(dt, speed) {
      time += dt;
      move += (speed - move) * Math.min(1, dt * 8);
      if (speed > 0.05) walkT += dt * 10 * speed;
      else walkT *= 0.85;
      const step = Math.sin(walkT);
      bob.position.y = Math.abs(step) * 0.06;
      feet[0].position.z = 0.12 + step * 0.14;
      feet[1].position.z = 0.12 - step * 0.14;
      // tay áo vung ngược chân, khi đứng thì rủ nhẹ theo gió
      const idle = Math.sin(time * 1.6) * 0.04;
      sleeves[0].rotation.x = -step * 0.4 * move + idle;
      sleeves[1].rotation.x = step * 0.4 * move - idle;
      // dải tóc: đung đưa, đi nhanh thì bay ra sau
      ribbon.rotation.x = 0.15 + move * 0.7 + Math.sin(time * 3.1) * 0.12; // dương = hất ra sau lưng
      ribbon.rotation.z = Math.sin(time * 2.3) * 0.08;
    },
  };
}
