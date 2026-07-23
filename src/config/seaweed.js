export const SEAWEED_FILER_BASE = 'https://cernikiw3.chickenkiller.com/filer/fotogramas';

export function getFrameUrl(frameId) {
  return `${SEAWEED_FILER_BASE}/${frameId}.jpg`;
}

export function rewriteSeaweedUrl(url) {
  if (!url) return '';
  return url.replace(/seaweedfs:\d+/g, `cernikiw3.chickenkiller.com/filer`);
}
