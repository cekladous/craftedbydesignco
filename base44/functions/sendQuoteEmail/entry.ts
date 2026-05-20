import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { inquiry, subject, quoteText } = await req.json();
    if (!inquiry || !quoteText) {
      return Response.json({ error: 'Missing inquiry or quoteText' }, { status: 400 });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const emailSubject = subject || `Your Custom Quote from Crafted By Design Co.`;

    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAF9F7; padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; color: #2D2D2D; font-weight: 400; margin: 0;">
            Crafted By Design Co.
          </h1>
          <div style="width: 40px; height: 1px; background: #C4A962; margin: 12px auto;"></div>
        </div>

        <p style="color: #2D2D2D; font-size: 16px;">Dear ${inquiry.name},</p>

        <p style="color: #6B6B6B; font-size: 15px; line-height: 1.7;">
          Thank you for reaching out! We've reviewed your project request and are excited to share the following quote with you.
        </p>

        <div style="background: white; border-left: 3px solid #C4A962; padding: 24px 28px; margin: 28px 0; border-radius: 2px;">
          <h2 style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #C4A962; margin: 0 0 14px 0;">
            Your Custom Quote
          </h2>
          <div style="color: #2D2D2D; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${quoteText}</div>
        </div>

        <p style="color: #6B6B6B; font-size: 15px; line-height: 1.7;">
          If you have any questions or would like to move forward, simply reply to this email or visit our contact page.
        </p>

        <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #E8E6E3; text-align: center;">
          <a href="https://craftedbydesign.co/Contact" 
             style="display: inline-block; background: #2D2D2D; color: white; padding: 12px 28px; text-decoration: none; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;">
            Get in Touch
          </a>
        </div>

        <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 28px;">
          Crafted By Design Co. · Handcrafted in New Jersey<br/>
          <a href="mailto:noreply@craftedbydesign.co" style="color: #C4A962;">noreply@craftedbydesign.co</a>
        </p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Crafted By Design Co. <noreply@craftedbydesign.co>',
        to: inquiry.email,
        subject: emailSubject,
        html: htmlBody
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await response.json();
    return Response.json({ success: true, id: result.id });
  } catch (error) {
    console.error('[sendQuoteEmail] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});