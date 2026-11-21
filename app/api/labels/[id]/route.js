import { NextResponse } from 'next/server';
import { generateLabelPDF } from '@/lib/label';

export async function GET(request, { params }) {
  try {
    const pdfBuffer = await generateLabelPDF(params.id);
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="labels-${params.id}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
