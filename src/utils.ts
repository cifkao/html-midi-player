export function formatTime(seconds: number) {
  const negative = (seconds < 0);
  seconds = Math.floor(Math.abs(seconds || 0));
  const s = seconds % 60;
  const m = (seconds - s) / 60;
  const h = (seconds - s - 60 * m) / 3600;
  const sStr = (s > 9) ? `${s}` : `0${s}`;
  const mStr = (m > 9 || !h) ? `${m}:` : `0${m}:`;
  const hStr = h ? `${h}:` : '';
  return (negative ? '-' : '') + hStr + mStr + sStr;
}
