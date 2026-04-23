import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { inquiry } = await req.json();

    if (!inquiry) {
      return Response.json({ error: 'Inquiry data is required' }, { status: 400 });
    }

    const categoryLabel = {
      wedding: 'Wedding Signage',
      baby: 'Baby & Milestones',
      corporate: 'Corporate & Branded',
      home: 'Home Décor',
      gifts: 'Personalized Gifts',
      specialty: 'Specialty Items',
      other: 'Other'
    }[inquiry.category] || inquiry.category;

    const imagesHtml = inquiry.vision_images?.length > 0
      ? `<p><strong>Inspiration Photos (${inquiry.vision_images.length}):</strong></p>
         <ul>${inquiry.vision_images.map((img, idx) => `<li><a href="${img}">Image ${idx + 1}</a></li>`).join('')}</ul>`
      : '';

    const htmlBody = `
      <h2>New Inquiry from ${inquiry.name}</h2>
      <p><strong>Name:</strong> ${inquiry.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
      ${inquiry.phone ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>` : ''}
      <p><strong>Category:</strong> ${categoryLabel}</p>
      ${inquiry.event_date ? `<p><strong>Event/Need-By Date:</strong> ${new Date(inquiry.event_date).toLocaleDateString()}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${inquiry.message}</p>
      ${imagesHtml}
      <hr/>
      <p style="color:#888;font-size:12px">Submitted: ${new Date(inquiry.created_date || Date.now()).toLocaleString()}</p>
      <p style="color:#888;font-size:12px"><a href="https://craftedbydesign.co/Admin">View in Admin</a></p>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Crafted By Design Co. <onboarding@resend.dev>',
        to: ['craftedxdesignco@gmail.com'],
        subject: `New Inquiry from ${inquiry.name}`,
        html: htmlBody
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email via Resend');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send inquiry email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});