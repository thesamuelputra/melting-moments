import { NextResponse } from 'next/server';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// RESEND_FROM must be an address on a domain verified in the Resend dashboard.
const FROM_ADDRESS = process.env.RESEND_FROM || 'onboarding@resend.dev';

// Strip control characters from user input before interpolating into email subject headers
const clean = (s: string) => s.replace(/[\r\n\t]+/g, ' ').slice(0, 120);

import { escapeHtml, isValidEmail } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Spam protection honeypot
    if (body.website) {
       console.log('[Guidos Order API] Honeypot triggered, rejecting silently.');
       return NextResponse.json({ success: true, message: 'Order received.' });
    }

    if (!body.name || !body.email || !body.phone || !body.items || !body.deliveryMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(String(body.email))) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Basic input length caps
    const name = String(body.name).slice(0, 200);
    const email = String(body.email).slice(0, 200);
    const phone = String(body.phone).slice(0, 50);
    const items = String(body.items).slice(0, 3000);
    const rawMethod = String(body.deliveryMethod);
    if (rawMethod !== 'delivery' && rawMethod !== 'pickup') {
      return NextResponse.json({ error: 'Invalid delivery method' }, { status: 400 });
    }
    const deliveryMethod: 'delivery' | 'pickup' = rawMethod;
    const address = String(body.address || '').slice(0, 500);
    const notes = String(body.notes || '').slice(0, 2000);
    if (deliveryMethod === 'delivery' && !address.trim()) {
      return NextResponse.json({ error: 'Delivery address is required for delivery orders' }, { status: 400 });
    }

    // Escape for HTML
    const eName = escapeHtml(name);
    const eEmail = escapeHtml(email);
    const ePhone = escapeHtml(phone);
    const eItems = escapeHtml(items);
    const eDeliveryMethod = deliveryMethod === 'delivery' ? `Delivery ($12.50) to ${escapeHtml(address)}` : 'Pickup at 614 Grenville Ave';
    const eNotes = escapeHtml(notes);

    // Persist to Convex database
    await fetchMutation(api.guidosOrders.create, {
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      items,
      deliveryMethod,
      deliveryAddress: address || undefined,
      notes: notes || undefined,
    });
    
    if (process.env.RESEND_API_KEY) {
      try {
        const { error: ownerEmailError } = await resend!.emails.send({
          from: `Guido's Gourmet <${FROM_ADDRESS}>`,
          to: process.env.OWNER_EMAIL || 'info@meltingmoments.ca',
          replyTo: email,
          subject: `New Guido's Gourmet Order from ${clean(name)}`,
          html: `
            <h2>New Ready-Made Meals Order</h2>
            <p><strong>Name:</strong> ${eName}</p>
            <p><strong>Email:</strong> ${eEmail}</p>
            <p><strong>Phone:</strong> ${ePhone}</p>
            <p><strong>Delivery:</strong> ${eDeliveryMethod}</p>
            <hr/>
            <p><strong>Order Items:</strong></p>
            <pre style="white-space: pre-wrap; font-family: inherit;">${eItems}</pre>
            ${eNotes ? `<p><strong>Notes:</strong> ${eNotes}</p>` : ''}
            <br/>
            <p><a href="https://meltingmoments.ca/admin">View in Admin Dashboard</a></p>
          `
        });

        // The order is already saved in Convex, so a returned email error is non-fatal. Log loudly.
        if (ownerEmailError) {
          console.error('[Guidos Order API] Owner notification email failed:', ownerEmailError);
        }
      } catch (ownerEmailThrew) {
        // A thrown transport error must stay non-fatal too, or the customer retries and duplicates the order.
        console.error('[Guidos Order API] Owner notification email threw:', ownerEmailThrew);
      }

      // Confirmation email to the customer
      try {
        const { error: confirmationEmailError } = await resend!.emails.send({
          from: `Guido's Gourmet <${FROM_ADDRESS}>`,
          to: email,
          subject: 'Guido\'s Gourmet: Order Received',
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #070707;">
              <div style="text-align: center; padding: 3rem 2rem; border-bottom: 1px solid #eee;">
                <h1 style="font-size: 1.8rem; font-weight: 400; margin: 0;">Guido's Gourmet</h1>
                <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.5; margin-top: 0.5rem;">Ready-Made Italian Meals</p>
              </div>
              <div style="padding: 2rem;">
                <p style="font-size: 1rem; line-height: 1.6;">Dear ${eName},</p>
                <p style="font-size: 1rem; line-height: 1.6;">Thank you for your order. Chef Paul will review it and confirm within 24 hours.</p>
                <div style="background: #F7F6F0; padding: 1.5rem; margin: 1.5rem 0; border-left: 3px solid #070707;">
                  <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5;">Your Order</p>
                  <pre style="white-space: pre-wrap; font-family: inherit; margin: 0.5rem 0;">${eItems}</pre>
                  <p style="margin: 0.5rem 0 0 0;"><strong>${eDeliveryMethod}</strong></p>
                </div>
                <p style="font-size: 0.9rem; line-height: 1.6; opacity: 0.8;">If you have any questions, call us at <a href="tel:+12503852462" style="color: #070707;">250-385-2462</a>.</p>
                <p style="font-size: 1rem; line-height: 1.6; margin-top: 1.5rem;">Warm regards,<br/>Chef Paul Silletta<br/><span style="opacity: 0.5; font-size: 0.85rem;">Guido's Gourmet</span></p>
              </div>
              <div style="text-align: center; padding: 1.5rem 2rem; border-top: 1px solid #eee; font-size: 0.7rem; opacity: 0.4;">
                614 Grenville Ave, Esquimalt, BC V9A 6L2 · 250-385-2462
              </div>
            </div>
          `
        });

        // The order is already saved in Convex, so a returned email error is non-fatal. Log loudly.
        if (confirmationEmailError) {
          console.error('[Guidos Order API] Customer confirmation email failed:', confirmationEmailError);
        }
      } catch (confirmationEmailThrew) {
        // A thrown transport error must stay non-fatal too, or the customer retries and duplicates the order.
        console.error('[Guidos Order API] Customer confirmation email threw:', confirmationEmailThrew);
      }
    }

    console.log(`[Guidos Order API] Order received (${deliveryMethod}) from ${name.charAt(0)}***.`);
    
    return NextResponse.json({ success: true, message: 'Order received.' });
  } catch (error) {
    console.error('[Guidos Order API] Error processing order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
