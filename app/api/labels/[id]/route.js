import { NextResponse } from 'next/server';
import { generateLabelPDF } from '@/lib/label';
import { getShipments } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const pdfBuffer = await generateLabelPDF(params.id);
    const shipments = await getShipments();
    const shipment = shipments.find(s => s.id === params.id);
    const mawb = shipment?.masterAWB || params.id;
    const boxCount = (shipment?.boxAWBs || []).length || 1;
    const filename = `label-${mawb}_${boxCount}.pdf`;
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
