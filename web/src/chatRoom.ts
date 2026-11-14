/**
 * Ghép trò chuyện kênh chung (R-CHAT-1..3, thiết kế 2026-11-14.1): kênh trong máy + NPC nói câu có sẵn +
 * bong bóng trên đầu + khung kênh / ô nhập. Tách khỏi main.ts như gamePlay.ts.
 */
import * as THREE from 'three';
import { BubbleTimer } from './chat/bubbleTimer';
import { LocalChannel, type ChatChannel } from './chat/chatChannel';
import { MIN_SEND_GAP_S, type Speaker } from './chat/chatMessage';
import { NpcChatter } from './chat/npcChatter';
import type { Npc } from './player/npc';
import { ChatBubbles, type BubbleAnchor } from './ui/chatBubbles';
import { ChatPanel } from './ui/chatPanel';

/** Bong bóng của mình nằm trên nhãn tên (cao 24) + hở 4 (thiết kế 2026-11-14.1). */
const ABOVE_NAME_TAG = 28;
/** NPC: neo ngay trên đầu (cao như nút "Nói chuyện"). */
const NPC_HEAD = 2.3;

/** Giờ của kênh: giây theo đồng hồ thật (khung kênh hiện giờ:phút). */
const now = (): number => Date.now() / 1000;

export interface ChatFrame {
  camera: THREE.Camera;
  /** chân nhân vật + chiều cao nhãn tên */
  player: THREE.Vector3;
  nameTagHeight: number;
  npcs: readonly Npc[];
  /** đang bận: bài học, thoại NPC, bàn chơi, bản đồ, màn tải → ẩn nút / khung, không vẽ bong bóng */
  busy: boolean;
}

export class ChatRoom {
  private readonly channel: ChatChannel = new LocalChannel();
  private readonly timer = new BubbleTimer();
  private readonly bubbles = new ChatBubbles(document.body);
  private readonly panel: ChatPanel;
  private readonly me: Speaker = { id: 'player', name: 'Ta', kind: 'player' };
  private readonly anchors = new Map<string, BubbleAnchor>();
  private chatter: NpcChatter | null = null;
  private lastSent: number | undefined;

  constructor(private readonly npcNames: (id: string) => { name: string; han?: string } | undefined) {
    this.panel = new ChatPanel({
      send: (raw) => {
        const r = this.channel.send(this.me, raw, now());
        if (r.ok) this.lastSent = now();
        return r;
      },
      waitLeft: () => (this.lastSent === undefined ? 0 : Math.max(0, this.lastSent + MIN_SEND_GAP_S - now())),
      onOpenChange: (open) => document.body.classList.toggle('chatting', open),
    });
    this.channel.subscribe((m) => {
      this.timer.push(m);
      this.panel.add(m);
    });
  }

  /** Ô nhập đang mở: phím không điều khiển nhân vật, chạm cảnh là đóng. */
  get typing(): boolean {
    return this.panel.isOpen;
  }

  /** Phím Enter / nút "Trò chuyện". */
  open(): void {
    this.panel.show();
  }

  /** Đóng ô nhập (Esc, nút quay lại, chạm cảnh). `true` nếu vừa đóng. */
  close(): boolean {
    return this.panel.hide();
  }

  /** Gọi mỗi khung. */
  update(f: ChatFrame): void {
    const t = now();
    if (!this.chatter && f.npcs.length) {
      // NPC trong cảnh nói câu có sẵn (R-CHAT-3) — Math.random: nhịp mỗi lần chơi một khác
      this.chatter = new NpcChatter(this.channel, f.npcs.map((n) => this.npcSpeaker(n.id)), Math.random, t);
    }
    this.chatter?.update(t);
    this.panel.update(t, f.busy);

    this.anchor(this.me, f.player.x, f.player.y + f.nameTagHeight, f.player.z, ABOVE_NAME_TAG);
    for (const n of f.npcs) {
      const p = n.root.position;
      this.anchor(this.anchors.get(n.id)?.speaker ?? this.npcSpeaker(n.id), p.x, p.y + NPC_HEAD, p.z, 4);
    }
    this.bubbles.update(this.timer.active(t), this.anchors, f.camera, t, f.busy);
  }

  private npcSpeaker(id: string): Speaker {
    const n = this.npcNames(id);
    return { id, name: n?.name ?? id, han: n?.han, kind: 'npc' };
  }

  private anchor(speaker: Speaker, x: number, y: number, z: number, liftPx: number): void {
    const a = this.anchors.get(speaker.id);
    if (a) a.at.set(x, y, z);
    else this.anchors.set(speaker.id, { speaker, at: new THREE.Vector3(x, y, z), liftPx });
  }
}
