import * as THREE from 'three';
import './style.css';
import { Colliders } from './collision/colliders';
import { Joystick } from './input/joystick';
import { Keyboard } from './input/keyboard';
import { OrbitCamera } from './input/orbitCamera';
import { attachPointerInput } from './input/pointers';
import { GroundPicker } from './input/tapToMove';
import { createDiscipleCharacter } from './player/discipleCharacter';
import { PlayerController, type MoveInput } from './player/controller';
import { SCENE, SCENE_FILE } from './scene/loadSpec';
import { viewDistance } from './scene/farMountains';
import { createStage } from './scene/renderer';
import { inRect, type Room } from './scene/rooms';
import { buildWorld } from './scene/world';
import { el } from './ui/dom';
import { LearnButton } from './ui/learnButton';
import { bindCameraButton, createHint, FpsCounter, NameTag, PlaceChip } from './ui/hud';
import { LessonBoard } from './ui/lessonBoard';
import { AreaTracker } from './zones/areaTracker';
import { ZoneTracker } from './zones/zoneTracker';
import { placeZones, ZONE_CONTENT, type Zone } from './zones/zones';

/** Nhãn tên cao hơn đỉnh búi tóc đệ tử (~2,2 m) một chút. */
const NAME_TAG_HEIGHT = 2.5;

async function boot(): Promise<void> {
  // Biển hiệu vẽ chữ Lora lên canvas, nên phải nạp font trước khi dựng cảnh.
  await Promise.allSettled([document.fonts.load('700 72px Lora'), document.fonts.load('700 13px "Be Vietnam Pro"')]);

  const { spec } = SCENE;
  const canvas = el<HTMLCanvasElement>('stage');
  const { renderer, scene, camera } = createStage(canvas, spec.camera.fov, viewDistance(spec));
  const colliders = new Colliders();
  // nhà nào có nội thất: theo nội dung bài (lớp học / thư viện), chữ phấn trên bảng = chữ của bài
  const interiors = Object.fromEntries(ZONE_CONTENT.map((c) => [c.id, { kind: c.interior, han: c.lesson.han }]));
  const world = buildWorld(scene, colliders, spec, interiors);
  const placed = placeZones(ZONE_CONTENT, world.zoneAnchors);
  const problems = [...SCENE.problems, ...placed.problems];
  if (problems.length) console.warn(`Đặc tả cảnh (${SCENE_FILE}):\n- ${problems.join('\n- ')}`);

  // gấu khối (player/blockCharacter.ts) vẫn giữ làm bản dự phòng, cùng hợp đồng Character
  const character = createDiscipleCharacter();
  character.root.position.set(spec.player.start[0], 0, spec.player.start[1]);
  scene.add(character.root);
  const player = new PlayerController(character, colliders, world.surface);
  player.snapToGround();
  const groundAt = (x: number, z: number): number => world.surface.heightAt(x, z);

  // thầy đứng trên bục giảng (đệ tử áo xà lam, đứng yên)
  for (const room of world.rooms) {
    if (!room.teacher) continue;
    const t = createDiscipleCharacter({ robe: '#3f5fa0', trim: '#2b5446' });
    t.root.position.set(room.teacher.x, room.teacher.y, room.teacher.z);
    t.facing.rotation.y = room.teacher.rotY;
    scene.add(t.root);
  }
  const roomAt = (x: number, z: number): Room | undefined => world.rooms.find((r) => inRect(r.floor, x, z));

  /* ---------- bài học: nút nổi trên vật + chạm vật (R-VUNG-1/2/3) ---------- */
  let paused = false; // đang mở bài học: nhân vật đứng yên
  const zoneById = new Map(placed.zones.map((z) => [z.id, z]));
  const anchorOf = new Map(world.rooms.map((r) => [r.zoneId, r.anchor]));
  const lesson = new LessonBoard(() => {
    paused = false;
    learn.suspend(false);
  });
  const openLesson = (zone: Zone): void => {
    paused = true;
    learn.suspend(true);
    player.moveTarget = null;
    lesson.open(zone.lesson);
  };
  const learn = new LearnButton(openLesson);
  const zones = new ZoneTracker(placed.zones, (z) => learn.setZone(z));

  /* ---------- điều khiển ---------- */
  const orbit = new OrbitCamera(spec.camera);
  const joystick = new Joystick(el('joy'), el('knob'), el('joyGhost'));
  const picker = new GroundPicker(camera, world.ground);
  const hideHint = createHint();
  const keyboard = new Keyboard(hideHint);
  attachPointerInput(canvas, {
    joystick,
    orbit,
    onFirstInput: hideHint,
    onJoystickStart: () => (player.moveTarget = null),
    onTap: (x, y) => {
      if (paused) return;
      // đang trong nhà: chạm trúng vật học của nhà → mở bài (R-VUNG-2)
      const room = roomAt(player.position.x, player.position.z);
      const hit = room ? picker.pickObject(x, y, room.hits) : null;
      const zone = hit ? zoneById.get(hit.userData.zoneId as string) : undefined;
      if (zone) {
        openLesson(zone);
        return;
      }
      const p = picker.pick(x, y);
      if (p) player.moveTarget = p;
    },
  });
  bindCameraButton(() => orbit.toggleView());

  /* ---------- chip: tên nhà (khi đứng trong) ưu tiên hơn tên khu (R-HUD-1) ---------- */
  const chip = new PlaceChip();
  const placeOf = new Map(ZONE_CONTENT.map((c) => [c.id, c.place]));
  const roomAreas = world.rooms.map((r) => ({
    name: placeOf.get(r.zoneId) ?? r.zoneId,
    from: [r.floor.minX, r.floor.minZ] as [number, number],
    to: [r.floor.maxX, r.floor.maxZ] as [number, number],
  }));
  const areas = new AreaTracker({ name: spec.site.name, areas: [...roomAreas, ...spec.site.areas] }, (label) => chip.set(label));

  /* ---------- vòng lặp ---------- */
  const fps = new FpsCounter();
  const nameTag = new NameTag();
  const clock = new THREE.Clock();
  const input: MoveInput = { x: 0, y: 0 };
  orbit.update(camera, player.position, 0, true, groundAt);

  function tick(): void {
    // kẹp dt: tab bị treo vài giây rồi chạy lại thì nhân vật không "dịch chuyển tức thời"
    const dt = Math.min(clock.getDelta(), 0.05);
    input.x = joystick.x;
    input.y = joystick.y;
    keyboard.apply(input);

    player.update(dt, input, orbit.yaw, paused);
    const pos = player.position;
    zones.update(pos);
    areas.update(pos);
    world.update(dt, pos);
    const room = roomAt(pos.x, pos.z);
    orbit.update(camera, pos, dt, false, groundAt, room?.floor);
    renderer.render(scene, camera);
    nameTag.update(pos, camera, NAME_TAG_HEIGHT);
    learn.follow(zones.current ? anchorOf.get(zones.current.id) : undefined, camera);
    fps.tick(dt);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

void boot();
