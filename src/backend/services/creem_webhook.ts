// Creem Webhook 事件处理服务
import { getDb } from "../config/db";
import { CreemWebhookEvent } from "../types/creem";

export async function createWebhookEvent(event: CreemWebhookEvent) {
  const db = getDb();
  const result = await db.query(
    `INSERT INTO creem_webhook_events (event_id, event_type, raw_data, processed, created_at) 
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (event_id) DO UPDATE SET
       event_type = EXCLUDED.event_type,
       raw_data = EXCLUDED.raw_data,
       processed = EXCLUDED.processed
     RETURNING *`,
    [event.event_id, event.event_type, event.raw_data, event.processed, new Date()]
  );
  return result.rows[0];
}

export async function getWebhookEventByEventId(eventId: string): Promise<CreemWebhookEvent | null> {
  const db = getDb();
  const result = await db.query(
    `SELECT * FROM creem_webhook_events WHERE event_id = $1`,
    [eventId]
  );
  return result.rows[0] || null;
}

export async function markWebhookEventAsProcessed(eventId: string) {
  const db = getDb();
  await db.query(
    `UPDATE creem_webhook_events SET processed = true WHERE event_id = $1`,
    [eventId]
  );
}

export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const event = await getWebhookEventByEventId(eventId);
  return event?.processed || false;
}