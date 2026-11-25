import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import { getShipments, getWarehouses, getStations } from './db';

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

async function drawLabelPage(doc, { childAWB, masterAWB, shipment, pickup, delivery, origin, dest, boxIndex, totalBoxes, bookedAt }) {
  doc.rect(0, 0, 216, 22).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('SHIPZY RAILWAYS', 6, 7);

  doc.fillColor('#0f172a').fontSize(6).font('Helvetica-Bold').text('MASTER AWB', 6, 28);
  doc.fontSize(10).font('Helvetica-Bold').text(masterAWB || '—', 6, 36);
  doc.fontSize(6).font('Helvetica').fillColor('#64748b').text(formatDate(bookedAt), 120, 38, { align: 'right', width: 90 });

  doc.fillColor('#0f172a').fontSize(6).font('Helvetica-Bold').text('CONSIGNEE', 6, 52);
  doc.font('Helvetica').fontSize(7).text(delivery.name || '—', 6, 60, { width: 140 });
  doc.fontSize(6).text(delivery.city || '', 6, 70);

  doc.rect(6, 84, 204, 22).stroke('#0074ff');
  doc.fillColor('#0074ff').fontSize(6).font('Helvetica-Bold').text('ORIGIN', 10, 86);
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(origin.code || '—', 10, 94);
  doc.fillColor('#0074ff').fontSize(6).font('Helvetica-Bold').text('DEST', 110, 86);
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(dest.code || '—', 110, 94);

  doc.rect(160, 84, 48, 22).fill('#0074ff');
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(`${boxIndex}/${totalBoxes}`, 160, 90, { align: 'center', width: 48 });

  try {
    const barcode = await bwipjs.toBuffer({ bcid: 'code128', text: childAWB, scale: 1.2, height: 6, includetext: false });
    doc.image(barcode, 12, 114, { width: 192, height: 28 });
  } catch {}

  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(childAWB, 6, 148, { align: 'center', width: 204 });
  doc.fontSize(5).font('Helvetica').fillColor('#64748b').text('CHILD AWB', 6, 160, { align: 'center', width: 204 });

  doc.fillColor('#64748b').fontSize(5).text('Shipzy Railways', 6, 276, { align: 'center', width: 204 });
}
