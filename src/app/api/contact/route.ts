import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Spam protection honeypot
    if (body.website) {
       console.log('[Contact API] Honeypot triggered, rejecting silently.');
       return NextResponse.json({ success: true, message: 'Inquiry received successfully.' });
    }

    if (!body.eventType || !body.name || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await db.inquiry.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        eventType: body.eventType,
        guestCount: body.guestCount || '',
        date: body.date || '',
        venue: body.venue || '',
        notes: body.details || '',
      }
    });
    
    // Dispatch Email Notification to Owner
    if (process.env.RESEND_API_KEY) {
      // Email to Chef Paul / business owner
      await resend.emails.send({
        from: 'Melting Moments <onboarding@resend.dev>',
        to: process.env.OWNER_EMAIL || 'info@meltingmoments.ca',
        subject: `New Catering Inquiry: ${body.eventType} - ${body.name}`,
        html: `
          <h2>New Booking Inquiry</h2>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Phone:</strong> ${body.phone || 'N/A'}</p>
          <p><strong>Event Type:</strong> ${body.eventType}</p>
          <p><strong>Guest Count:</strong> ${body.guestCount || 'N/A'}</p>
          <p><strong>Date:</strong> ${body.date || 'N/A'}</p>
          <p><strong>Venue:</strong> ${body.venue || 'N/A'}</p>
          <p><strong>Details:</strong> ${body.details || 'N/A'}</p>
          <br/>
          <p><a href="https://meltingmoments.ca/admin">View in Admin Dashboard</a></p>
        `
      });

      // Confirmation email to the customer (#18)
      await resend.emails.send({
        from: 'Melting Moments <onboarding@resend.dev>',
        to: body.email,
        subject: 'Thank you for your inquiry — Melting Moments Catering',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #070707;">
            <div style="text-align: center; padding: 3rem 2rem; border-bottom: 1px solid #eee;">
              <h1 style="font-size: 1.8rem; font-weight: 400; margin: 0;">Melting Moments</h1>
              <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.5; margin-top: 0.5rem;">Catering Victoria BC</p>
            </div>
            <div style="padding: 2rem;">
              <p style="font-size: 1rem; line-height: 1.6;">Dear ${body.name},</p>
              <p style="font-size: 1rem; line-height: 1.6;">Thank you for your interest in Melting Moments Catering. We have received your inquiry and Chef Paul or our concierge team will be in touch within 24-48 hours.</p>
              <div style="background: #F7F6F0; padding: 1.5rem; margin: 1.5rem 0; border-left: 3px solid #070707;">
                <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5;">Your Inquiry Summary</p>
                <p style="margin: 0.25rem 0;"><strong>Event:</strong> ${body.eventType}</p>
                <p style="margin: 0.25rem 0;"><strong>Guests:</strong> ${body.guestCount || 'TBD'}</p>
                <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${body.date || 'TBD'}</p>
                ${body.venue ? `<p style="margin: 0.25rem 0;"><strong>Venue:</strong> ${body.venue}</p>` : ''}
              </div>
              <p style="font-size: 0.9rem; line-height: 1.6; opacity: 0.8;">In the meantime, feel free to explore our <a href="https://meltingmoments.ca/menus" style="color: #070707;">full menus</a> or call us directly at <a href="tel:2503852462" style="color: #070707;">250-385-2462</a>.</p>
              <p style="font-size: 1rem; line-height: 1.6; margin-top: 1.5rem;">Warm regards,<br/>Chef Paul Silletta<br/><span style="opacity: 0.5; font-size: 0.85rem;">Melting Moments Catering</span></p>
            </div>
            <div style="text-align: center; padding: 1.5rem 2rem; border-top: 1px solid #eee; font-size: 0.7rem; opacity: 0.4;">
              614 Grenville Ave, Esquimalt, BC V9A 6L2 · 250-385-2462
            </div>
          </div>
        `
      });
    }

    console.log(`[Contact API] Received and saved inquiry from ${body.name} (${body.email}) for ${body.eventType}`);
    
    return NextResponse.json({ success: true, message: 'Inquiry received successfully.' });
  } catch (error) {
    console.error('[Contact API] Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
