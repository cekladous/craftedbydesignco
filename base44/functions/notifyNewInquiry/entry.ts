import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const inquiry = payload.data;
    if (!inquiry) {
      return Response.json({ error: 'No inquiry data in payload' }, { status: 400 });
    }

    const categoryLabel = {
      wedding: 'Wedding Signage',
      baby: 'Baby & Milestones',
      corporate: 'Corporate & Branded',
      home: 'Home Décor',
      gifts: 'Personalized Gifts',
      specialty: 'Specialty Items',
      other: 'Other'
    }[inquiry.category] || inquiry.category || 'Not specified';

    const emailBody = `
New Inquiry Received!

Customer Name: ${inquiry.name}
Email: ${inquiry.email}
${inquiry.phone ? `Phone: ${inquiry.phone}` : ''}

Category: ${categoryLabel}
${inquiry.event_date ? `Event/Need-By Date: ${new Date(inquiry.event_date).toLocaleDateString()}` : ''}

Message:
${inquiry.message}
${inquiry.vision_images?.length > 0 ? `
Inspiration Photos: ${inquiry.vision_images.length} image(s) submitted
${inquiry.vision_images.map((img, idx) => `${idx + 1}. ${img}`).join('\n')}
` : ''}

---
Submitted: ${new Date(inquiry.created_date).toLocaleString()}
View in admin: https://craftedbydesign.co/Admin
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'craftedxdesignco@gmail.com',
      from_name: 'Crafted By Design Co.',
      subject: `🎨 New Inquiry from ${inquiry.name}`,
      body: emailBody
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Notify inquiry error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});