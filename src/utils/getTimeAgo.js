import { getEpochTime } from "./epoch.js";

export function getTimeAgo(epochSeconds) {
  const now = getEpochTime();
  const diff = now - epochSeconds;

  if (diff < 60) {
    return `${diff}s ago`;
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else if (diff < 2592000) {
    // < 30 days
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  } else {
    const months = Math.floor(diff / 2592000);
    return `${months}mo ago`;
  }
}
