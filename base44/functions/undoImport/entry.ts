import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { createdIds, previousState } = await req.json();

    console.log('=== UNDO IMPORT STARTED ===');
    console.log(`Deleting ${createdIds?.length || 0} created items`);
    console.log(`Restoring ${previousState?.length || 0} updated items`);

    let deleted = 0;
    let restored = 0;
    const errors = [];

    // Delete created items
    if (createdIds && createdIds.length > 0) {
      for (const id of createdIds) {
        try {
          await base44.asServiceRole.entities.PortfolioItem.delete(id);
          deleted++;
        } catch (error) {
          console.error(`Failed to delete ${id}:`, error);
          errors.push({ id, action: 'delete', error: error.message });
        }
      }
    }

    // Restore updated items to previous state
    if (previousState && previousState.length > 0) {
      for (const item of previousState) {
        try {
          await base44.asServiceRole.entities.PortfolioItem.update(item.id, item.data);
          restored++;
        } catch (error) {
          console.error(`Failed to restore ${item.id}:`, error);
          errors.push({ id: item.id, action: 'restore', error: error.message });
        }
      }
    }

    console.log('=== UNDO COMPLETE ===');
    console.log(`Deleted: ${deleted}, Restored: ${restored}, Errors: ${errors.length}`);

    return Response.json({
      success: true,
      deleted,
      restored,
      errors
    });
  } catch (error) {
    console.error('Undo Import Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});