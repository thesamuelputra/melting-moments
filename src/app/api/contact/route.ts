import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.eventType || !body.name || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // In a real application, we would send an email here using Resend, SendGrid, etc.
    // For this implementation plan, we successfully mock the API behavior
    console.log(`[Contact API] Received inquiry from ${body.name} (${body.email}) for ${body.eventType}`);
    
    return NextResponse.json({ success: true, message: 'Inquiry received successfully.' });
  } catch (error) {
    console.error('[Contact API] Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
