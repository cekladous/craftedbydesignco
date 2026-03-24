import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('[Calendar Sync] Function called');
    
    const { inquiry } = await req.json();
    console.log('[Calendar Sync] Inquiry received:', inquiry?.name);

    // Get Google Calendar access token
    console.log('[Calendar Sync] Getting access token...');
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
    console.log('[Calendar Sync] Access token retrieved');

    // Prepare event data
    const eventDate = inquiry.event_date 
      ? new Date(inquiry.event_date)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now if no date

    const event = {
      summary: `Inquiry: ${inquiry.name} - ${inquiry.category || 'General'}`,
      description: `New inquiry from ${inquiry.name}\n\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone || 'Not provided'}\n\nMessage:\n${inquiry.message}`,
      start: {
        date: eventDate.toISOString().split('T')[0]
      },
      end: {
        date: eventDate.toISOString().split('T')[0]
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    // Create calendar event
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendar API error: ${error}`);
    }

    const calendarEvent = await response.json();

    return Response.json({ 
      success: true, 
      eventId: calendarEvent.id,
      eventLink: calendarEvent.htmlLink
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});