// Train tracking — TrainTrack domain may be down
// Set RAIL_API_KEY env var to use RailCore as fallback

const TRAIN_API = process.env.RAIL_API_BASE || 'https://traintrack.stupidlabs.lol';
const API_KEY = process.env.RAIL_API_KEY || '';

export async function trackTrain(trainNumber, date) {
  if (!trainNumber) return null;

  try {
    const url = `${TRAIN_API}/api/trains/${trainNumber}/live`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) return await res.json();
  } catch {}

  if (API_KEY) {
    try {
      const url = `https://ir.railcore.tech/v1/trains/${trainNumber}/live${date ? `?date=${date}` : ''}`;
      const res = await fetch(url, {
        headers: { 'X-RailCore-Key': API_KEY },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return await res.json();
    } catch {}
  }

  return { error: true, message: 'Train API unavailable. TrainTrack is down. Add a RailCore key (RAIL_API_KEY) to enable tracking.' };
}

export function statusColor(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('reached') || s.includes('arrived') || s.includes('on time')) return 'green';
  if (s.includes('delay') || s.includes('late')) return 'amber';
  if (s.includes('cancel')) return 'red';
  return 'blue';
}
