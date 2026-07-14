/* =====================================================================
   GESTOR PRO — INTEGRACIÓN DE PAYPAL (SUSCRIPCIONES)
   =====================================================================
   Este archivo es el PUNTO DE PARTIDA para cobrar la suscripción mensual
   con PayPal. Con esto el usuario puede pagar, pero para que el pago
   "desbloquee" la cuenta de forma SEGURA todavía falta el paso de servidor
   (ver el archivo functions-paypal-webhook.js más abajo). Nunca actives
   el plan PRO solo con el evento onApprove del navegador: cualquier
   persona podría simular ese evento sin haber pagado realmente.

   PASOS PARA ACTIVAR ESTO:
   1. Crea una cuenta de PayPal Business y entra a developer.paypal.com
   2. Crea una App -> obtén tu CLIENT_ID (modo Sandbox primero, luego Live)
   3. Crea un "Product" y un "Plan" de suscripción mensual -> copia el PLAN_ID
   4. Reemplaza CLIENT_ID y PLAN_ID abajo
   5. Incluye este script en app.html DESPUÉS del SDK de PayPal:
      <script src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&vault=true&intent=subscription"></script>
      <script src="paypal-integration.js" defer></script>
   6. Agrega en tu HTML (por ejemplo, dentro de "pantalla-vencido" o una
      nueva sección "Mi Plan") un contenedor vacío:
      <div id="paypal-button-container"></div>
   ===================================================================== */

const PAYPAL_PLAN_ID = "P-XXXXXXXXXXXXXXXXXXXX"; // <-- reemplaza con tu Plan ID real

function renderBotonSuscripcionPayPal(containerId = "paypal-button-container") {
    const contenedor = document.getElementById(containerId);
    if (!contenedor || typeof paypal === "undefined") {
        console.warn("PayPal SDK no está cargado o el contenedor no existe.");
        return;
    }
    contenedor.innerHTML = ""; // evita botones duplicados si se vuelve a llamar

    paypal.Buttons({
        style: { shape: "pill", color: "blue", layout: "vertical", label: "subscribe" },

        createSubscription: function (data, actions) {
            return actions.subscription.create({
                plan_id: PAYPAL_PLAN_ID,
                // Referencia interna: así el webhook (servidor) sabe a qué
                // usuario de Firebase pertenece este pago.
                custom_id: (window.usuarioFirebase && window.usuarioFirebase.uid) || ""
            });
        },

        onApprove: function (data) {
            // IMPORTANTE: esto es solo optimismo visual (feedback inmediato).
            // La activación REAL y segura del plan la hace tu servidor cuando
            // PayPal le notifica el webhook "BILLING.SUBSCRIPTION.ACTIVATED".
            mostrarMensajeProcesandoPago(data.subscriptionID);
        },

        onError: function (err) {
            console.error("Error en el pago de PayPal:", err);
            alert("Ocurrió un problema procesando el pago. Intenta de nuevo o contáctanos por WhatsApp.");
        }
    }).render("#" + containerId);
}

function mostrarMensajeProcesandoPago(subscriptionId) {
    alert(
        "¡Gracias! Tu pago fue recibido (ID: " + subscriptionId + ").\n" +
        "Tu cuenta se activará automáticamente en los próximos segundos."
    );
    // Aquí podrías, por ejemplo, mostrar un spinner y volver a consultar
    // el perfil del usuario en Firestore cada pocos segundos hasta ver
    // estado: "activo" (el webhook del servidor lo actualiza).
}

// Llama a esto cuando muestres la pantalla de "prueba vencida" o la
// sección de "Mi Plan":
// renderBotonSuscripcionPayPal();
