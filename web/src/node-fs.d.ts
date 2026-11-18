// Kiểu tối thiểu cho test đọc file nguồn và vite.config.ts (vitest chạy trên Node; dự án không cài @types/node).
declare module 'node:fs' {
  export function readFileSync(path: URL | string, encoding: 'utf8'): string;
  export function readFileSync(path: URL | string): Uint8Array;
  export function statSync(path: URL | string): { size: number };
  export function readdirSync(path: URL | string): string[];
  export function existsSync(path: URL | string): boolean;
  export function realpathSync(path: URL | string): string;
}
