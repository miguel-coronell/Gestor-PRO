/* =====================================================================
   GESTOR PRO — WEBHOOK DE PAYPAL (Firebase Cloud Functions)
   =====================================================================
   ESTE ARCHIVO NO SE SUBE A TU APP WEB. Se despliega como una Cloud
   Function de Firebase (backend). Es la pieza que falta para que el pago
   de PayPal active el plan PRO de forma segura e infalsificable: PayPal
   le avisa a ESTA función cuando un pago se aprueba, y la función es la
   única que tiene permiso para marcar la cuenta como "activo" en Firestore.

   POR QUÉ ES NECESARIO:
   El navegador del usuario NUNCA debe tener permiso para escribir
   directamente "estado: activo" en su propio documento de Firestore,
   porque cualquiera podría abrir la consola del navegador y hacerlo sin
   pagar. Por eso este paso vive en el servidor.

   PASOS PARA DESPLEGARLA:
   1. npm install -g firebase-tools
   2. firebase init functions   (elige tu proyecto "gestor-pro-9ec3c")
   3. Copia este archivo como functions/index.js
   4. En el panel de PayPal Developer -> Webhooks, registra la URL que te
      da Firebase al desplegar, suscrita al evento:
      BILLING.SUBSCRIPTION.ACTIVATED (y opcionalmente .CANCELLED / .EXPIRED)
   5. firebase deploy --only functions
   ===================================================================== */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const DIAS_SUSCRIPCION = 30;

exports.paypalWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const evento = req.body;

        // TODO (seguridad): antes de confiar en el evento, verifica la firma
        // del webhook contra la API de PayPal (Verify Webhook Signature).
        // Documentación: https://developer.paypal.com/api/rest/webhooks/

        if (evento.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
            const uid = evento.resource && evento.resource.custom_id;
            if (uid) {
                const fechaVencimiento = new Date();
                fechaVencimiento.setDate(fechaVencimiento.getDate() + DIAS_SUSCRIPCION);

                await db.collection("usuarios").doc(uid).update({
                    estado: "activo",
                    plan: "pro",
                    fechaVencimiento: fechaVencimiento.toISOString(),
                    paypalSubscriptionId: evento.resource.id
                });
            }
        }

        if (evento.event_type === "BILLING.SUBSCRIPTION.CANCELLED" ||
            evento.event_type === "BILLING.SUBSCRIPTION.EXPIRED") {
            const uid = evento.resource && evento.resource.custom_id;
            if (uid) {
                await db.collection("usuarios").doc(uid).update({ estado: "vencido" });
            }
        }

        res.status(200).send("OK");
    } catch (err) {
        console.error("Error procesando webhook de PayPal:", err);
        res.status(500).send("Error");
    }
});
