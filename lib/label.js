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
  // Header with white logo
  doc.rect(0, 0, 216, 28).fill('#0f172a');
  
  const whiteLogo = path.join(process.cwd(), 'public', 'mark-white.png');
  if (fs.existsSync(whiteLogo)) {
    try {
      doc.image(whiteLogo, 6, 4, { width: 20, height: 20 });
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('SHIPZY RAILWAYS', 30, 10);
    } catch {
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('SHIPZY RAILWAYS', 6, 10);
    }
  } else {
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('SHIPZY RAILWAYS', 6, 10);
  }

  // Master AWB
  doc.fillColor('#0f172a').fontSize(6).font('Helvetica-Bold').text('MASTER AWB', 6, 34);
  doc.fontSize(11).font('Helvetica-Bold').text(masterAWB || '—', 6, 42);
  doc.fontSize(6).font('Helvetica').fillColor('#64748b').text(formatDate(bookedAt), 120, 44, { align: 'right', width: 90 });

  // Consignee with full address and POC
  doc.fillColor('#0f172a').fontSize(6).font('Helvetica-Bold').text('CONSIGNEE', 6, 58);
  doc.font('Helvetica-Bold').fontSize(8).text(delivery.name || '—', 6, 66, { width: 200 });
  doc.font('Helvetica').fontSize(6).fillColor('#334155');
  const addr = [delivery.address, delivery.city, delivery.state, delivery.pin].filter(Boolean).join(', ');
  doc.text(addr || '—', 6, 76, { width: 200 });
  if (delivery.pocName || delivery.phone) {
    doc.text(`POC: ${delivery.pocName || ''} ${delivery.phone || ''}`, 6, 88, { width: 200 });
  }

  // Origin / Dest
  const odY = delivery.pocName ? 102 : 96;
  doc.rect(6, odY, 204, 20).stroke('#0074ff');
  doc.fillColor('#0074ff').fontSize(6).font('Helvetica-Bold').text('ORIGIN', 10, odY + 2);
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(origin.code || '—', 10, odY + 10);
  doc.fillColor('#0074ff').fontSize(6).font('Helvetica-Bold').text('DEST', 110, odY + 2);
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(dest.code || '—', 110, odY + 10);

  // Box count
  doc.rect(162, odY, 46, 20).fill('#0074ff');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text(`${boxIndex}/${totalBoxes}`, 162, odY + 5, { align: 'center', width: 46 });

  let y = odY + 26;

  // Train section
  if (shipment.trainNumber) {
    doc.rect(6, y, 204, 32).stroke('#e5eaf3');
    doc.fillColor('#0f172a').fontSize(6).font('Helvetica-Bold').text('TRAIN', 10, y + 2);
    doc.font('Helvetica').fontSize(7).text(`${shipment.trainNumber} ${shipment.trainName || ''}`, 10, y + 10, { width: 190 });
    doc.fontSize(6).fillColor('#64748b').text(
      `Dep: ${formatTime(shipment.originDeparture)} (${origin.code || '—'})  Arr: ${formatTime(shipment.destEta)} (${dest.code || '—'})`,
      10, y + 20, { width: 190 }
    );
    y += 36;
  }

  // Barcode
  try {
    const barcode = await bwipjs.toBuffer({ bcid: 'code128', text: childAWB, scale: 1.2, height: 6, includetext: false });
    doc.image(barcode, 12, y, { width: 192, height: 24 });
  } catch {}

  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(childAWB, 6, y + 28, { align: 'center', width: 204 });
  doc.fontSize(5).font('Helvetica').fillColor('#64748b').text('CHILD AWB', 6, y + 40, { align: 'center', width: 204 });

  // Footer
  doc.fillColor('#64748b').fontSize(5).text('Shipzy Railways', 6, 276, { align: 'center', width: 204 });
}
