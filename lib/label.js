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

  // Calculate exact height based on content
  const hasTrain = !!shipment.trainNumber;
  const pageHeight = hasTrain ? 220 : 196;
  const doc = new PDFDocument({ size: [216, pageHeight], margin: 0 });

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

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    return `${date} ${time}`;
  } catch { return '—'; }
}

async function drawLabelPage(doc, { childAWB, masterAWB, shipment, pickup, delivery, origin, dest, boxIndex, totalBoxes, bookedAt }) {
  const w = 216;
  let y = 0;

  // Header with mark
  doc.rect(0, y, w, 20).stroke('#000');
  const markPath = path.join(process.cwd(), 'public', 'mark.png');
  if (fs.existsSync(markPath)) {
    try { doc.image(markPath, 4, y + 3, { width: 14, height: 14 }); } catch {}
  }
  doc.fillColor('#000').fontSize(9).font('Helvetica-Bold').text('SHIPZY RAILWAYS', 22, y + 6);
  y += 20;

  // Master AWB + Date
  doc.rect(0, y, w, 18).stroke('#000');
  doc.fontSize(6).font('Helvetica').text('MASTER AWB', 4, y + 2);
  doc.fontSize(10).font('Helvetica-Bold').text(masterAWB || '—', 4, y + 9);
  doc.fontSize(6).font('Helvetica').text('Date:', 140, y + 2);
  doc.fontSize(7).font('Helvetica-Bold').text(formatDate(bookedAt), 140, y + 9);
  y += 18;

  // Consignee
  const addr = [delivery.address, delivery.city, delivery.state, delivery.pin].filter(Boolean).join(', ');
  const poc = [delivery.pocName, delivery.phone].filter(Boolean).join(' ');
  const consigneeH = poc ? 40 : 32;
  doc.rect(0, y, w, consigneeH).stroke('#000');
  doc.fontSize(6).font('Helvetica-Bold').text('CONSIGNEE', 4, y + 2);
  doc.fontSize(8).font('Helvetica-Bold').text(delivery.name || '—', 4, y + 11, { width: w - 8 });
  doc.fontSize(6).font('Helvetica').text(addr || '—', 4, y + 22, { width: w - 8 });
  if (poc) doc.fontSize(5).text('POC: ' + poc, 4, y + 31, { width: w - 8 });
  y += consigneeH;

  // Origin / Dest / Box
  doc.rect(0, y, 72, 22).stroke('#000');
  doc.rect(72, y, 72, 22).stroke('#000');
  doc.rect(144, y, 72, 22).stroke('#000');
  doc.fontSize(5).font('Helvetica').text('ORIGIN', 4, y + 2);
  doc.fontSize(9).font('Helvetica-Bold').text(origin.code || '—', 4, y + 10);
  doc.fontSize(5).font('Helvetica').text('DEST', 76, y + 2);
  doc.fontSize(9).font('Helvetica-Bold').text(dest.code || '—', 76, y + 10);
  doc.fontSize(5).font('Helvetica').text('BOX', 148, y + 2);
  doc.fontSize(9).font('Helvetica-Bold').text(`${boxIndex}/${totalBoxes}`, 148, y + 10);
  y += 22;

  // Train section
  if (shipment.trainNumber) {
    doc.rect(0, y, w, 28).stroke('#000');
    doc.fontSize(5).font('Helvetica').text('TRAIN', 4, y + 2);
    doc.fontSize(7).font('Helvetica-Bold').text(`${shipment.trainNumber} ${shipment.trainName || ''}`, 4, y + 9, { width: w - 8 });
    doc.fontSize(5).font('Helvetica').text(
      `Dep: ${formatDateTime(shipment.originDeparture)}  Arr: ${formatDateTime(shipment.destEta)}`,
      4, y + 19, { width: w - 8 }
    );
    y += 28;
  }

  // Barcode (PDF417)
  const barcodeH = 36;
  doc.rect(0, y, w, barcodeH).stroke('#000');
  try {
    const barcode = await bwipjs.toBuffer({ bcid: 'pdf417', text: childAWB, scale: 1, height: 8, includetext: false });
    doc.image(barcode, 8, y + 4, { width: w - 16, height: 28 });
  } catch {}
  y += barcodeH;

  // Child AWB number only (no heading)
  doc.rect(0, y, w, 14).stroke('#000');
  doc.fontSize(8).font('Helvetica-Bold').text(childAWB, 0, y + 3, { align: 'center', width: w });
}
