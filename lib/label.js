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

  const doc = new PDFDocument({ size: [216, 288], margin: 6 });

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
  // Header with logo
  doc.rect(0, 0, 216, 26).fill('#0f172a');
  
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 6, 5, { width: 16, height: 16 });
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('SHIPZY RAILWAYS', 26, 9);
    } catch {
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('SHIPZY RAILWAYS', 6, 9);
    }
  } else {
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('SHIPZY RAILWAYS', 6, 9);
  }

  // Master AWB
  doc.fillColor('#0f172a').fontSize(6).font('Helvetica-Bold').text('MASTER AWB', 6, 32);
  doc.fontSize(10).font('Helvetica-Bold').text(masterAWB || '—', 6, 40);
  doc.fontSize(6).font('Helvetica').fillColor('#64748b').text(formatDate(bookedAt), 120, 42, { align: 'right', width: 90 });

  // Consignee
  doc.fillColor('#0f172a').fontSize(6).font('Helvetica-Bold').text('CONSIGNEE', 6, 56);
  doc.font('Helvetica').fontSize(7).text(delivery.name || '—', 6, 64, { width: 140 });
  doc.fontSize(6).text(delivery.city || '', 6, 74);

  // Origin / Dest
  doc.rect(6, 88, 204, 20).stroke('#0074ff');
  doc.fillColor('#0074ff').fontSize(6).font('Helvetica-Bold').text('ORIGIN', 10, 90);
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(origin.code || '—', 10, 98);
  doc.fillColor('#0074ff').fontSize(6).font('Helvetica-Bold').text('DEST', 110, 90);
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(dest.code || '—', 110, 98);

  // Box count
  doc.rect(162, 88, 46, 20).fill('#0074ff');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text(`${boxIndex}/${totalBoxes}`, 162, 93, { align: 'center', width: 46 });

  let y = 114;

  // Train section
  if (shipment.trainNumber) {
    doc.rect(6, y, 204, 36).stroke('#e5eaf3');
    doc.fillColor('#0f172a').fontSize(6).font('Helvetica-Bold').text('TRAIN', 10, y + 3);
    doc.font('Helvetica').fontSize(7).text(`${shipment.trainNumber} ${shipment.trainName || ''}`, 10, y + 11, { width: 190 });
    doc.fontSize(6).fillColor('#64748b').text(
      `Dep: ${formatTime(shipment.originDeparture)} (${origin.code || '—'})  Arr: ${formatTime(shipment.destEta)} (${dest.code || '—'})`,
      10, y + 22, { width: 190 }
    );
    y += 40;
  }

  // Barcode
  try {
    const barcode = await bwipjs.toBuffer({ bcid: 'code128', text: childAWB, scale: 1.2, height: 6, includetext: false });
    doc.image(barcode, 12, y, { width: 192, height: 26 });
  } catch {}

  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(childAWB, 6, y + 30, { align: 'center', width: 204 });
  doc.fontSize(5).font('Helvetica').fillColor('#64748b').text('CHILD AWB', 6, y + 42, { align: 'center', width: 204 });

  // Footer
  doc.fillColor('#64748b').fontSize(5).text('Shipzy Railways', 6, 276, { align: 'center', width: 204 });
}
