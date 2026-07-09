/* =====================================================================
   APP DE COTIZACIONES / FACTURAS MULTI-RUBRO
   Rediseño completo: categorías dinámicas, logo por empresa,
   firmas digitales, generación de PDF, envío por WhatsApp/Correo.
   ===================================================================== */

// ---------------------------------------------------------------------
// 1. BASE DE DATOS DE RUBROS (CATEGORÍAS -> SERVICIOS / MATERIALES)
// ---------------------------------------------------------------------
const CATEGORIAS = {
    construccion: {
        label: "Construcción y Arquitectura",
        icon: "hammer",
        servicios: [
            "Construcción de Kiosco", "Creación de Mallas", "Instalación de Mallas",
            "Estructura y Postes", "Tejido de Palma", "Inmunización y Lijado",
            "Barnizado y Pintura", "Mantenimiento y Refuerzo", "Restauración de Tejido",
            "Transporte de Materiales", "Retiro de Escombros", "Logística de Obra",
            "Instalación Eléctrica", "Instalación de Pisos"
        ],
        materiales: [
            "Palma Amarga", "Malla Pre-tejida", "Poste de Eucalipto", "Vara de Palma",
            "Vara de Caña Brava", "Bejuco de Amarre", "Madera Inmunizada", "Cemento Gris",
            "Arena y Gravilla", "Barniz y Sellador", "Inmunizante Líquido", "Pintura Vinilo",
            "Pernos y Tornillos", "Clavo Galvanizado"
        ]
    },
    salud: {
        label: "Salud y Bienestar",
        icon: "heart-pulse",
        servicios: [
            "Consulta General", "Terapia Física", "Control de Signos Vitales",
            "Jornada de Vacunación", "Curaciones", "Nutrición y Dietética",
            "Consulta Psicológica", "Valoración Odontológica", "Toma de Muestras / Laboratorio",
            "Cuidado Domiciliario", "Acompañamiento a Adulto Mayor"
        ],
        materiales: [
            "Guantes de Nitrilo", "Alcohol Antiséptico", "Gasas Estériles",
            "Jeringas Desechables", "Termómetro Digital", "Tensiómetro",
            "Kit de Curación", "Mascarillas", "Vendas Elásticas", "Suero Fisiológico"
        ]
    },
    hogar: {
        label: "Servicios para el Hogar",
        icon: "home",
        servicios: [
            "Limpieza General", "Plomería", "Electricidad Residencial",
            "Pintura de Interiores", "Jardinería", "Fumigación y Control de Plagas",
            "Mudanzas", "Reparación de Electrodomésticos", "Cerrajería",
            "Mantenimiento de Piscinas", "Instalación de Cortinas"
        ],
        materiales: [
            "Pintura Vinilo", "Tubería PVC", "Cable Eléctrico", "Cerraduras",
            "Insumos de Limpieza", "Fertilizante", "Bombillos LED",
            "Sellador de Silicona", "Cinta Aislante", "Herramientas Menores"
        ]
    },
    tecnologia: {
        label: "Tecnología e Informática",
        icon: "cpu",
        servicios: [
            "Soporte Técnico", "Instalación de Redes", "Desarrollo de Software",
            "Mantenimiento de Equipos", "Recuperación de Datos", "Instalación de Cámaras",
            "Configuración de Servidores", "Diseño Web", "Capacitación Informática",
            "Migración de Datos"
        ],
        materiales: [
            "Cable de Red UTP", "Router / Access Point", "Disco Duro / SSD",
            "Memoria RAM", "Switch de Red", "Cámara de Seguridad",
            "Licencias de Software", "Batería UPS", "Conectores RJ45", "Antivirus"
        ]
    },
    belleza: {
        label: "Belleza y Estética",
        icon: "sparkles",
        servicios: [
            "Corte de Cabello", "Manicure y Pedicure", "Maquillaje Profesional",
            "Tratamiento Facial", "Depilación", "Masajes Relajantes",
            "Peinado para Eventos", "Coloración de Cabello", "Extensiones de Pestañas",
            "Spa Corporal"
        ],
        materiales: [
            "Esmalte de Uñas", "Tinte para Cabello", "Crema Facial",
            "Cera Depilatoria", "Aceite para Masaje", "Extensiones de Pestañas",
            "Productos de Maquillaje", "Toallas Desechables", "Shampoo Profesional", "Guantes"
        ]
    },
    eventos: {
        label: "Eventos y Catering",
        icon: "party-popper",
        servicios: [
            "Organización de Eventos", "Catering y Banquetes", "Decoración Temática",
            "Sonido e Iluminación", "Fotografía y Video", "Alquiler de Mobiliario",
            "Animación Infantil", "Coordinación Logística", "Alquiler de Carpas",
            "Servicio de Meseros"
        ],
        materiales: [
            "Manteles", "Vajilla Desechable", "Globos y Decoración",
            "Insumos de Catering", "Luces LED", "Sillas y Mesas",
            "Sistema de Sonido", "Carpas", "Centros de Mesa", "Servilletas"
        ]
    },
    transporte: {
        label: "Transporte y Logística",
        icon: "truck",
        servicios: [
            "Transporte de Carga", "Mudanzas", "Mensajería Urgente",
            "Distribución de Mercancía", "Alquiler de Vehículo con Conductor",
            "Logística de Última Milla"
        ],
        materiales: [
            "Combustible", "Peajes", "Empaques y Embalaje",
            "Cinta de Embalaje", "Seguro de Carga", "Mantenimiento Vehicular"
        ]
    },
    otro: {
        label: "Otro / Personalizado",
        icon: "briefcase",
        servicios: [],
        materiales: []
    }
};

let categoriaActual = "construccion";

// ---------------------------------------------------------------------
// 2. CONFIGURACIÓN DE EMPRESA (nombre, contacto, LOGO propio)
// ---------------------------------------------------------------------
let LOGO_BASE64 = "";
const EMPRESA_DEFAULT = {
    nombre: "Mi Negocio",
    slogan: "Servicios Profesionales de Calidad",
    nit: "",
    telefono: "",
    email: "",
    direccion: "",
    firmante: "Representante Legal"
};
let EMPRESA = { ...EMPRESA_DEFAULT };

function cargarConfigEmpresa() {
    try {
        const guardado = localStorage.getItem('empresa_datos');
        if (guardado) EMPRESA = { ...EMPRESA_DEFAULT, ...JSON.parse(guardado) };
        const logo = localStorage.getItem('empresa_logo');
        if (logo) LOGO_BASE64 = logo;

        const colorGuardado = localStorage.getItem('empresa_color'); // <-- nuevo
        if (colorGuardado) aplicarColorMarca(JSON.parse(colorGuardado)); // <-- nuevo
    } catch (e) { console.warn("No se pudo cargar configuración guardada", e); }
    pintarConfigEnFormulario();
}

function pintarConfigEnFormulario() {
    const map = {
        emp_nombre: EMPRESA.nombre, emp_slogan: EMPRESA.slogan, emp_nit: EMPRESA.nit,
        emp_telefono: EMPRESA.telefono, emp_email: EMPRESA.email,
        emp_direccion: EMPRESA.direccion, emp_firmante: EMPRESA.firmante
    };
    Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
    });
    actualizarMarcaEnUI();
    if (LOGO_BASE64) {
        const prev = document.getElementById('logo-preview');
        if (prev) { prev.src = LOGO_BASE64; prev.classList.remove('hidden'); }
        const ph = document.getElementById('logo-placeholder');
        if (ph) ph.classList.add('hidden');
        document.querySelectorAll('.logo-mini').forEach(img => { img.src = LOGO_BASE64; img.classList.remove('hidden'); });
        document.querySelectorAll('.logo-placeholder-icon').forEach(icon => icon.classList.add('hidden'));
    }
}

function guardarConfigEmpresa() {
    EMPRESA = {
        nombre: document.getElementById('emp_nombre').value || EMPRESA_DEFAULT.nombre,
        slogan: document.getElementById('emp_slogan').value,
        nit: document.getElementById('emp_nit').value,
        telefono: document.getElementById('emp_telefono').value,
        email: document.getElementById('emp_email').value,
        direccion: document.getElementById('emp_direccion').value,
        firmante: document.getElementById('emp_firmante').value || EMPRESA_DEFAULT.firmante
    };
    localStorage.setItem('empresa_datos', JSON.stringify(EMPRESA));
    actualizarMarcaEnUI();
    cerrarAvisoEmpresaMovil(); // <-- ya configuró, se oculta la notificación

    const btn = document.getElementById('btn-guardar-empresa');
    if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="check-circle-2" class="w-5 h-5"></i> Guardado`;
        lucide.createIcons();
        setTimeout(() => { btn.innerHTML = original; lucide.createIcons(); }, 1800);
    }
}

function actualizarMarcaEnUI() {
    document.querySelectorAll('.marca-nombre').forEach(el => el.innerText = EMPRESA.nombre);
    document.querySelectorAll('.marca-slogan').forEach(el => el.innerText = EMPRESA.slogan);
     const anio = new Date().getFullYear();
    const nombreCorto = EMPRESA.nombre || 'Mi Negocio';
    const textoCopyright = `© ${anio} ${nombreCorto}`;
    const footerDesktop = document.getElementById('footer-copyright-desktop');
    const footerEmpresa = document.getElementById('footer-copyright-empresa');
    if (footerDesktop) footerDesktop.innerText = textoCopyright;
    if (footerEmpresa) footerEmpresa.innerText = textoCopyright;
}

function handleLogoUpload(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        LOGO_BASE64 = e.target.result;
        localStorage.setItem('empresa_logo', LOGO_BASE64);
        const prev = document.getElementById('logo-preview');
        const ph = document.getElementById('logo-placeholder');
        if (prev) { prev.src = LOGO_BASE64; prev.classList.remove('hidden'); }
        if (ph) ph.classList.add('hidden');
        document.querySelectorAll('.logo-mini').forEach(img => { img.src = LOGO_BASE64; img.classList.remove('hidden'); });
        document.querySelectorAll('.logo-placeholder-icon').forEach(icon => icon.classList.add('hidden'));

        // --- NUEVO: detectar color dominante y aplicarlo ---
        const color = await extraerColorDominante(LOGO_BASE64);
        if (color) {
            aplicarColorMarca(color);
            localStorage.setItem('empresa_color', JSON.stringify(color));
        }
    };
    reader.readAsDataURL(file);
}


function quitarLogo() {
    if (!confirm("¿Quitar el logo actual?")) return;
    LOGO_BASE64 = "";
    localStorage.removeItem('empresa_logo');
    localStorage.removeItem('empresa_color');          // <-- nuevo
    aplicarColorMarca([29, 78, 137]);                   // <-- nuevo: vuelve al azul por defecto
    const prev = document.getElementById('logo-preview');
    const ph = document.getElementById('logo-placeholder');
    if (prev) prev.classList.add('hidden');
    if (ph) ph.classList.remove('hidden');
    document.querySelectorAll('.logo-mini').forEach(img => { img.classList.add('hidden'); img.src=''; });
    document.querySelectorAll('.logo-placeholder-icon').forEach(icon => icon.classList.remove('hidden'));
}



// ---------------------------------------------------------------------
// COLOR DE MARCA AUTOMÁTICO (extraído del logo)
// ---------------------------------------------------------------------
let COLOR_MARCA = [29, 78, 137]; // Azul corporativo por defecto (fallback)

function extraerColorDominante(imgSrc) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const size = 50; // reducimos tamaño para que sea rápido
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);

            let data;
            try { data = ctx.getImageData(0, 0, size, size).data; }
            catch (e) { resolve(null); return; } // logo con CORS bloqueado, etc.

            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                const alpha = data[i + 3];
                if (alpha < 100) continue; // ignora transparencia
                const rr = data[i], gg = data[i + 1], bb = data[i + 2];
                const brillo = (rr + gg + bb) / 3;
                if (brillo > 245 || brillo < 12) continue; // ignora blancos/negros del fondo
                r += rr; g += gg; b += bb; count++;
            }
            if (count === 0) { resolve(null); return; }
            resolve([Math.round(r / count), Math.round(g / count), Math.round(b / count)]);
        };
        img.onerror = () => resolve(null);
        img.src = imgSrc;
    });
}

function rgbToHex([r, g, b]) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}
function ajustarBrillo(hex, porcentaje) {
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + porcentaje, g = ((num >> 8) & 0x00FF) + porcentaje, b = (num & 0x0000FF) + porcentaje;
    r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); b = Math.min(255, Math.max(0, b));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function aplicarColorMarca(rgb) {
    COLOR_MARCA = rgb;
    const hex = rgbToHex(rgb);
    document.documentElement.style.setProperty('--olive', hex);
    document.documentElement.style.setProperty('--olive-dark', ajustarBrillo(hex, -50));
    document.documentElement.style.setProperty('--olive-light', ajustarBrillo(hex, 40));
    document.documentElement.style.setProperty('--olive-soft', ajustarBrillo(hex, 205));
}

// ---------------------------------------------------------------------
// 3. SELECCIÓN DE CATEGORÍA / RUBRO
// ---------------------------------------------------------------------
function pintarSelectorCategorias() {
    const sel = document.getElementById('c_categoria');
    if (!sel) return;
    sel.innerHTML = Object.entries(CATEGORIAS).map(([key, cat]) =>
        `<option value="${key}">${cat.label}</option>`
    ).join('');
    sel.value = categoriaActual;
}

function cambiarCategoria(nuevoValor) {
    const hayItems = document.querySelectorAll('#cont-mo > div').length > 0 ||
                      document.querySelectorAll('#cont-mat > div').length > 0;

    if (hayItems && nuevoValor !== categoriaActual) {
        const seguir = confirm("Cambiar de rubro reiniciará la lista de servicios y materiales agregados. ¿Deseas continuar?");
        if (!seguir) {
            document.getElementById('c_categoria').value = categoriaActual;
            return;
        }
        document.getElementById('cont-mo').innerHTML = '';
        document.getElementById('cont-mat').innerHTML = '';
    }

    categoriaActual = nuevoValor;
    const cat = CATEGORIAS[categoriaActual];

    // --- Mostrar/ocultar campo de nombre personalizado si el rubro es "otro" ---
    const contPersonalizado = document.getElementById('cont-categoria-personalizada');
    const inputPersonalizado = document.getElementById('c_categoria_personalizada');
    if (contPersonalizado) {
        if (categoriaActual === 'otro') {
            contPersonalizado.classList.remove('hidden');
            if (inputPersonalizado) inputPersonalizado.value = (cat.label !== 'Otro / Personalizado') ? cat.label : '';
        } else {
            contPersonalizado.classList.add('hidden');
        }
    }

    document.getElementById('titulo-rubro-mo').innerText = cat.label;
    document.getElementById('titulo-rubro-mat').innerText = cat.label;
    calcular();
}

function guardarNombreRubroPersonalizado(valor) {
    const nombre = valor.trim() || 'Otro / Personalizado';
    CATEGORIAS.otro.label = nombre;
    localStorage.setItem('rubro_otro_nombre', nombre);

    if (categoriaActual === 'otro') {
        document.getElementById('titulo-rubro-mo').innerText = nombre;
        document.getElementById('titulo-rubro-mat').innerText = nombre;
        // Actualiza también el texto visible en el selector de rubro
        const sel = document.getElementById('c_categoria');
        const opcionOtro = sel ? sel.querySelector('option[value="otro"]') : null;
        if (opcionOtro) opcionOtro.textContent = nombre;
        calcular();
    }
}

// ---------------------------------------------------------------------
// 4. TELÉFONO INTERNACIONAL
// ---------------------------------------------------------------------
let FOTOS_DB = [];
let chartInstance = null;
const inputTel = document.querySelector("#c_tel");
const iti = window.intlTelInput(inputTel, {
    initialCountry: "co",
    separateDialCode: true,
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@21.2.7/build/js/utils.js",
});

// ---------------------------------------------------------------------
// 5. FIRMA DIGITAL DOBLE (CANVAS)
// ---------------------------------------------------------------------
const canvasFirma = document.getElementById('canvas-firma');
const ctxFirma = canvasFirma ? canvasFirma.getContext('2d') : null;
let isDrawing = false;
let firmaEmpresa = null;
let firmaCliente = null;
let esModoCliente = false;

function resizeCanvas() {
    if (!canvasFirma) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvasFirma.width = canvasFirma.offsetWidth * ratio;
    canvasFirma.height = canvasFirma.offsetHeight * ratio;
    ctxFirma.scale(ratio, ratio);
    ctxFirma.lineWidth = 3;
    ctxFirma.lineCap = 'round';
    ctxFirma.strokeStyle = '#1e293b';
    cargarFirmaActualEnCanvas();
}
window.addEventListener("resize", resizeCanvas);
setTimeout(resizeCanvas, 100);

function getCoordinates(event) {
    const rect = canvasFirma.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getCoordinates(e);
    ctxFirma.beginPath();
    ctxFirma.moveTo(pos.x, pos.y);
    if (e.cancelable) e.preventDefault();
}
function draw(e) {
    if (!isDrawing) return;
    const pos = getCoordinates(e);
    ctxFirma.lineTo(pos.x, pos.y);
    ctxFirma.stroke();
    if (e.cancelable) e.preventDefault();
}
function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    guardarFirmaActual();
}
if (canvasFirma) {
    canvasFirma.addEventListener('mousedown', startDrawing);
    canvasFirma.addEventListener('mousemove', draw);
    canvasFirma.addEventListener('mouseup', stopDrawing);
    canvasFirma.addEventListener('mouseout', stopDrawing);
    canvasFirma.addEventListener('touchstart', startDrawing, { passive: false });
    canvasFirma.addEventListener('touchmove', draw, { passive: false });
    canvasFirma.addEventListener('touchend', stopDrawing);
}

function cambiarFirmante() {
    const switchEl = document.getElementById('switch-firma');
    const labelEl = document.getElementById('label-firmante');
    guardarFirmaActual();
    esModoCliente = switchEl.checked;
    labelEl.innerText = esModoCliente ? "Firma: CLIENTE" : "Firma: EMPRESA";
    labelEl.style.color = esModoCliente ? rgbToHex(COLOR_MARCA) : "#475569";
    ctxFirma.clearRect(0, 0, canvasFirma.width, canvasFirma.height);
    cargarFirmaActualEnCanvas();
}

function guardarFirmaActual() {
    if (!canvasFirma || isSignatureEmpty(canvasFirma)) return;
    if (!esModoCliente) firmaEmpresa = canvasFirma.toDataURL("image/png");
    else firmaCliente = canvasFirma.toDataURL("image/png");
}

function cargarFirmaActualEnCanvas() {
    const firmaData = esModoCliente ? firmaCliente : firmaEmpresa;
    if (firmaData) {
        const img = new Image();
        img.src = firmaData;
        img.onload = () => ctxFirma.drawImage(img, 0, 0, canvasFirma.width / (window.devicePixelRatio || 1), canvasFirma.height / (window.devicePixelRatio || 1));
    }
}

function limpiarCanvas() {
    ctxFirma.clearRect(0, 0, canvasFirma.width, canvasFirma.height);
    if (!esModoCliente) firmaEmpresa = null;
    else firmaCliente = null;
}

function isSignatureEmpty(canvas) {
    const blank = document.createElement('canvas');
    blank.width = canvas.width; blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
}

// ---------------------------------------------------------------------
// 6. NAVEGACIÓN Y UI
// ---------------------------------------------------------------------
function nav(id, btn) {
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active-section'));
    document.getElementById('sec-' + id).classList.add('active-section');
    document.querySelectorAll('.tab-btn, .tab-btn-desktop').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'pdf') { calcular(); updateChart(); }
    if (id === 'firma') setTimeout(resizeCanvas, 300);
    lucide.createIcons();
}

// Configuración de cómo se comporta el bloque de Anticipo según el tipo de documento
const CONFIG_ANTICIPO = {
    'COTIZACIÓN':       { visible: true,  titulo: 'Gestión de Anticipo',              subtitulo: 'Requerido para inicio de operaciones' },
    'PRESUPUESTO':      { visible: true,  titulo: 'Gestión de Anticipo',              subtitulo: 'Requerido para inicio de operaciones' },
    'ORDEN DE TRABAJO': { visible: true,  titulo: 'Anticipo de Inicio de Obra',       subtitulo: 'Requerido antes de iniciar la ejecución' },
    'FACTURA':          { visible: true,  titulo: 'Registrar Abono / Pago Parcial',  subtitulo: 'Si el cliente ya realizó un pago parcial' },
    'CUENTA COBRO':     { visible: false, titulo: '', subtitulo: '' }
};

function toggleFacturaField() {
    const tipo = document.getElementById('c_tipo').value;
    const contFactura = document.getElementById('contenedor-num-factura');
    const labelTiempo = document.getElementById('label-tiempo');

    if (tipo === 'FACTURA' || tipo === 'ORDEN DE TRABAJO') {
        contFactura.classList.remove('hidden');
        labelTiempo.innerText = tipo === 'FACTURA' ? "Vencimiento (Días)" : "Tiempo Ejecución (Días)";
        labelTiempo.className = "text-xs font-black text-red-600 ml-2 uppercase";
    } else {
        contFactura.classList.add('hidden');
        labelTiempo.innerText = "Validez / Garantía (Días)";
        labelTiempo.className = "text-xs font-black text-olive ml-2 uppercase";
    }

    actualizarAnticipoSegunTipo(tipo); // <-- NUEVO
}

// NUEVO: muestra/oculta y renombra el bloque de Anticipo según el tipo de documento
function actualizarAnticipoSegunTipo(tipo) {
    const config = CONFIG_ANTICIPO[tipo] || CONFIG_ANTICIPO['COTIZACIÓN'];
    const seccion = document.getElementById('anticipoSection');
    const titulo = document.getElementById('anticipo-titulo');
    const subtitulo = document.getElementById('anticipo-subtitulo');
    const chk = document.getElementById('chk_anticipo');

    if (!config.visible) {
        // Si no aplica para este tipo de documento, se oculta y se desmarca/limpia
        seccion.classList.add('hidden');
        if (chk.checked) {
            chk.checked = false;
            document.getElementById('panel_anticipo').classList.add('hidden');
            calcular();
        }
    } else {
        seccion.classList.remove('hidden');
        titulo.innerText = config.titulo;
        subtitulo.innerText = config.subtitulo;
    }
}

function toggleAnticipo() {
    const isChecked = document.getElementById('chk_anticipo').checked;
    document.getElementById('panel_anticipo').classList.toggle('hidden', !isChecked);
    calcular();
}

// ---------------------------------------------------------------------
// 7. GESTIÓN DE ITEMS (Servicios / Materiales) SEGÚN LA CATEGORÍA
// ---------------------------------------------------------------------
function addItem(tipo) {
    const cont = tipo === 'MO' ? document.getElementById('cont-mo') : document.getElementById('cont-mat');
    const cat = CATEGORIAS[categoriaActual];
    const lista = tipo === 'MO' ? cat.servicios : cat.materiales;
    const card = document.createElement('div');

    card.className = `glass-card p-5 relative border-l-8 mb-4 hover-dynamic transition-all ${tipo === 'MO' ? 'border-olive' : 'border-slate-800'}`;
    card.innerHTML = `
        <button onclick="this.parentElement.remove(); calcular()" class="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg z-10 transition-colors">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div class="md:col-span-5">
                <label class="text-[10px] font-black text-slate-500 block ml-2 mb-1 uppercase">Descripción del Item</label>
                <select class="input-dynamic item-sel text-sm !p-2" onchange="checkOther(this)">
                    <option value="">-- Seleccionar --</option>
                    ${lista.map(i => `<option value="${i}">${i}</option>`).join('')}
                    <option value="OTRO">✏️ OTRO / PERSONALIZADO</option>
                </select>
                <textarea class="item-custom hidden input-dynamic h-16 mt-2 text-sm" placeholder="Detalle específico..."></textarea>
            </div>
            <div class="md:col-span-2">
                <label class="text-[10px] font-black text-slate-500 block ml-2 mb-1">UNIDAD</label>
                <input type="text" value="UND" class="input-dynamic item-u text-center text-sm font-bold !p-2 uppercase">
            </div>
            <div class="md:col-span-2">
                <label class="text-[10px] font-black text-slate-500 block ml-2 mb-1">CANT.</label>
                <input type="number" value="1" step="0.01" class="input-dynamic item-q text-center text-sm font-bold !p-2" oninput="calcular()">
            </div>
            <div class="md:col-span-3">
                <label class="text-[10px] font-black text-slate-500 block ml-2 mb-1">V. UNITARIO</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-olive">$</span>
                    <input type="number" class="input-dynamic item-p text-sm font-bold !pl-8 !p-2" oninput="calcular()" placeholder="0">
                </div>
            </div>
        </div>
    `;
    cont.appendChild(card);
    lucide.createIcons();
    calcular();
}

function checkOther(sel) {
    sel.parentElement.querySelector('.item-custom').classList.toggle('hidden', sel.value !== 'OTRO');
}

// ---------------------------------------------------------------------
// 8. EVIDENCIA VISUAL (FOTOS)
// ---------------------------------------------------------------------
function handlePhotos(input) {
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => { FOTOS_DB.push({ src: e.target.result, desc: "" }); renderPhotos(); };
            reader.readAsDataURL(file);
        });
    }
    input.value = '';
}

function renderPhotos() {
    const cont = document.getElementById('cont-fotos');
    cont.innerHTML = '';
    FOTOS_DB.forEach((f, idx) => {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm relative hover-dynamic transition-all";
        div.innerHTML = `
            <button onclick="FOTOS_DB.splice(${idx},1); renderPhotos()" class="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg z-10 transition-colors" title="Eliminar foto">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
            <img src="${f.src}" class="w-full h-48 object-cover rounded-2xl mb-4 border border-slate-100">
            <textarea placeholder="Descripción / Nota técnica..." class="input-dynamic w-full h-20 text-xs resize-none"
                      oninput="FOTOS_DB[${idx}].desc = this.value">${f.desc}</textarea>
        `;
        cont.appendChild(div);
    });
    lucide.createIcons();
}

// ---------------------------------------------------------------------
// 9. CÁLCULOS Y GRÁFICAS
// ---------------------------------------------------------------------
function calcular() {
    let tMO = 0, tMAT = 0;
    document.querySelectorAll('#cont-mo > div').forEach(c => {
        const q = parseFloat(c.querySelector('.item-q').value) || 0;
        const p = parseFloat(c.querySelector('.item-p').value) || 0;
        tMO += (q * p);
    });
    document.querySelectorAll('#cont-mat > div').forEach(c => {
        const q = parseFloat(c.querySelector('.item-q').value) || 0;
        const p = parseFloat(c.querySelector('.item-p').value) || 0;
        tMAT += (q * p);
    });

    document.getElementById('sub_mo').innerText = `$ ${tMO.toLocaleString()}`;
    document.getElementById('sub_mat').innerText = `$ ${tMAT.toLocaleString()}`;

    const total = tMO + tMAT;
    document.getElementById('topTotal').innerText = `$ ${total.toLocaleString()}`;
    document.getElementById('finalTotal').innerText = `$ ${total.toLocaleString()}`;
    if (document.getElementById('sideTotal')) document.getElementById('sideTotal').innerText = `$ ${total.toLocaleString()}`;

    let montoAnticipo = 0;
    const anticipoActivo = document.getElementById('chk_anticipo').checked;
    if (anticipoActivo) {
        const pct = parseFloat(document.getElementById('val_anticipo_pct').value) || 0;
        montoAnticipo = (total * pct) / 100;
        document.getElementById('monto_anticipo_final').innerText = `$ ${montoAnticipo.toLocaleString()}`;
    }

    // --- Dashboard: tarjetas KPI, badges y barras de desglose ---
    const kpiServicios = document.getElementById('kpi-total-servicios');
    const kpiMateriales = document.getElementById('kpi-total-materiales');
    const kpiAnticipo = document.getElementById('kpi-anticipo');
    if (kpiServicios) kpiServicios.innerText = `$ ${tMO.toLocaleString()}`;
    if (kpiMateriales) kpiMateriales.innerText = `$ ${tMAT.toLocaleString()}`;
    if (kpiAnticipo) {
        const pctInput = parseFloat(document.getElementById('val_anticipo_pct').value) || 0;
        kpiAnticipo.innerText = anticipoActivo ? `$ ${montoAnticipo.toLocaleString()} (${pctInput}%)` : 'No aplica';
    }

    const badgeRubro = document.getElementById('badge-rubro-resumen');
    const badgeTipo = document.getElementById('badge-tipo-resumen');
    const badgeItems = document.getElementById('badge-items-resumen');
    const docTipoTexto = document.getElementById('doc-tipo-resumen-texto');
    if (badgeRubro) badgeRubro.innerHTML = `<i data-lucide="layout-grid" class="w-3.5 h-3.5"></i> ${CATEGORIAS[categoriaActual].label}`;
    const totalItems = document.querySelectorAll('#cont-mo > div').length + document.querySelectorAll('#cont-mat > div').length;
    if (badgeItems) badgeItems.innerHTML = `<i data-lucide="list-checks" class="w-3.5 h-3.5"></i> ${totalItems} item${totalItems === 1 ? '' : 's'}`;
    const tipoDocSel = document.getElementById('c_tipo');
    if (tipoDocSel) {
        if (badgeTipo) badgeTipo.innerHTML = `<i data-lucide="file-text" class="w-3.5 h-3.5"></i> ${tipoDocSel.value}`;
        if (docTipoTexto) docTipoTexto.innerText = tipoDocSel.value.toLowerCase();
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const pctServicios = total > 0 ? Math.round((tMO / total) * 100) : 0;
    const pctMateriales = total > 0 ? 100 - pctServicios : 0;
    const barServicios = document.getElementById('bar-servicios');
    const barMateriales = document.getElementById('bar-materiales');
    const pctServiciosLabel = document.getElementById('pct-servicios');
    const pctMaterialesLabel = document.getElementById('pct-materiales');
    if (barServicios) barServicios.style.width = pctServicios + '%';
    if (barMateriales) barMateriales.style.width = pctMateriales + '%';
    if (pctServiciosLabel) pctServiciosLabel.innerText = pctServicios + '%';
    if (pctMaterialesLabel) pctMaterialesLabel.innerText = pctMateriales + '%';
}

function updateChart() {
    const ctx = document.getElementById('statsChart').getContext('2d');
    const mo = parseFloat(document.getElementById('sub_mo').innerText.replace(/[^0-9]/g, '')) || 0;
    const mat = parseFloat(document.getElementById('sub_mat').innerText.replace(/[^0-9]/g, '')) || 0;

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Servicios / M.O.', 'Insumos / Mat.'],
            datasets: [{ data: [mo, mat], backgroundColor: [rgbToHex(COLOR_MARCA), '#1e293b'], borderWidth: 0, hoverOffset: 15 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', weight: 'bold' } } } },
            cutout: '75%'
        }
    });

    const total = mo + mat;
    const pMO = total > 0 ? ((mo / total) * 100).toFixed(0) : 0;
    document.getElementById('statsSummary').innerText = `Servicios representan el ${pMO}% del proyecto`;
}

// ---------------------------------------------------------------------
// 10. GENERACIÓN DE PDF PROFESIONAL (con logo propio de cada empresa)
// ---------------------------------------------------------------------
function extractTableData(id) {
    let data = [];
    document.querySelectorAll(`#${id} > div`).forEach(c => {
        let desc = c.querySelector('.item-sel').value;
        if (desc === 'OTRO') desc = c.querySelector('.item-custom').value;
        const u = c.querySelector('.item-u').value.toUpperCase();
        const q = parseFloat(c.querySelector('.item-q').value) || 0;
        const p = parseFloat(c.querySelector('.item-p').value) || 0;
        if (desc) data.push([desc.toUpperCase(), u, q, `$ ${p.toLocaleString()}`, `$ ${(q * p).toLocaleString()}`]);
    });
    return data;
}

function obtenerDatosResumen() {
    const tipoSeleccionado = document.getElementById('c_tipo').value;
    let folioFinal = "";
    if (tipoSeleccionado === "FACTURA" || tipoSeleccionado === "ORDEN DE TRABAJO") {
        const inputFactura = document.getElementById('c_num_factura');
        folioFinal = inputFactura.value.trim() !== "" ? inputFactura.value : "S/N";
    }
    return {
        cliente: document.getElementById('c_nombre').value || "Cliente",
        telefono: iti.getNumber().replace('+', ''),
        email: document.getElementById('c_email').value,
        tipo: tipoSeleccionado,
        obra: document.getElementById('c_obra').value || "Sede principal",
        referencia: folioFinal,
        garantia: document.getElementById('c_garantia').value || "15",
        total: document.getElementById('finalTotal').innerText
    };
}

// Dibuja una viñeta circular simple + texto (reemplaza íconos base64 pesados)
function drawBullet(doc, x, y, colorRGB) {
    doc.setFillColor(...colorRGB);
    doc.circle(x, y - 1, 0.9, 'F');
}

async function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const colorOlive = COLOR_MARCA;
    const colorSlate = [30, 41, 59];
    const colorGrayLight = [248, 250, 252];

    const d = obtenerDatosResumen();
    const tipoDoc = document.getElementById('c_tipo').value.toUpperCase();
    const refDoc = (tipoDoc === "FACTURA" || tipoDoc === "ORDEN DE TRABAJO")
        ? (document.getElementById('c_num_factura')?.value || "")
        : "";

    // Encabezado
    doc.setFillColor(...colorGrayLight);
    doc.rect(0, 0, 210, 42, 'F');

    if (LOGO_BASE64) {
        try { doc.addImage(LOGO_BASE64, 'PNG', 15, 8, 28, 28); } catch (e) { console.warn("Logo no válido para PDF", e); }
    } else {
        // Placeholder con iniciales de la empresa si no hay logo
        doc.setFillColor(...colorOlive);
        doc.roundedRect(15, 8, 28, 28, 4, 4, 'F');
        doc.setTextColor(255);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        const iniciales = (EMPRESA.nombre || "MN").split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        doc.text(iniciales, 29, 25, { align: 'center' });
    }

    doc.setTextColor(...colorSlate);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text((EMPRESA.nombre || "MI NEGOCIO").toUpperCase(), 48, 18);

    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorOlive);
    doc.text((EMPRESA.slogan || "").toUpperCase(), 48, 23);

  
doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);

    const iconNIT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAALlUExURQAAAEBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQkBAQv///9EBf7AAAAD1dFJOUwAABAwUHicwNz4LAxJBX32YsMTT3uft8vXxw5kREC1VgqvO9v7mgVQsL2LK6vwVRobC60UTR5HQkAc0y1ev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'; 
    const iconLoc = 'data:image/png;base64,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';
    const iconWP  = 'data:image/png;base64,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'; 
    const iconMail= 'data:image/png;base64,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RmYzZpSSaMxfAHEDILsB2B1gHgDWPiEY1EZqKTlytEr8+wI+eYEQdaw6v6lp9OHW0VNQ0S+qa3zkAsfZLcs4g/z1LZnB1nexbgKV7ETBXKdVvOQ7RcRyPBJpYTNF+Z6TFsKkTJR8XEqBqpQV01pjJjOplRDk0J4PGDa/UMLAR+8fG6dv95SwS3OAtvwAAAARdEVYdGV4aWY6Q29sb3JTcGFjZQAxD5sCSQAAACF0RVh0ZXhpZjpEYXRlVGltZQAyMDI2OjA0OjMwIDIzOjU4Ojg4L1p/LgAAACl0RVh0ZXhpZjpEYXRlVGltZU9yaWdpbmFsADIwMjY6MDQ6MzAgMjM6NTg6ODi81pfoAAAAE3RFWHRleGlmOkV4aWZPZmZzZXQAMTcw0g3eTAAAABl0RVh0ZXhpZjpQaXhlbFhEaW1lbnNpb24AMzQ2NDup80wAAAAZdEVYdGV4aWY6UGl4ZWxZRGltZW5zaW9uADM0NjSCUiikAAAAFXRFWHRleGlmOlNvZnR3YXJlAFBpY3NhcnSjXUSlAAABaHpUWHRleGlmRVg6Q2FtZXJhT3duZXJOYW1lAAAokYWRy27CQAxF/8XrpMq8PDPZESA/UapoClOICpM0k/AQ4t9rXi0Lqi5tX99j6x4hNkM395BD0698BwkM9YIqxYoyK7hNR9l0nEozUeloYspUKs2KqSonE8NJ3HT1sg6kH8JnaHaBWn3nQmxd58P8UG3deiDzI2zcvnLrduUgZwls6nCvMjJp3bzuDzY7C1tP54TeLWkNxYu2yCQKyw3nHPEi/hp89d4MYRHPCwfIDafBDnKulU5gD7lAkcCKUIbx0+mH8AwgjEZmM2aUkmjMXwBxAyC7AdgdYB4A1j4hGNRGaik5crRK/PsCPnmBEHWsOr+pafTh1tFTUNEvqmt85ALH2S3LOIP89S2ZwdZ3sW4ClexEwVynVbzkO0XEcjwSaWEzRfmekxbCpEyUfFxKgaqUFdNaYyYzqZUQ5NCeDxg2v1DCwEfvHxunb/eUsEunpr9YAAAAKXRFWHRwaG90b3Nob3A6RGF0ZUNyZWF0ZWQAMjAyNi0wNC0zMFQyMzo1ODo4OPBqZKIAAAASdEVYdHRpZmY6T3JpZW50YXRpb24AMber/DsAAAAVdEVYdHRpZmY6UmVzb2x1dGlvblVuaXQAMpwqT6MAAAATdEVYdHRpZmY6WFJlc29sdXRpb24ANzIOUHGFAAAAE3RFWHR0aWZmOllSZXNvbHV0aW9uADcyk1+Q8wAAABB0RVh0eG1wOkNvbG9yU3BhY2UAMQUOyNEAAAAXdEVYdHhtcDpDcmVhdG9yVG9vbABQaWNzYXJ0cPSIZQAAACJ0RVh0eG1wOk1vZGlmeURhdGUAMjAyNi0wNC0zMFQyMzo1ODo4OE7Ode8AAAAYdEVYdHhtcDpQaXhlbFhEaW1lbnNpb24AMzQ2NKi6A5wAAAAYdEVYdHhtcDpQaXhlbFlEaW1lbnNpb24AMzQ2NBFB2HQAAAAASUVORK5CYII=';

    const col1X = 48, col2X = 96, row1Y = 28, row2Y = 33;
    const iconSize = 3.5, yOffset = -2.5, textOffset = 4.5;

    const drawIcon = (base64Data, x, y) => {
        if (base64Data && base64Data.startsWith('data:image')) {
            doc.addImage(base64Data, 'PNG', x, y, iconSize, iconSize);
        } else {
            drawBullet(doc, x + iconSize / 2, y + iconSize, colorOlive); // fallback si no hay icono
        }
    };

    if (EMPRESA.nit) {
        drawIcon(iconNIT, col1X, row1Y + yOffset);
        doc.text(`NIT: ${EMPRESA.nit}`, col1X + textOffset, row1Y);
    }
    if (EMPRESA.direccion) {
        drawIcon(iconLoc, col2X, row1Y + yOffset);
        doc.text(EMPRESA.direccion, col2X + textOffset, row1Y);
    }
    if (EMPRESA.telefono) {
        drawIcon(iconWP, col1X, row2Y + yOffset);
        doc.text(`Tel: ${EMPRESA.telefono}`, col1X + textOffset, row2Y);
    }
    if (EMPRESA.email) {
        drawIcon(iconMail, col2X, row2Y + yOffset);
        doc.text(EMPRESA.email, col2X + textOffset, row2Y);
    }



    // Bloque documento
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(145, 10, 50, 25, 3, 3, 'FD');
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorOlive);
    doc.text(tipoDoc, 150, 17);
    doc.setFontSize(12);
    doc.setTextColor(...colorSlate);
    doc.text(`No. ${refDoc}`, 150, 24);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 150, 30);

    doc.setDrawColor(...colorOlive);
    doc.setLineWidth(0.6);
    doc.line(15, 48, 195, 48);

    doc.setTextColor(...colorSlate);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text("CLIENTE:", 15, 56);
    doc.setFontSize(12);
    doc.text(d.cliente.toUpperCase(), 15, 62);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFont(undefined, 'bold'); doc.text("Identificación:", 15, 68);
    doc.setFont(undefined, 'normal'); doc.text(document.getElementById('c_nit').value || "", 40, 68);
    doc.setFont(undefined, 'bold'); doc.text("Proyecto / Obra:", 15, 73);
    doc.setFont(undefined, 'normal'); doc.text(d.obra, 40, 73);
    doc.setFont(undefined, 'bold'); doc.text("Teléfono:", 110, 68);
    doc.setFont(undefined, 'normal'); doc.text(iti.getNumber(), 125, 68);
    doc.setFont(undefined, 'bold'); doc.text("Email:", 110, 73);
    doc.setFont(undefined, 'normal'); doc.text(d.email || "", 125, 73);
    doc.setFont(undefined, 'bold'); doc.text("Rubro:", 15, 78);
    doc.setFont(undefined, 'normal'); doc.text(CATEGORIAS[categoriaActual].label, 40, 78);

    let currentY = 85;

    const moData = extractTableData('cont-mo');
    if (moData.length > 0) {
        const totalMO = moData.reduce((acc, row) => acc + (parseFloat(row[4].replace(/[^0-9]/g, "")) || 0), 0);
        moData.push([{ content: 'SUBTOTAL SERVICIOS:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } },
                     { content: `$ ${totalMO.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: colorOlive } }]);
        doc.autoTable({
            startY: currentY,
            head: [['Descripción del Servicio', 'Und', 'Cant', 'V. Unitario', 'Subtotal']],
            body: moData, theme: 'striped',
            headStyles: { fillColor: colorOlive, fontSize: 8, fontStyle: 'bold', halign: 'center', cellPadding: 2 },
            styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica', lineColor: [241, 245, 249], lineWidth: 0.1 },
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } }
        });
        currentY = doc.lastAutoTable.finalY + 8;
    }

    const matData = extractTableData('cont-mat');
    if (matData.length > 0) {
        const totalMat = matData.reduce((acc, row) => acc + (parseFloat(row[4].replace(/[^0-9]/g, "")) || 0), 0);
        matData.push([{ content: 'SUBTOTAL INSUMOS:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 250, 252] } },
                      { content: `$ ${totalMat.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: colorSlate } }]);
        doc.autoTable({
            startY: currentY,
            head: [['Descripción de Material/Insumo', 'Und', 'Cant', 'V. Unitario', 'Subtotal']],
            body: matData, theme: 'striped',
            headStyles: { fillColor: colorSlate, fontSize: 8, fontStyle: 'bold', halign: 'center', cellPadding: 2 },
            styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica', lineColor: [241, 245, 249], lineWidth: 0.1 },
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } }
        });
        currentY = doc.lastAutoTable.finalY + 8;
    }

    if (currentY > 220) { doc.addPage(); currentY = 20; }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, currentY, 180, 30, 3, 3, 'FD');
    doc.setFontSize(7.5); doc.setTextColor(100); doc.setFont(undefined, 'bold');
    doc.text("NOTAS Y CONDICIONES:", 20, currentY + 7);
    doc.setFont(undefined, 'normal');
    doc.text(`• ${document.getElementById('label-tiempo').innerText}: ${document.getElementById('c_garantia').value} Días.`, 20, currentY + 12);
    doc.text("• Los valores expresados están en moneda local.", 20, currentY + 16);
    doc.text("• Sujeto a disponibilidad de inventario y agenda técnica.", 20, currentY + 20);
    if (document.getElementById('chk_anticipo').checked) {
        doc.text(`• Inicio: Anticipo de ${document.getElementById('monto_anticipo_final').innerText}`, 20, currentY + 24);
    }

    doc.setFillColor(...colorOlive);
    doc.roundedRect(135, currentY + 3, 55, 16, 2, 2, 'F');
    doc.setTextColor(255);
    doc.setFontSize(8); doc.setFont(undefined, 'bold');
    doc.text("TOTAL GENERAL:", 139, currentY + 9);
    doc.setFontSize(11);
    doc.text(document.getElementById('finalTotal').innerText, 186, currentY + 15, { align: 'right' });

    currentY += 45;

    doc.setDrawColor(200); doc.setLineWidth(0.2);
    guardarFirmaActual();

    if (firmaEmpresa && firmaEmpresa.length > 100) doc.addImage(firmaEmpresa, 'PNG', 15, currentY - 15, 50, 20);
    doc.line(15, currentY, 80, currentY);
    doc.setFontSize(8); doc.setTextColor(...colorSlate); doc.setFont(undefined, 'bold');
    doc.text((EMPRESA.firmante || "Representante Legal").toUpperCase(), 15, currentY + 5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(EMPRESA.nombre || "", 15, currentY + 9);

    if (firmaCliente && firmaCliente.length > 100) doc.addImage(firmaCliente, 'PNG', 120, currentY - 15, 50, 20);
    doc.line(120, currentY, 185, currentY);
    doc.setFontSize(8); doc.setTextColor(...colorSlate); doc.setFont(undefined, 'bold');
    const nombreCliente = document.getElementById('c_nombre').value.toUpperCase() || "ACEPTACIÓN CLIENTE";
    doc.text(nombreCliente, 120, currentY + 5);
    doc.setFont(undefined, 'normal'); doc.setTextColor(100);
    const nitCliente = document.getElementById('c_nit').value || "_________________";
    doc.text(`NIT/CC: ${nitCliente}`, 120, currentY + 9);
    doc.text("Aceptado de conformidad", 120, currentY + 13);

    currentY += 20;

    if (FOTOS_DB.length > 0) {
        doc.addPage();
        doc.setFillColor(...colorOlive);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255);
        doc.setFontSize(14); doc.setFont(undefined, 'bold');
        doc.text("ANEXO: EVIDENCIA FOTOGRÁFICA", 20, 13);

        let photoY = 30;
        FOTOS_DB.forEach((f, i) => {
            if (photoY > 230) { doc.addPage(); photoY = 20; }
            doc.setDrawColor(220);
            doc.setLineWidth(0.3);
            doc.rect(19, photoY - 1, 172, 62);
            try {
                doc.addImage(f.src, 'JPEG', 21, photoY, 80, 60);
                doc.setTextColor(...colorSlate);
                doc.setFontSize(10); doc.setFont(undefined, 'bold');
                doc.text(`Registro #${i + 1}:`, 105, photoY + 5);
                doc.setFontSize(9); doc.setFont(undefined, 'normal');
                doc.setTextColor(100);
                const lines = doc.splitTextToSize(f.desc || "Evidencia técnica visual adjunta sin descripción específica.", 80);
                doc.text(lines, 105, photoY + 12);
            } catch (e) { console.error("Error al incrustar la imagen en el PDF:", e); }
            photoY += 70;
        });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        if (LOGO_BASE64) {
            try {
                doc.setGState(new doc.GState({ opacity: 0.08 }));
                doc.addImage(LOGO_BASE64, 'PNG', 55, 100, 100, 100);
                doc.setGState(new doc.GState({ opacity: 1.0 }));
            } catch (e) { /* logo no válido como marca de agua, se omite */ }
        }
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont(undefined, 'normal');
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`${tipoDoc}_${document.getElementById('c_nombre').value.replace(/\s+/g, '_') || 'documento'}.pdf`);
}



// ---------------------------------------------------------------------
// 11. ENVÍO POR WHATSAPP Y CORREO
// ---------------------------------------------------------------------
function enviarWhatsApp() {
    const d = obtenerDatosResumen();
    if (!d.telefono) return alert("Por favor, ingrese el número de teléfono del cliente.");

    const fecha = new Date().toLocaleDateString();
    const tipoDoc = document.getElementById('c_tipo').value;
    const rubroLabel = CATEGORIAS[categoriaActual].label;
    const referenciaLugar = document.getElementById('c_obra').value;

    const texto =
        `*${tipoDoc} - ${EMPRESA.nombre.toUpperCase()}*\n` +
        `_${rubroLabel}_\n` +
        `-----------------------------------------------\n` +
        `Estimado(a) *${d.cliente}*,\n\n` +
        `Es un gusto saludarle. Le compartimos los detalles principales de su *${tipoDoc.toLowerCase()}*, generada el día de hoy (${fecha})` +
        (referenciaLugar ? `, correspondiente a: *${referenciaLugar}*.\n\n` : `.\n\n`) +
        `*RESUMEN:*\n` +
        `• *Total:* ${d.total}\n` +
        `• *Validez / Garantía:* ${d.garantia} días\n` +
        (d.referencia ? `• *N° Documento:* ${d.referencia}\n` : '') +
        `\nAdjunto encontrará el PDF con el detalle completo. Quedamos atentos a cualquier inquietud o para coordinar los siguientes pasos.\n\n` +
        `Atentamente,\n` +
        `*${EMPRESA.firmante}*\n` +
        (EMPRESA.slogan ? `_${EMPRESA.slogan}_` : '');

    window.open(`https://wa.me/${d.telefono}?text=${encodeURIComponent(texto)}`, '_blank');
}

function enviarEmail() {
    const d = obtenerDatosResumen();
    if (!d.email) return alert("Por favor, ingrese el correo electrónico del cliente.");

    const tipoDoc = document.getElementById('c_tipo').value;
    const fecha = new Date().toLocaleDateString();
    const rubroLabel = CATEGORIAS[categoriaActual].label;
    const referenciaLugar = document.getElementById('c_obra').value;

    const asunto = `${tipoDoc} - ${d.cliente} - ${EMPRESA.nombre}`;

    const cuerpo =
        `Estimado(a) ${d.cliente},\n\n` +
        `Reciba un cordial saludo de parte del equipo de ${EMPRESA.nombre}${EMPRESA.slogan ? ' (' + EMPRESA.slogan + ')' : ''}.\n\n` +
        `Adjuntamos la información detallada correspondiente a la ${tipoDoc.toLowerCase()} solicitada` +
        (referenciaLugar ? `, relacionada con: ${referenciaLugar}.\n\n` : `.\n\n`) +
        `DETALLES DEL DOCUMENTO:\n` +
        `------------------------------------------------------------\n` +
        `Sector: ${rubroLabel}\n` +
        `Fecha de Emisión: ${fecha}\n` +
        `Total Estimado: ${d.total}\n` +
        `Periodo de Validez/Garantía: ${d.garantia} días calendario\n` +
        (d.referencia ? `N° de Documento: ${d.referencia}\n` : '') +
        `------------------------------------------------------------\n\n` +
        `Nuestro equipo ha preparado esta propuesta cuidando los más altos estándares de calidad en cada detalle.\n\n` +
        `TÉRMINOS GENERALES:\n` +
        `1. Los valores están sujetos al periodo de validez indicado anteriormente.\n` +
        `2. El inicio del servicio queda sujeto a la aprobación de la presente y al cumplimiento del anticipo acordado (si aplica).\n` +
        `3. Puede encontrar el desglose completo ítem por ítem en el PDF adjunto.\n\n` +
        `Quedamos a su disposición para resolver cualquier inquietud o coordinar los siguientes pasos.\n\n` +
        `Agradecemos la confianza depositada en nuestro trabajo.\n\n` +
        `Atentamente,\n\n` +
        `${EMPRESA.firmante}\n` +
        `${EMPRESA.nombre}\n` +
        (EMPRESA.telefono ? `Tel/WhatsApp: ${EMPRESA.telefono}\n` : '') +
        (EMPRESA.email ? `Email: ${EMPRESA.email}` : '');

    window.location.href = `mailto:${d.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

// ---------------------------------------------------------------------
// 12. SESIÓN, LIMPIEZA Y ARRANQUE
// ---------------------------------------------------------------------
const USUARIOS_AUTORIZADOS = [
    { user: "admin", pass: "admin2026", nombre: "Administrador" },
    { user: "miguel", pass: "2356", nombre: "miguel_coronell" }
];

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const userIn = document.getElementById('user-input').value.trim();
    const passIn = document.getElementById('pass-input').value.trim();
    const recordar = document.getElementById('recordar-sesion').checked; // <-- NUEVO
    const errorBox = document.getElementById('login-error');
    const loginCard = document.querySelector('#login-container > div');
    const btnSubmit = e.target.querySelector('button[type="submit"]');

    const acceso = USUARIOS_AUTORIZADOS.find(u => u.user === userIn && u.pass === passIn);

    if (acceso) {
        errorBox.classList.add('hidden');
        btnSubmit.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 animate-bounce"></i> ACCEDIENDO...`;
        lucide.createIcons();
        btnSubmit.style.backgroundColor = "#22c55e";

        // --- NUEVO: guarda según si se marcó "Recordar sesión" ---
        if (recordar) {
            localStorage.setItem('sesion_activa', acceso.nombre);
            localStorage.setItem('ultimo_usuario', userIn);
            sessionStorage.removeItem('sesion_activa'); // evita choques entre ambos storages
        } else {
            sessionStorage.setItem('sesion_activa', acceso.nombre);
            localStorage.removeItem('sesion_activa');
            localStorage.removeItem('ultimo_usuario');
        }

        loginCard.classList.add('translate-y-10', 'opacity-0', 'transition-all', 'duration-500');
        setTimeout(() => {
            document.getElementById('login-container').classList.add('opacity-0', 'pointer-events-none');
            const navMovil = document.getElementById('mobile-nav');
            if (navMovil) { navMovil.classList.remove('hidden'); navMovil.classList.add('flex'); }
            setTimeout(() => { document.getElementById('login-container').style.display = 'none'; }, 500);
           setTimeout(verificarYIniciarTour, 400); // <-- aviso de configuración, tras entrar
        }, 600);
    } else {
        errorBox.classList.remove('hidden');
        loginCard.classList.add('animate-shake');
        setTimeout(() => loginCard.classList.remove('animate-shake'), 500);
        document.getElementById('pass-input').value = "";
        document.getElementById('pass-input').focus();
        lucide.createIcons();
    }
});

const shakeStyle = document.createElement('style');
shakeStyle.innerHTML = `
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 50% { transform: translateX(8px); } 75% { transform: translateX(-8px); } }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
`;
document.head.appendChild(shakeStyle);

// ---------------------------------------------------------------------
// NOTIFICACIÓN FLOTANTE MÓVIL: "Configura tu empresa"
// Se genera 100% por JS (no depende de HTML frágil). Aparece sobre el
// mobile-nav solo si: es pantalla móvil + no hay datos guardados + el
// usuario no la cerró antes.
// ---------------------------------------------------------------------
function mostrarAvisoEmpresaMovil() {
    if (window.innerWidth >= 1024) return;
    if (localStorage.getItem('empresa_datos')) return;
    if (localStorage.getItem('aviso_empresa_cerrado')) return;
    if (document.getElementById('toast-aviso-empresa')) return;

    const wrapper = document.getElementById('toast-aviso-empresa-wrapper');
    if (!wrapper) return;

    const toast = document.createElement('div');
    toast.id = 'toast-aviso-empresa';
    toast.className = 'glass-card p-4 flex items-center gap-3 shadow-2xl';
    toast.style.position = 'fixed';
    toast.style.left = '16px';
    toast.style.right = '16px';
    toast.style.bottom = '92px';
    toast.style.zIndex = '150';
    toast.innerHTML = `
        <div class="toast-icono bg-olive/10 p-3 rounded-2xl shrink-0">
            <i data-lucide="building-2" class="w-5 h-5 text-olive"></i>
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-xs font-black text-slate-800 uppercase leading-tight">Personaliza tu negocio</p>
            <p class="text-[11px] text-slate-500 font-semibold leading-snug">Sube tu logo y datos para verlos en tus PDF.</p>
        </div>
        <button id="btn-toast-empresa-ir" type="button" class="btn-primary text-[10px] px-3 py-2 shrink-0">Ir</button>
        <button id="btn-toast-empresa-cerrar" type="button" class="text-slate-400 hover:text-slate-600 shrink-0 p-1">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;
    wrapper.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    document.getElementById('btn-toast-empresa-ir').addEventListener('click', () => {
        nav('empresa', document.querySelector('#desktop-nav button'));
        cerrarAvisoEmpresaMovil();
    });
    document.getElementById('btn-toast-empresa-cerrar').addEventListener('click', cerrarAvisoEmpresaMovil);
}

function cerrarAvisoEmpresaMovil() {
    const toast = document.getElementById('toast-aviso-empresa');
    if (toast) toast.remove();
    localStorage.setItem('aviso_empresa_cerrado', '1');
}


// ---------------------------------------------------------------------
// TOUR GUIADO: ventana pequeña tipo spotlight que sigue cada elemento
// ---------------------------------------------------------------------
const TOUR_PASOS = [
    { seccion: 'empresa', selector: '#emp_nombre', icono: 'building-2',
      titulo: 'Tu Empresa', texto: 'Configura tu logo, nombre y datos de contacto. Se usan automáticamente en cada PDF que generes.' },
    { seccion: 'cliente', selector: '#c_categoria', icono: 'layout-grid',
      titulo: 'Rubro de tu Negocio', texto: 'Elige tu rubro. Los campos de Servicios y Materiales se adaptan según lo que selecciones aquí.' },
    { seccion: 'cliente', selector: '#c_nombre', icono: 'user',
      titulo: 'Datos del Cliente', texto: 'Registra el nombre, teléfono y correo de tu cliente para el documento y el envío.' },
    { seccion: 'cliente', selector: '#c_tipo', icono: 'file-text',
      titulo: 'Tipo de Documento', texto: 'Elige si vas a generar Cotización, Factura, Presupuesto u otro tipo de documento.' },
    { seccion: 'mo', selector: '#sec-mo', icono: 'hammer',
      titulo: 'Servicios', texto: 'Agrega aquí los servicios o mano de obra que vas a cobrar.' },
    { seccion: 'mat', selector: '#sec-mat', icono: 'package',
      titulo: 'Materiales', texto: 'Agrega los materiales o insumos utilizados, con cantidad y precio.' },
    { seccion: 'fotos', selector: '#titulo-fotos-tour', icono: 'camera',
      titulo: 'Evidencia Fotográfica', texto: 'Sube fotos de respaldo. Se incluyen automáticamente como anexo en el PDF.' },
    { seccion: 'firma', selector: '#switch-firma', icono: 'pen-tool',
      titulo: 'Firma Digital', texto: 'Tú y tu cliente pueden firmar directamente desde la pantalla antes de generar el documento.' },
    { seccion: 'pdf', selector: '#titulo-dashboard-tour', icono: 'layout-dashboard',
      titulo: 'Resumen del Documento', texto: 'Aquí ves el total, el desglose y toda la información antes de generar el PDF.' },
    { seccion: 'pdf', selector: '#Generar-PDF', icono: 'wallet',
      titulo: 'Generar y Enviar', texto: 'Con un toque generas el PDF, o lo envías directo por WhatsApp o correo a tu cliente.' },
];

let tourPasoActual = 0;
let tourListenersActivos = false;

function iniciarTour() {
    tourPasoActual = 0;
    document.body.classList.add('tour-activo');
    mostrarPasoTour();
    if (!tourListenersActivos) {
        window.addEventListener('resize', reposicionarTourActual);
        document.querySelector('main')?.addEventListener('scroll', reposicionarTourActual, true);
        tourListenersActivos = true;
    }
}

function mostrarPasoTour() {
    const paso = TOUR_PASOS[tourPasoActual];
    const btnNav = document.querySelector(`#desktop-nav button[onclick*="'${paso.seccion}'"]`);
    nav(paso.seccion, btnNav);

    const wrapper = document.getElementById('tour-wrapper');
    wrapper.innerHTML = `
      <div class="tour-blocker" id="tour-blocker"></div>
      <div class="tour-spotlight" id="tour-spotlight"></div>
      <div class="tour-popover" id="tour-popover">
          <div class="flex items-center gap-3 mb-2">
              <div class="bg-olive/10 p-2.5 rounded-xl shrink-0"><i data-lucide="${paso.icono}" class="w-4 h-4 text-olive"></i></div>
              <div class="flex-1 min-w-0">
                  <p class="text-[9px] font-black text-olive uppercase tracking-widest">Paso ${tourPasoActual + 1} / ${TOUR_PASOS.length}</p>
                  <h3 class="text-sm font-black text-slate-800 leading-tight">${paso.titulo}</h3>
              </div>
              <button onclick="finalizarTour()" class="text-slate-400 hover:text-slate-600 shrink-0"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>
          <p class="text-xs text-slate-500 font-medium leading-relaxed">${paso.texto}</p>
          <div class="tour-dots">
              ${TOUR_PASOS.map((_, i) => `<div class="tour-dot ${i === tourPasoActual ? 'activo' : ''}"></div>`).join('')}
          </div>
          <div class="flex gap-2 mt-4">
              ${tourPasoActual > 0
                  ? `<button onclick="pasoAnteriorTour()" class="flex-1 bg-slate-100 text-slate-500 rounded-xl py-2.5 font-black text-[10px] uppercase">Atrás</button>`
                  : `<button onclick="finalizarTour()" class="flex-1 bg-slate-100 text-slate-500 rounded-xl py-2.5 font-black text-[10px] uppercase">Saltar</button>`}
              <button onclick="siguientePasoTour()" class="flex-1 btn-primary rounded-xl py-2.5 text-[10px]">
                  ${tourPasoActual === TOUR_PASOS.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
          </div>
          <div class="tour-popover-arrow" id="tour-arrow"></div>
      </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    requestAnimationFrame(() => {
        const target = document.querySelector(paso.selector);
        if (!target) { siguientePasoTour(); return; }
        target.scrollIntoView({ block: 'center', behavior: 'auto' });
        requestAnimationFrame(() => posicionarTour(target));
    });
}

function posicionarTour(target) {
    const rect = target.getBoundingClientRect();
    const spotlight = document.getElementById('tour-spotlight');
    const popover = document.getElementById('tour-popover');
    const arrow = document.getElementById('tour-arrow');
    if (!spotlight || !popover) return;

    const pad = 8;
    spotlight.style.top = (rect.top - pad) + 'px';
    spotlight.style.left = (rect.left - pad) + 'px';
    spotlight.style.width = (rect.width + pad * 2) + 'px';
    spotlight.style.height = (rect.height + pad * 2) + 'px';

    const popW = popover.offsetWidth, popH = popover.offsetHeight, margin = 14;
    const espacioAbajo = window.innerHeight - rect.bottom;
    const espacioArriba = rect.top;
    let arriba = espacioAbajo < popH + margin && espacioArriba > espacioAbajo;
    let top = arriba ? rect.top - popH - margin : rect.bottom + margin;
    top = Math.max(10, Math.min(top, window.innerHeight - popH - 10));

    let left = rect.left + rect.width / 2 - popW / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - popW - 12));

    popover.style.top = top + 'px';
    popover.style.left = left + 'px';

    const arrowLeft = Math.max(16, Math.min(rect.left + rect.width / 2 - left - 7, popW - 28));
    arrow.style.left = arrowLeft + 'px';
    arrow.style.top = arriba ? 'auto' : '-7px';
    arrow.style.bottom = arriba ? '-7px' : 'auto';
}

function reposicionarTourActual() {
    const popover = document.getElementById('tour-popover');
    if (!popover) return;
    const paso = TOUR_PASOS[tourPasoActual];
    const target = document.querySelector(paso.selector);
    if (target) posicionarTour(target);
}

function siguientePasoTour() {
    if (tourPasoActual < TOUR_PASOS.length - 1) { tourPasoActual++; mostrarPasoTour(); }
    else finalizarTour();
}
function pasoAnteriorTour() {
    if (tourPasoActual > 0) { tourPasoActual--; mostrarPasoTour(); }
}
function finalizarTour() {
    document.body.classList.remove('tour-activo');
    document.getElementById('tour-wrapper').innerHTML = '';
    window.removeEventListener('resize', reposicionarTourActual);
    document.querySelector('main')?.removeEventListener('scroll', reposicionarTourActual, true);
    tourListenersActivos = false;
    localStorage.setItem('tour_completado', '1');
}
function verificarYIniciarTour() {
    if (!localStorage.getItem('tour_completado')) setTimeout(iniciarTour, 400);
}





function cerrarSesion() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        sessionStorage.removeItem('sesion_activa');
        localStorage.removeItem('sesion_activa');   // <-- NUEVO: también borra la persistente
        window.location.reload();
    }
}

// ---------------------------------------------------------------------
// SOPORTE / AYUDA
// ---------------------------------------------------------------------
const SOPORTE_WHATSAPP = "542613863563"; // <-- reemplaza por el número de soporte (con indicativo, sin '+')
const SOPORTE_EMAIL = "miguelcarrasquillac@gmail.com"; // <-- reemplaza por tu correo de soporte

function abrirModalSoporte() {
    document.getElementById('modal-soporte').classList.remove('hidden');
    lucide.createIcons();
}
function cerrarModalSoporte() {
    document.getElementById('modal-soporte').classList.add('hidden');
}
function contactarSoportePorWhatsApp() {
    const texto = `Hola, necesito soporte con la app de cotizaciones. Usuario: ${sessionStorage.getItem('sesion_activa') || 'N/A'}.`;
    window.open(`https://wa.me/${SOPORTE_WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank');
}
function contactarSoportePorEmail() {
    const asunto = "Soporte - App de Cotizaciones";
    const cuerpo = `Hola,\n\nTengo un problema con la app.\nUsuario: ${sessionStorage.getItem('sesion_activa') || 'N/A'}\nDescripción del problema:\n\n`;
    window.location.href = `mailto:${SOPORTE_EMAIL}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}


function nuevoDocumento() {
    if (!confirm("¿Deseas limpiar todos los datos? Se borrará el presupuesto actual.")) return;

    ['c_nombre', 'c_tel', 'c_email', 'c_obra', 'c_num_factura', 'c_nit'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = '';
    });

    const selectTipo = document.getElementById('c_tipo');
    if (selectTipo) { selectTipo.value = 'COTIZACIÓN'; toggleFacturaField(); }

    const inputGarantia = document.getElementById('c_garantia');
    if (inputGarantia) inputGarantia.value = '15';

    document.getElementById('cont-mo').innerHTML = '';
    document.getElementById('cont-mat').innerHTML = '';

    FOTOS_DB = [];
    renderPhotos();

    limpiarCanvas();
    const switchFirma = document.getElementById('switch-firma');
    if (switchFirma && switchFirma.checked) { switchFirma.checked = false; cambiarFirmante(); }

    calcular();
    nav('cliente', document.querySelector('[onclick*="cliente"]'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lucide.createIcons();
}

window.addEventListener('load', () => {
    // --- NUEVO: revisa primero localStorage (persistente), luego sessionStorage (temporal) ---
    const sesion = localStorage.getItem('sesion_activa') || sessionStorage.getItem('sesion_activa');
    const loginPage = document.getElementById('login-container');
    const navMovil = document.getElementById('mobile-nav');

    if (sesion) {
        loginPage.style.display = 'none';
        if (navMovil) { navMovil.classList.remove('hidden'); navMovil.classList.add('flex'); }
        setTimeout(verificarYIniciarTour, 400); // <-- aviso de configuración, si ya había sesión
    } else {
        loginPage.style.display = 'flex';
        if (navMovil) { navMovil.classList.add('hidden'); navMovil.classList.remove('flex'); }

        // --- NUEVO: prellena el usuario recordado y marca el checkbox ---
        const ultimoUsuario = localStorage.getItem('ultimo_usuario');
        if (ultimoUsuario) {
            const inputUser = document.getElementById('user-input');
            const chkRecordar = document.getElementById('recordar-sesion');
            if (inputUser) inputUser.value = ultimoUsuario;
            if (chkRecordar) chkRecordar.checked = true;
        }
    }
    lucide.createIcons();
});

// Inicialización general
cargarConfigEmpresa();
const nombreRubroGuardado = localStorage.getItem('rubro_otro_nombre');
if (nombreRubroGuardado) CATEGORIAS.otro.label = nombreRubroGuardado;
pintarSelectorCategorias();
cambiarCategoria(categoriaActual);
lucide.createIcons();
toggleFacturaField();
calcular();



function togglePassword() {
    const input = document.getElementById('pass-input');
    const icon = document.getElementById('icon-toggle-pass');
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
    lucide.createIcons();
}