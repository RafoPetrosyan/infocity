import { deleteManyFromGcs } from './google-cloud-storage';

export async function unlinkFiles(files: any[] = []) {
  await deleteManyFromGcs(files.filter(Boolean));
}
