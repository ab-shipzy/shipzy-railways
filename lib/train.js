// Train tracking via RailCore
// Set RAIL_API_KEY env var

const API_KEY = process.env.RAIL_API_KEY || '';

function toISO(dateStr) {
  if (!dateStr) return '';
  const m = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return dateStr;
}

export async function trackTrain(trainNumber, date) {
  if (!trainNumber) return null;
  if (!API_KEY) return { error: true, message: 'RAIL_API_KEY not set' };

  const iso = toISO(date);
  const url = `https://ir.railcore.tech/v1/trains/${trainNumber}/live${iso ? `?date=${iso}` : ''}`;

  try {
    const res = await fetch(url, {
      headers: { 'X-RailCore-Key': API_KEY },
      signal: AbortSignal.timeout(10000),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { error: true, message: json.error?.message || 'API error' };
    }
    const data = json.data;
    const stations = data.stations || [];
    const first = stations[0];
    const last = stations[stations.length - 1];
    return {
      ...data,
      originCode: first?.station_code || '',
      originName: first?.station_name || '',
      destCode: last?.station_code || '',
      destName: last?.station_name || '',
      originDeparture: first?.scheduled_departure || first?.etd || '',
    };
  } catch (e) {
    return { error: true, message: e.message || 'Network error' };
  }
}

export function statusColor(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('reached') || s.includes('arrived') || s.includes('on time') || s.includes('at_station')) return 'green';
  if (s.includes('delay') || s.includes('late')) return 'amber';
  if (s.includes('cancel')) return 'red';
  return 'blue';
}
