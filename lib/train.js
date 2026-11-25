// Train tracking via TrainTrack API (free, no key required)
// Docs: https://traintrack.stupidlabs.lol/docs
// Later: swap base URL + add key header for RailCore or RailKit

const TRAIN_API = 'https://traintrack.stupidlabs.lol';

export async function trackTrain(trainNumber, date) {
  if (!trainNumber) return null;
  const url = `${TRAIN_API}/api/trains/${trainNumber}/live${date ? `?date=${encodeURIComponent(date)}` : ''}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function searchTrain(query) {
  if (!query) return [];
  try {
    const res = await fetch(`${TRAIN_API}/api/trains/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || data.trains || [];
  } catch {
    return [];
  }
}

export function statusColor(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('reached') || s.includes('arrived') || s.includes('on time') || s.includes('on-time')) return 'green';
  if (s.includes('delay') || s.includes('late')) return 'amber';
  if (s.includes('cancel')) return 'red';
  return 'blue';
}
