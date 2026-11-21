import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'store.json');

const defaultData = {
  awbCounter: 30000001, // starts series from 3
  customers: [],
  warehouses: [],
  shipments: [],
};

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadData() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return { ...defaultData };
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getNextMasterAWB() {
  const data = loadData();
  const awb = data.awbCounter.toString().padStart(10, '0');
  data.awbCounter += 1;
  saveData(data);
  return awb;
}

export function generateBoxAWBs(masterAWB, boxCount) {
  const awbs = [];
  let current = BigInt(masterAWB);
  for (let i = 0; i < boxCount; i++) {
    awbs.push(current.toString().padStart(10, '0'));
    current += 11n;
  }
  return awbs;
}
