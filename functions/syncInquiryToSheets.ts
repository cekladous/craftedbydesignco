import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { inquiry } = await req.json();

    // Get Google Sheets access token and spreadsheet ID
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
    const spreadsheetId = Deno.env.get('GOOGLE_SHEET_ID');

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID not configured');
    }

    // Format the data row
    const rowData = [
      new Date(inquiry.created_date).toLocaleString(),
      inquiry.name,
      inquiry.email,
      inquiry.phone || '',
      inquiry.category || '',
      inquiry.event_date ? new Date(inquiry.event_date).toLocaleDateString() : '',
      inquiry.message,
      inquiry.status || 'new',
      `${inquiry.vision_images?.length || 0} images`
    ];

    // Append to spreadsheet
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [rowData]
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sheets API error: ${error}`);
    }

    const result = await response.json();

    return Response.json({ 
      success: true, 
      updatedRange: result.updates.updatedRange
    });
  } catch (error) {
    console.error('Sheets sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});