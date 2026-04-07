import { sendEmail } from '../mail/sendEmail';
import { getRecipientsForNivelEvent } from './permissionRecipients';

export const NOTIFICATION_EVENTS = {
  COMMENT_ADDED: 'COMMENT_ADDED',
  SECTION_FINALIZED: 'SECTION_FINALIZED',
  DACA_APPROVED: 'DACA_APPROVED',
  DACA_DISAPPROVED: 'DACA_DISAPPROVED',
};

function norm(s) {
  return String(s ?? '').trim();
}

function htmlLayout({ title, subtitle = '', lines = [] }) {
  const safeTitle = norm(title);
  const safeSubtitle = norm(subtitle);
  const content = lines
    .map((line) => `<li style="margin: 6px 0;">${line}</li>`)
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">${safeTitle}</h2>
      ${safeSubtitle ? `<p style="margin-top: 0; color: #555;">${safeSubtitle}</p>` : ''}
      <ul style="padding-left: 18px;">${content}</ul>
      <p style="margin-top: 16px; color: #666; font-size: 12px;">
        Mensaje generado automaticamente por el sistema de informe MEN.
      </p>
    </div>
  `;
}

function validateContext(context = {}) {
  const required = ['programa', 'proceso', 'year', 'nivel'];
  for (const key of required) {
    if (!norm(context[key])) {
      throw new Error(`Missing context field: ${key}`);
    }
  }
}

function planEmailFromEnv() {
  return (
    process.env.PLAN_MEJORAMIENTO_EMAIL ||
    'plan.mejoramiento@correounivalle.edu.co'
  );
}

async function buildJobsForCommentAdded({ context, actor, payload }) {
  // const planEmail = planEmailFromEnv();
  const recipients = await getRecipientsForNivelEvent({
    ...context,
    includePlanEmail: false,
    // planEmail,
  });

  const to = recipients.allRecipients;
  if (to.length === 0) return [];

  const sectionName = norm(payload?.sectionName) || `Nivel ${context.nivel}`;
  const elementId = norm(payload?.elementId) || 'N/A';
  const elementName = norm(payload?.elementName) || elementId;
  const comment = norm(payload?.commentText) || '(Sin texto)';
  const actorEmail = norm(actor?.email) || 'desconocido';

  return [
    {
      key: 'comment-added',
      to,
      subject: `[Informe MEN] Nuevo comentario en ${context.programa}`,
      html: htmlLayout({
        title: 'Nuevo comentario registrado',
        subtitle: `Programa ${context.programa} / ${context.proceso} ${context.year}`,
        lines: [
          `<b>Sección:</b> ${sectionName}`,
          `<b>Elemento:</b> ${elementName}`,
          `<b>Usuario:</b> ${actorEmail}`,
          `<b>Comentario:</b> ${comment}`,
        ],
      }),
      meta: {
        editorRecipients: recipients.editorEmails,
        includesPlanEmail: true,
      },
    },
  ];
}

async function buildJobsForSectionFinalized({ context, actor, payload }) {
  const planEmail = planEmailFromEnv();
  const actorEmail = norm(actor?.email);
  const sectionName = norm(payload?.sectionName) || `Nivel ${context.nivel}`;
  const actorName = norm(actor?.name) || actorEmail || 'editor';

  const jobs = [];

  if (actorEmail) {
    jobs.push({
      key: 'section-finalized-confirmation',
      to: [actorEmail],
      subject: `[Informe MEN] Confirmacion de seccion finalizada (${context.programa} - ${context.proceso})`,
      html: htmlLayout({
        title: 'Confirmacion de accion registrada',
        subtitle: `Programa ${context.programa} / ${context.proceso} ${context.year}`,
        lines: [
          `${actorName} ha confirmado la seccion de <b>${sectionName}</b> como finalizada. A partir de este momento la sección se encuentra en proceso de aprobación por DACA, cualquier actualización se le notificará por correo electronico.`,
          // `<b>Seccion:</b> ${sectionName}`,
          // `<b>Nivel:</b> ${context.nivel}`,
          `<b>Fecha de confirmación:</b> ${new Date().toISOString()}`,
        ],
      }),
      meta: { audience: 'actor' },
    });
  }

   jobs.push({
     key: 'section-finalized-review-request',
     to: [planEmail],
     subject: `[Informe MEN] Solicitud de revision DACA (${context.programa} - ${context.proceso})`,
     html: htmlLayout({
       title: 'Solicitud de revision',
       subtitle: `Programa ${context.programa} / ${context.proceso} ${context.year}`,
       lines: [
         `Se marco una seccion como finalizada y requiere revision DACA.`,
         `<b>Seccion:</b> ${sectionName}`,
         // `<b>Nivel:</b> ${context.nivel}`,
         `<b>Usuario:</b> ${actorEmail || 'desconocido'}`,
       ],
     }),
     meta: { audience: 'plan-email' },
   });

  return jobs;
}

async function buildJobsForDacaApproved({ context, payload }) {
  const recipients = await getRecipientsForNivelEvent({
    ...context,
    includePlanEmail: false,
  });

  if (recipients.editorEmails.length === 0) return [];

  const sectionName = norm(payload?.sectionName) || `Nivel ${context.nivel}`;

  return [
    {
      key: 'daca-approved',
      to: recipients.editorEmails,
      subject: `[Informe MEN] Seccion aprobada por DACA (${context.programa} - ${context.proceso})`,
      html: htmlLayout({
        title: 'Seccion aprobada por DACA',
        subtitle: `Programa ${context.programa} / ${context.proceso} ${context.year}`,
        lines: [
          // `<b>Seccion:</b> ${sectionName}`,
          // `<b>Nivel:</b> ${context.nivel}`,
          `La sección de <b>${sectionName}</b> ha sido aprobada con éxito y ya no requiere ajustes adicionales.`,
        ],
      }),
      meta: {
        editorRecipients: recipients.editorEmails,
      },
    },
  ];
}

async function buildJobsForDacaDisapproved({ context, payload }) {
  const recipients = await getRecipientsForNivelEvent({
    ...context,
    includePlanEmail: false,
  });

  if (recipients.editorEmails.length === 0) return [];

  const sectionName = norm(payload?.sectionName) || `Nivel ${context.nivel}`;

  return [
    {
      key: 'daca-disapproved',
      to: recipients.editorEmails,
      subject: `[Informe MEN] Seccion NO aprobada por DACA (${context.programa} - ${context.proceso})`,
      html: htmlLayout({
        title: 'Seccion no aprobada por DACA',
        subtitle: `Programa ${context.programa} / ${context.proceso} ${context.year}`,
        lines: [
          // `<b>Seccion:</b> ${sectionName}`,
          // `<b>Nivel:</b> ${context.nivel}`,
          `La sección <b>${sectionName}</b> no fue aprobada por DACA. La edición ha sido restablecida para realizar ajustes. Por favor, revisar los comentarios y solicitar revisión nuevamente.`,
        ],
      }),
      meta: {
        editorRecipients: recipients.editorEmails,
      },
    },
  ];
}

async function buildNotificationJobs({ eventType, context, actor, payload }) {
  switch (eventType) {
    case NOTIFICATION_EVENTS.COMMENT_ADDED:
      return buildJobsForCommentAdded({ context, actor, payload });
    case NOTIFICATION_EVENTS.SECTION_FINALIZED:
      return buildJobsForSectionFinalized({ context, actor, payload });
    case NOTIFICATION_EVENTS.DACA_APPROVED:
      return buildJobsForDacaApproved({ context, payload });
    case NOTIFICATION_EVENTS.DACA_DISAPPROVED:
      return buildJobsForDacaDisapproved({ context, payload });
    default:
      throw new Error(`Unsupported eventType: ${eventType}`);
  }
}

export async function notifyByEvent({
  eventType,
  context,
  actor = {},
  payload = {},
  dryRun = false,
}) {
  if (!norm(eventType)) throw new Error('Missing eventType');
  validateContext(context);

  const jobs = await buildNotificationJobs({ eventType, context, actor, payload });

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      eventType,
      jobs,
    };
  }

  const results = [];
  for (const job of jobs) {
    const sent = await sendEmail({
      to: job.to,
      subject: job.subject,
      html: job.html,
    });

    results.push({
      key: job.key,
      to: job.to,
      subject: job.subject,
      meta: job.meta || {},
      mailResult: sent,
    });
  }

  return {
    ok: true,
    dryRun: false,
    eventType,
    count: results.length,
    results,
  };
}