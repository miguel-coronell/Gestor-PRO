// api/webhook.js
// Endpoint que PayPal llama cada vez que pasa algo con una suscripción o un pago.
// Verifica la firma, y según el evento, actualiza Firestore (colección "usuarios").

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}
const db = admin.firestore();

const PAYPAL_API =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// --- Precios y duración de cada plan (ajusta si cambian) ---
const PLANES = {
  mensual: { dias: 30, monto: 10 },
  anual: { dias: 365, monto: 99 },
};

function calcularFechaFutura(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString();
}

async function obtenerAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

// Confirma con PayPal que este webhook realmente vino de ellos (no de un tercero)
async function firmaValida(headers, body) {
  const accessToken = await obtenerAccessToken();
  const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: body,
    }),
  });
  const data = await res.json();
  return data.verification_status === 'SUCCESS';
}

async function buscarUsuarioPorSubscriptionId(subscriptionId) {
  const snap = await db
    .collection('usuarios')
    .where('paypalSubscriptionId', '==', subscriptionId)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const evento = req.body;

  let esValido = false;
  try {
    esValido = await firmaValida(req.headers, evento);
  } catch (err) {
    console.error('Error verificando firma:', err);
  }
  if (!esValido) {
    console.warn('Webhook rechazado: firma inválida');
    return res.status(400).json({ error: 'Firma inválida' });
  }

  const tipo = evento.event_type;
  const resource = evento.resource || {};

  try {
    switch (tipo) {
      // --- Se activó una suscripción nueva (mensual o anual) ---
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const uid = resource.custom_id;
        if (!uid) break;
        const plan =
          resource.plan_id === process.env.PAYPAL_PLAN_ANUAL ? 'anual' : 'mensual';
        const { dias, monto } = PLANES[plan];

        await db.collection('usuarios').doc(uid).set(
          {
            estado: 'activo',
            plan,
            paypalSubscriptionId: resource.id,
            fechaVencimiento: calcularFechaFutura(dias),
          },
          { merge: true }
        );
        await db.collection('usuarios').doc(uid).collection('pagos').add({
          fecha: new Date().toISOString(),
          monto,
          tipo: 'suscripcion_activada',
          paypalSubscriptionId: resource.id,
        });
        break;
      }

      // --- Cobro recurrente exitoso: extiende el vencimiento ---
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.billing_agreement_id;

        if (subscriptionId) {
          // Cobro de una suscripción (mensual/anual)
          const doc = await buscarUsuarioPorSubscriptionId(subscriptionId);
          if (doc) {
            const perfil = doc.data();
            const dias = PLANES[perfil.plan]?.dias || 30;
            await doc.ref.set(
              { estado: 'activo', fechaVencimiento: calcularFechaFutura(dias) },
              { merge: true }
            );
            await doc.ref.collection('pagos').add({
              fecha: new Date().toISOString(),
              monto: parseFloat(resource.amount?.total || 0),
              tipo: 'cobro_recurrente',
              paypalSaleId: resource.id,
            });
          }
          break;
        }

        // Sin billing_agreement_id: es un pago único del botón clásico
        // (Licencia Perpetua). El uid viaja en el campo "custom" del form.
        const uid = resource.custom;
        if (uid) {
          await db.collection('usuarios').doc(uid).set(
            { estado: 'activo', plan: 'perpetua', fechaVencimiento: null },
            { merge: true }
          );
          await db.collection('usuarios').doc(uid).collection('pagos').add({
            fecha: new Date().toISOString(),
            monto: parseFloat(resource.amount?.total || 249),
            tipo: 'licencia_perpetua',
            paypalSaleId: resource.id,
          });
        }
        break;
      }

      // --- El usuario canceló, o PayPal la dio de baja tras varios fallos ---
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const doc = await buscarUsuarioPorSubscriptionId(resource.id);
        if (doc) await doc.ref.set({ estado: 'vencido' }, { merge: true });
        break;
      }

      // --- Falló un cobro: aquí podrías dar unos días de gracia en vez de cortar ---
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const doc = await buscarUsuarioPorSubscriptionId(resource.id);
        if (doc) {
          await doc.ref.set(
            { estado: 'pago_fallido', avisoUltimoFallo: new Date().toISOString() },
            { merge: true }
          );
        }
        break;
      }

      // --- Pago único de la Licencia Perpetua ---
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const uid = resource.custom_id;
        if (!uid) break;
        await db.collection('usuarios').doc(uid).set(
          { estado: 'activo', plan: 'perpetua', fechaVencimiento: null },
          { merge: true }
        );
        await db.collection('usuarios').doc(uid).collection('pagos').add({
          fecha: new Date().toISOString(),
          monto: 249,
          tipo: 'licencia_perpetua',
          paypalCaptureId: resource.id,
        });
        break;
      }

      default:
        console.log('Evento no manejado:', tipo);
    }

    return res.status(200).json({ recibido: true });
  } catch (err) {
    console.error('Error procesando webhook:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
};
