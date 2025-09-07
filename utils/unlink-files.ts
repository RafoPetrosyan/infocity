import { unlink } from 'fs/promises';

export async function unlinkFiles(files: any[] = []) {
  for (const path of files) {
    if (path) await unlink(path);
  }
}
