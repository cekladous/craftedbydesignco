import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const inquiry = payload.data;
    if (!inquiry) {
      return Response.json({ error: 'No inquiry data in payload' }, { status: 400 });
    }

    // Call the existing sendInquiryEmail function which already works
    await base44.asServiceRole.functions.invoke('sendInquiryEmail', { inquiry });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Notify inquiry error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});