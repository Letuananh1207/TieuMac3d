import * as THREE from 'three';
import './style.css';
import { Colliders } from './collision/colliders';
import { Joystick } from './input/joystick';
import { Keyboard } from './input/keyboard';
import { OrbitCamera } from './input/orbitCamera';
import { attachPointerInput } from './input/pointers';
import { GroundPicker } from './input/tapToMove';
import { createBlockCharacter } from './player/blockCharacter';
import { PlayerController, type MoveInput } from './player/controller';
import { SCENE, SCENE_FILE } from './scene/loadSpec';
import { createStage } from './scene/renderer';
import { buildWorld } from './scene/world';
import { el } from './ui/dom';
import { EventCard } from './ui/eventCard';
import { bindCameraButton, createHint, FpsCounter, NameTag } from './ui/hud';
import { LessonBoard } from './ui/lessonBoard';
import { ZoneTracker } from './zones/zoneTracker';
import { placeZones, ZONE_CONTENT } from './zones/zones';

async function boot(): Promise<void> {
  // Biển hiệu vẽ chữ Lora lên canvas, nên phải nạp font trước khi dựng cảnh.
  await Promise.allSettled([document.fonts.load('700 72px Lora'), document.fonts.load('700 13px "Be Vietnam Pro"')]);

  const { spec } = SCENE;
  const canvas = el<HTMLCanvasElement>('stage');
  const { renderer, scene, camera } = createStage(canvas, spec.camera.fov);
  const colliders = new Colliders();
  const world = buildWorld(scene, colliders, spec);
  const placed = placeZones(ZONE_CONTENT, world.zoneAnchors);
  const problems = [...SCENE.problems, ...placed.problems];
  if (problems.length) console.warn(`Đặc tả cảnh (${SCENE_FILE}):\n- ${problems.join('\n- ')}`);

  const character = createBlockCharacter();
  character.root.position.set(spec.player.start[0], 0, spec.player.start[1]);
  scene.add(character.root);
  const player = new PlayerController(character, colliders);

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
      const p = picker.pick(x, y);
      if (p) player.moveTarget = p;
    },
  });
  bindCameraButton(() => orbit.toggleView());

  /* ---------- vùng sự kiện + bài học ---------- */
  let paused = false; // đang mở bài học: nhân vật đứng yên
  const lesson = new LessonBoard(() => (paused = false));
  const card = new EventCard((zone) => {
    paused = true;
    lesson.open(zone.lesson);
  });
  const zones = new ZoneTracker(placed.zones, (z) => card.setZone(z));

  /* ---------- vòng lặp ---------- */
  const fps = new FpsCounter();
  const nameTag = new NameTag();
  const clock = new THREE.Clock();
  const input: MoveInput = { x: 0, y: 0 };
  orbit.update(camera, player.position, 0, true);

  function tick(): void {
    // kẹp dt: tab bị treo vài giây rồi chạy lại thì nhân vật không "dịch chuyển tức thời"
    const dt = Math.min(clock.getDelta(), 0.05);
    input.x = joystick.x;
    input.y = joystick.y;
    keyboard.apply(input);

    player.update(dt, input, orbit.yaw, paused);
    zones.update(player.position);
    world.update(dt);
    orbit.update(camera, player.position, dt);
    renderer.render(scene, camera);
    nameTag.update(player.position, camera);
    fps.tick(dt);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

void boot();
