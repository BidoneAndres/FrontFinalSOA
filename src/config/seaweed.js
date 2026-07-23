const SEAWEED_FILER_HOST = '10.35.237.38';
const SEAWEED_FILER_PORT = 8888;

export const SEAWEED_FILER_BASE = `http://${SEAWEED_FILER_HOST}:${SEAWEED_FILER_PORT}/fotogramas`;

export function getFrameUrl(frameId) {
  return `${SEAWEED_FILER_BASE}/${frameId}.jpg`;
}

export function rewriteSeaweedUrl(url) {
  if (!url) return '';
  return url.replace(/seaweedfs:\d+/g, `${SEAWEED_FILER_HOST}:${SEAWEED_FILER_PORT}`);
}
