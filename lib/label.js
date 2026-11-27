import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import { getShipments, getWarehouses, getStations } from './db';
import fs from 'fs';
import path from 'path';

export async function generateLabelPDF(shipmentId) {
  const shipments = await getShipments();
  const warehouses = await getWarehouses();
  const stations = await getStations();

  const shipment = shipments.find(s => s.id === shipmentId);
  if (!shipment) throw new Error('Shipment not found');

  const pickup = warehouses.find(w => w.id === shipment.pickupWarehouseId) || {};
  const delivery = warehouses.find(w => w.id === shipment.deliveryWarehouseId) || {};
  const origin = stations.find(s => s.id === shipment.originStationId) || {};
  const dest = stations.find(s => s.id === shipment.destinationStationId) || {};

  // Smaller label: 3 inch width x 3.5 inch height
  const doc = new PDFDocument({ size: [216, 252], margin: 4 });

  const buffers = [];
  doc.on('data', chunk => buffers.push(chunk));
  const pdfPromise = new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(buffers))));

  const masterAWB = shipment.masterAWB || '';
  const boxAWBs = shipment.boxAWBs || [];
  const bookedAt = shipment.createdAt ? new Date(shipment.createdAt) : new Date();

  for (let i = 0; i < boxAWBs.length; i++) {
    if (i > 0) doc.addPage();
    await drawLabelPage(doc, {
      childAWB: boxAWBs[i], masterAWB, shipment, pickup, delivery, origin, dest,
      boxIndex: i + 1, totalBoxes: boxAWBs.length, bookedAt,
    });
  }

  doc.end();
  return pdfPromise;
}

function formatDate(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function formatTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
  } catch { return '—'; }
}

async function drawLabelPage(doc, { childAWB, masterAWB, shipment, pickup, delivery, origin, dest, boxIndex, totalBoxes, bookedAt }) {
  const w = 208;
  const x = 4;
  let y = 4;

  // Header
  doc.rect(x, y, w, 18).stroke('#000');
  const whiteLogo = path.join(process.cwd(), 'public', 'mark-white.png');
  if (fs.existsSync(whiteLogo)) {
    try { doc.image(whiteLogo, x + 2, y + 2, { width: 14, height: 14 }); } catch {}
  }
  doc.fillColor('#000').fontSize(8).font('Helvetica-Bold').text('SHIPZY RAILWAYS', x + 20, y + 5);
  y += 18;

  // Master AWB row
  doc.rect(x, y, w, 16).stroke('#000');
  doc.fontSize(6).font('Helvetica').text('MASTER AWB', x + 2, y + 2);
  doc.fontSize(9).font('Helvetica-Bold').text(masterAWB || '—', x + 50, y + 3);
  doc.fontSize(6).font('Helvetica').text(formatDate(bookedAt), x + 130, y + 5);
  y += 16;

  // Consignee section
  const addr = [delivery.address, delivery.city, delivery.state, delivery.pin].filter(Boolean).join(', ');
  const poc = [delivery.pocName, delivery.phone].filter(Boolean).join(' ');
  const consigneeH = 36;
  doc.rect(x, y, w, consigneeH).stroke('#000');
  doc.fontSize(6).font('Helvetica-Bold').text('CONSIGNEE', x + 2, y + 2);
  doc.fontSize(7).font('Helvetica-Bold').text(delivery.name || '—', x + 2, y + 10, { width: w - 8 });
  doc.fontSize(6).font('Helvetica').text(addr || '—', x + 2, y + 20, { width: w - 8 });
  if (poc) doc.fontSize(5).text('POC: ' + poc, x + 2, y + 28, { width: w - 8 });
  y += consigneeH;

  // Origin / Dest / Box row
  doc.rect(x, y, 70, 20).stroke('#000');
  doc.rect(x + 70, y, 70, 20).stroke('#000');
  doc.rect(x + 140, y, 68, 20).stroke('#000');
  doc.fontSize(5).font('Helvetica').text('ORIGIN', x + 2, y + 2);
  doc.fontSize(8).font('Helvetica-Bold').text(origin.code || '—', x + 2, y + 9);
  doc.fontSize(5).font('Helvetica').text('DEST', x + 72, y + 2);
  doc.fontSize(8).font('Helvetica-Bold').text(dest.code || '—', x + 72, y + 9);
  doc.fontSize(5).font('Helvetica').text('BOX', x + 142, y + 2);
  doc.fontSize(8).font('Helvetica-Bold').text(`${boxIndex}/${totalBoxes}`, x + 142, y + 9);
  y += 20;

  // Train section
  if (shipment.trainNumber) {
    doc.rect(x, y, w, 24).stroke('#000');
    doc.fontSize(5).font('Helvetica').text('TRAIN', x + 2, y + 2);
    doc.fontSize(7).font('Helvetica-Bold').text(`${shipment.trainNumber} ${shipment.trainName || ''}`, x + 2, y + 9, { width: w - 8 });
    doc.fontSize(5).font('Helvetica').text(
      `Dep: ${formatTime(shipment.originDeparture)}  Arr: ${formatTime(shipment.destEta)}`,
      x + 2, y + 17
    );
    y += 24;
  }

  // Barcode
  const barcodeH = 28;
  doc.rect(x, y, w, barcodeH + 16).stroke('#000');
  try {
    const barcode = await bwipjs.toBuffer({ bcid: 'code128', text: childAWB, scale: 1, height: 5, includetext: false });
    doc.image(barcode, x + 8, y + 2, { width: w - 16, height: 22 });
  } catch {}
  doc.fontSize(8).font('Helvetica-Bold').text(childAWB, x, y + barcodeH - 2, { align: 'center', width: w });
  doc.fontSize(5).font('Helvetica').text('CHILD AWB', x, y + barcodeH + 8, { align: 'center', width: w });
}
