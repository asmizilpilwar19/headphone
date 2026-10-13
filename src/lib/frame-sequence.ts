import type { SequenceConfig } from "@/config/product";

export type SequenceStatus = "loading" | "ready" | "missing";

/**
 * Progressive image-sequence loader.
 *  - frame 1 first (the poster), then a coarse sweep (every 16th, 8th, 4th, 2nd, remaining) so scrubbing
 *    works at low fidelity almost immediately and sharpens as frames arrive
 *  - `request(i)` jumps the queue for the frames around the playhead
 *  - `nearest(i)` never returns nothing if anything has loaded, so fast scrolls and missing frames
 *    simply hold the closest available image
 */
export class FrameSequence {
  readonly count: number;
  private urls: string[];
  private frames: (HTMLImageElement | undefined)[];
  private state: Uint8Array; // 0 idle, 1 loading, 2 loaded, 3 failed
  private queue: number[] = [];
  private active = 0;
  private disposed = false;
  private listeners = new Set<() => void>();
  loaded = 0;
  failed = 0;

  constructor(cfg: SequenceConfig, mobile: boolean, private concurrency = 6) {
    this.count = mobile ? cfg.mobileCount : cfg.count;
    const dir = mobile ? cfg.mobileDir : cfg.dir;
    this.urls = Array.from({ length: this.count }, (_, i) => `${dir}/${cfg.prefix}${String(i + 1).padStart(cfg.pad, "0")}.${cfg.ext}`);
    this.frames = new Array(this.count);
    this.state = new Uint8Array(this.count);
  }

  get status(): SequenceStatus {
    if (this.loaded > 0) return "ready";
    if (this.failed >= Math.min(this.count, 3)) return "missing";
    return "loading";
  }

  get progress() {
    return this.count ? this.loaded / this.count : 1;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  start() {
    const seen = new Set<number>();
    const order: number[] = [0];
    seen.add(0);
    for (const stride of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < this.count; i += stride) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }
    // the last frame matters too (end pose), so pull it forward
    if (this.count > 1) order.splice(1, 0, ...order.splice(order.indexOf(this.count - 1), 1));
    this.queue.push(...order);
    this.pump();
  }

  /** Prioritise frames near the playhead. */
  request(index: number) {
    for (const i of [index, index + 1, index - 1, index + 2, index - 2]) {
      if (i >= 0 && i < this.count && this.state[i] === 0) {
        const at = this.queue.indexOf(i);
        if (at > -1) this.queue.splice(at, 1);
        this.queue.unshift(i);
      }
    }
    this.pump();
  }

  nearest(index: number): HTMLImageElement | undefined {
    for (let d = 0; d < this.count; d++) {
      const a = this.frames[index - d];
      if (a) return a;
      const b = this.frames[index + d];
      if (b) return b;
    }
    return undefined;
  }

  has(index: number) {
    return !!this.frames[index];
  }

  dispose() {
    this.disposed = true;
    this.queue = [];
    this.listeners.clear();
    this.frames = [];
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private pump() {
    while (!this.disposed && this.active < this.concurrency && this.queue.length) {
      const i = this.queue.shift()!;
      if (this.state[i] !== 0) continue;
      this.load(i);
    }
  }

  private load(i: number) {
    this.state[i] = 1;
    this.active++;
    const img = new Image();
    img.decoding = "async";
    const done = (ok: boolean) => {
      this.active--;
      if (this.disposed) return;
      this.state[i] = ok ? 2 : 3;
      if (ok) {
        this.frames[i] = img;
        this.loaded++;
      } else {
        this.failed++;
      }
      this.emit();
      this.pump();
    };
    img.onload = () => {
      // decode off the main thread where supported so the first draw of a frame doesn't hitch
      (img.decode ? img.decode() : Promise.resolve()).catch(() => undefined).finally(() => done(true));
    };
    img.onerror = () => done(false);
    img.src = this.urls[i];
  }
}
