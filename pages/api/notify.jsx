import {
  notifyByEvent,
  NOTIFICATION_EVENTS,
} from '../../libs/server/notifications/notificationService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ status: false, error: 'Method not allowed' });
  }

  try {
    const {
      eventType,
      context,
      actor,
      payload,
      dryRun = true,
    } = req.body || {};

    const result = await notifyByEvent({
      eventType,
      context,
      actor,
      payload,
      dryRun: Boolean(dryRun),
    });

    return res.status(200).json({
      status: true,
      supportedEvents: NOTIFICATION_EVENTS,
      data: result,
    });
  } catch (error) {
    console.error('[api/notify] error:', error);
    return res.status(500).json({
      status: false,
      error: error?.message || 'Internal Server Error',
    });
  }
}