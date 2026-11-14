// Kiểu tối thiểu cho test đọc file nguồn (vitest chạy trên Node; dự án không cài @types/node).
declare module 'node:fs' {
  export function readFileSync(path: URL | string, encoding: 'utf8'): string;
}
