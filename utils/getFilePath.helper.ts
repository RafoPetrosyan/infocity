import { DOMAIN_URL } from '../constants';

export function getFilePath(url: string) {
  return url.replace((DOMAIN_URL as string) + '/', '');
}
