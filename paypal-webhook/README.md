# Webhook de PayPal → Firestore

Este mini-proyecto recibe los avisos de PayPal (suscripción activada, cobro
mensual/anual exitoso, cancelación, pago fallido, licencia perpetua) y
actualiza automáticamente el `estado` y `fechaVencimiento` del usuario en
Firestore. Es la pieza que hace que ya no tengas que marcar pagos a mano.

## 1. PayPal Developer Dashboard

1. Entra a https://developer.paypal.com con tu cuenta Business normal (no
   necesitas crear otra cuenta).
2. Ve a **Apps & Credentials** → crea una app (ej. "Gestor PRO Suscripciones").
   Copia el **Client ID** y el **Secret**. Usa el modo **Sandbox** primero
   para probar sin mover dinero real; cuando funcione, repites todo en **Live**.
3. Ve a **Products & Plans** (dentro de la sección de suscripciones) y crea:
   - Plan **Mensual**: US$10 / mes.
   - Plan **Anual**: US$99 / año.
   Copia el **Plan ID** de cada uno (empiezan con `P-...`).

   > Ya tienes esto hecho. Tus Plan IDs actuales son:
   > - Mensual: `P-1SG47089BE132232VNJNCANY`
   > - Anual: `P-2LB98290GW608062XNJNCCSI`

4. Para la **Licencia Perpetua** (US$249 pago único) estás usando un botón
   clásico de PayPal ("Payments Standard", `hosted_button_id`). No requiere
   Plan ID, pero **sí requiere que suscribas el webhook al evento**
   `PAYMENT.SALE.COMPLETED` (ya está en la lista de abajo) y que el formulario
   incluya un campo oculto `custom` con el `uid` del usuario — eso ya lo hace
   el código del modal que vamos a agregar en la app.

   > Tu botón actual: `hosted_button_id = 2UM2P86YUCZ8N`

   ⚠️ Importante: el **Client ID** que te dio el "Button Factory" es público
   y sirve para el frontend, pero el **Client Secret** que necesita este
   webhook (`PAYPAL_CLIENT_SECRET`) no viene en ese fragmento. Sácalo desde
   **Apps & Credentials** → tu app → "Show" junto al Secret.
5. Ve a **Webhooks** → **Add Webhook**. La URL será
   `https://TU-PROYECTO.vercel.app/api/webhook` (la tendrás después del paso 3
   de abajo). Suscríbete a estos eventos:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `PAYMENT.SALE.COMPLETED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
   - `PAYMENT.CAPTURE.COMPLETED`
   Copia el **Webhook ID** que te da PayPal al crearlo.

## 2. Credencial de Firebase (Service Account)

1. En la consola de Firebase → ⚙️ **Configuración del proyecto** →
   **Cuentas de servicio** → **Generar nueva clave privada**. Descarga el JSON.
2. **Nunca subas ese archivo a GitHub.** Lo vamos a pegar como variable de
   entorno en Vercel (paso siguiente), no como archivo en el repo.

## 3. Desplegar en Vercel

Necesitas tener [Node.js](https://nodejs.org) instalado en tu computador
(cualquier versión reciente sirve). Luego, en una terminal, párate dentro de
la carpeta `paypal-webhook` que te compartí y sigue esto **en orden**:

```bash
# 1. Instala la dependencia (firebase-admin)
npm install

# 2. Instala la CLI de Vercel (una sola vez, global)
npm install -g vercel

# 3. Inicia sesión (abre el navegador para confirmar)
vercel login

# 4. Primer despliegue (te va a preguntar el nombre del proyecto, acepta los
#    valores por defecto con Enter)
vercel

# 5. Carga cada variable de entorno (te va a pedir pegar el valor uno por uno)
vercel env add PAYPAL_CLIENT_ID production
vercel env add PAYPAL_CLIENT_SECRET production
vercel env add PAYPAL_WEBHOOK_ID production
vercel env add PAYPAL_PLAN_ANUAL production
vercel env add PAYPAL_ENV production
vercel env add FIREBASE_SERVICE_ACCOUNT production

# 6. Vuelve a desplegar, ahora ya en producción, con las variables cargadas
vercel --prod
```

Al terminar el paso 6 te va a mostrar una URL como
`https://paypal-webhook-suscripciones.vercel.app`. Tu endpoint real del
webhook queda en:

```
https://paypal-webhook-suscripciones.vercel.app/api/webhook
```

Esa es la URL que pegas en PayPal (paso 1.5 de arriba). No necesitas GitHub
para nada de esto — la CLI de Vercel sube el código directo desde tu
computador.

> 💡 Consejo sobre `FIREBASE_SERVICE_ACCOUNT`: cuando `vercel env add` te pida
> el valor, abre el archivo JSON que descargaste de Firebase, copia **todo**
> su contenido (con las llaves `{ }` incluidas) y pégalo como una sola línea.
> Si tu terminal no te deja pegar varias líneas limpio, puedes minificarlo
> primero así: `node -e "console.log(JSON.stringify(require('./tu-archivo.json')))"`
> y copiar esa salida.

Resumen de qué valor va en cada variable (revisa `.env.example` incluido):

| Variable | Valor |
|---|---|
| `PAYPAL_CLIENT_ID` | `BAAC1miBlLCl4HqCcAbVV2I8CJkg2jl6biB9wkykApK2oohjqbK0hhEMYeGR7Tmhsmx7gGt8zf36fWtSg` |
| `PAYPAL_CLIENT_SECRET` | sácalo de Apps & Credentials (no viene en el Button Factory) |
| `PAYPAL_WEBHOOK_ID` | el que copiaste al crear el webhook |
| `PAYPAL_PLAN_ANUAL` | `P-2LB98290GW608062XNJNCCSI` |
| `PAYPAL_ENV` | `sandbox` mientras pruebas, `live` cuando ya cobres real |
| `FIREBASE_SERVICE_ACCOUNT` | pega el **contenido completo** del JSON descargado, en una sola línea |

El plan mensual no necesita variable propia: el código trata como "mensual"
cualquier suscripción cuyo `plan_id` **no** sea el de `PAYPAL_PLAN_ANUAL`.

## 4. Probar

En el Developer Dashboard de PayPal (Sandbox), en la sección del webhook hay
un botón **"Send test webhook"** que te deja simular
`BILLING.SUBSCRIPTION.ACTIVATED` sin pagar de verdad. Revisa en Firestore que
el documento del usuario de prueba haya cambiado `estado` a `activo` y tenga
`fechaVencimiento` actualizada.

## Lo que ya está hecho del lado de la app (frontend)

Ya agregué el modal "Mi Suscripción" en `app.html`/`app.js`, con:
- Botón de acceso en el sidebar de escritorio (antes era solo texto) **y**
  un botón nuevo en el header móvil (antes no existía nada ahí).
- Los 3 botones de pago reales, con `custom_id`/`custom` = uid del usuario
  ya integrado, para que este webhook sepa a quién activar.
- Actualización en vivo (Firestore `onSnapshot`) apenas el webhook confirma
  el pago — sin recargar la página.

Lo único pendiente es desplegar este webhook (pasos de arriba) y pegar la
URL en PayPal.
