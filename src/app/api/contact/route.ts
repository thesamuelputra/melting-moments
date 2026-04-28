import { NextResponse } from 'next/server';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

/**
 * Escapes HTML special characters to prevent XSS when embedding
 * user-submitted values into email HTML templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

    // Basic input length caps to prevent abuse
    const name = String(body.name).slice(0, 200);
    const email = String(body.email).slice(0, 200);
    const phone = String(body.phone || '').slice(0, 50);
    const eventType = String(body.eventType).slice(0, 100);
    const guestCount = String(body.guestCount || '').slice(0, 50);
    const date = String(body.date || '').slice(0, 50);
    const venue = String(body.venue || '').slice(0, 300);
    const details = String(body.details || '').slice(0, 2000);
    
    await fetchMutation(api.inquiries.create, {
      name,
      email,
      phone,
      eventType,
      guestCount,
      date,
      venue,
      notes: details,
    });
    
    // Dispatch Email Notification to Owner
    if (process.env.RESEND_API_KEY) {
      // Escape all user input for HTML context
      const eName = escapeHtml(name);
      const eEmail = escapeHtml(email);
      const ePhone = escapeHtml(phone);
      const eEventType = escapeHtml(eventType);
      const eGuestCount = escapeHtml(guestCount);
      const eDate = escapeHtml(date);
      const eVenue = escapeHtml(venue);
      const eDetails = escapeHtml(details);

      // Email to Chef Paul / business owner
      await resend.emails.send({
        from: 'Melting Moments <onboarding@resend.dev>',
        to: process.env.OWNER_EMAIL || 'info@meltingmoments.ca',
        subject: `New Catering Inquiry: ${eventType} - ${name}`,
        html: `
          <h2>New Booking Inquiry</h2>
          <p><strong>Name:</strong> ${eName}</p>
          <p><strong>Email:</strong> ${eEmail}</p>
          <p><strong>Phone:</strong> ${ePhone || 'N/A'}</p>
          <p><strong>Event Type:</strong> ${eEventType}</p>
          <p><strong>Guest Count:</strong> ${eGuestCount || 'N/A'}</p>
          <p><strong>Date:</strong> ${eDate || 'N/A'}</p>
          <p><strong>Venue:</strong> ${eVenue || 'N/A'}</p>
          <p><strong>Details:</strong> ${eDetails || 'N/A'}</p>
          <br/>
          <p><a href="https://meltingmoments.ca/admin">View in Admin Dashboard</a></p>
        `
      });

      // Confirmation email to the customer
      await resend.emails.send({
        from: 'Melting Moments <onboarding@resend.dev>',
        to: email,
        subject: 'Thank you for your inquiry. Melting Moments Catering',
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #070707;">
            <div style="text-align: center; padding: 3rem 2rem; border-bottom: 1px solid #eee;">
              <h1 style="font-size: 1.8rem; font-weight: 400; margin: 0;">Melting Moments</h1>
              <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.5; margin-top: 0.5rem;">Catering Victoria BC</p>
            </div>
            <div style="padding: 2rem;">
              <p style="font-size: 1rem; line-height: 1.6;">Dear ${eName},</p>
              <p style="font-size: 1rem; line-height: 1.6;">Thank you for your interest in Melting Moments Catering. We have received your inquiry and Chef Paul or our concierge team will be in touch within 24-48 hours.</p>
              <div style="background: #F7F6F0; padding: 1.5rem; margin: 1.5rem 0; border-left: 3px solid #070707;">
                <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5;">Your Inquiry Summary</p>
                <p style="margin: 0.25rem 0;"><strong>Event:</strong> ${eEventType}</p>
                <p style="margin: 0.25rem 0;"><strong>Guests:</strong> ${eGuestCount || 'TBD'}</p>
                <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${eDate || 'TBD'}</p>
                ${eVenue ? `<p style="margin: 0.25rem 0;"><strong>Venue:</strong> ${eVenue}</p>` : ''}
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

    console.log(`[Contact API] Received and saved inquiry from ${name} (${email}) for ${eventType}`);
    
    return NextResponse.json({ success: true, message: 'Inquiry received successfully.' });
  } catch (error) {
    console.error('[Contact API] Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
