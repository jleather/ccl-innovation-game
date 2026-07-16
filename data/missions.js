// Catálogo de las 19 misiones — cada una referencia a un juego clásico distinto
// mundo: DIRECCIONALES | APOYO | MISIONALES

const MISSIONS = {
  GI: { codigo: "GI", nombre: "Gestión de Innovación", mundo: "DIRECCIONALES", refClasico: "Lemmings", desc: "Guía las ideas hacia la categoría de innovación correcta antes de que se pierdan." },
  GP: { codigo: "GP", nombre: "Gestión Comercial", mundo: "DIRECCIONALES", refClasico: "SimCity", desc: "Asigna recursos comerciales en el mapa según la demanda de cada zona." },
  PE: { codigo: "PE", nombre: "Planeación Estratégica", mundo: "DIRECCIONALES", refClasico: "Pipe Mania", desc: "Conecta las tuberías de flujo estratégico antes de que la operación se desborde." },
  GC: { codigo: "GC", nombre: "Gestión de Calidad", mundo: "DIRECCIONALES", refClasico: "Dr. Mario", desc: "Elimina los errores de calidad combinando cápsulas del mismo color." },
  GF: { codigo: "GF", nombre: "Gestión Financiera", mundo: "DIRECCIONALES", refClasico: "Paperboy", desc: "Entrega las facturas en el carril correcto antes de que se acumulen." },

  GH: { codigo: "GH", nombre: "Gestión Humana", mundo: "APOYO", refClasico: "Duck Hunt", desc: "Selecciona rápidamente los perfiles que cumplen el requisito antes de que escapen." },
  SF: { codigo: "SF", nombre: "SARLAFT", mundo: "APOYO", refClasico: "Where's Waldo?", desc: "Encuentra la anomalía escondida entre las operaciones normales." },
  JR: { codigo: "JR", nombre: "Jurídica", mundo: "APOYO", refClasico: "Operation Wolf", desc: "Sella los contratos válidos y evita sellar los inválidos." },
  TC: { codigo: "TC", nombre: "Tecnología", mundo: "APOYO", refClasico: "Tetris", desc: "Encaja los bloques de datos en las filas del sistema." },
  SE: { codigo: "SE", nombre: "Seguridad", mundo: "APOYO", refClasico: "Space Invaders", desc: "Defiende el perímetro derribando amenazas antes de que lleguen a la base." },
  GA: { codigo: "GA", nombre: "Gestión Ambiental", mundo: "APOYO", refClasico: "Q*bert", desc: "Limpia todas las superficies del cubo saltando sobre cada casilla." },
  ST: { codigo: "ST", nombre: "Seguridad y Salud en el Trabajo", mundo: "APOYO", refClasico: "Whac-A-Mole", desc: "Reacciona rápido y neutraliza los riesgos que aparecen." },
  CO: { codigo: "CO", nombre: "Compras", mundo: "APOYO", refClasico: "The Price is Right", desc: "Ajusta el dial al presupuesto correcto sin pasarte." },
  SA: { codigo: "SA", nombre: "Servicios Administrativos", mundo: "APOYO", refClasico: "Tapper", desc: "Atiende varias tareas administrativas a la vez sin dejar que se acumulen." },
  SC: { codigo: "SC", nombre: "Servicio al Cliente", mundo: "APOYO", refClasico: "Pong", desc: "Redirecciona las llamadas hacia el área correcta rebotando la pelota." },

  LD: { codigo: "LD", nombre: "Logística de CD", mundo: "MISIONALES", refClasico: "BurgerTime", desc: "Empuja las cajas por la cinta transportadora hasta la zona de despacho." },
  CA: { codigo: "CA", nombre: "Cargo", mundo: "MISIONALES", refClasico: "Tetris (empaque)", desc: "Optimiza el espacio del contenedor apilando la carga sin dejar huecos." },
  IN: { codigo: "IN", nombre: "Inventarios", mundo: "MISIONALES", refClasico: "Galaga", desc: "Escanea (dispara) los códigos de barra en formación antes de que aterricen." },
  LA: { codigo: "LA", nombre: "Logística de Acondicionamiento", mundo: "MISIONALES", refClasico: "Donkey Kong", desc: "Escala la línea de ensamblaje esquivando obstáculos en cada nivel." }
};

const MUNDOS = ["DIRECCIONALES", "APOYO", "MISIONALES"];

// Banco de preguntas por misión — se muestran como popup durante la partida
// respuesta correcta otorga multiplicador de puntaje
const QUESTIONS_BANK = {
  GI: [
    { q: "¿Qué certificación de innovación busca CCL?", opts: ["ISO 9001", "Sello BPI (Buenas Prácticas de Innovación)", "ISO 14001", "OHSAS 18001"], correct: 1 },
    { q: "¿Qué norma técnica colombiana rige la gestión de innovación?", opts: ["NTC 5801", "NTC 6001", "NTC 1486", "NTC 4703"], correct: 0 }
  ],
  GP: [
    { q: "¿Qué área evalúa nuevas oportunidades de negocio en CCL?", opts: ["Gestión Comercial", "Jurídica", "Seguridad", "Compras"], correct: 0 }
  ],
  PE: [
    { q: "¿Qué metodología prioriza requisitos como Must/Should/Could/Won't?", opts: ["SCRUM", "MoSCoW", "SWOT", "OKR"], correct: 1 }
  ],
  GC: [
    { q: "¿Qué mide principalmente Gestión de Calidad?", opts: ["Cumplimiento de estándares y reducción de errores", "Rentabilidad financiera", "Clima laboral", "Tráfico web"], correct: 0 }
  ],
  GF: [
    { q: "¿Cuál es una función clave de Gestión Financiera?", opts: ["Control de facturación y flujo de caja", "Selección de personal", "Diseño de rutas", "Mantenimiento de flota"], correct: 0 }
  ],
  GH: [
    { q: "¿Qué proceso gestiona la selección y bienestar del personal?", opts: ["Gestión Humana", "SARLAFT", "Cargo", "Inventarios"], correct: 0 }
  ],
  SF: [
    { q: "¿Qué previene el sistema SARLAFT?", opts: ["Lavado de activos y financiación del terrorismo", "Accidentes laborales", "Errores de inventario", "Fallas tecnológicas"], correct: 0 }
  ],
  JR: [
    { q: "¿Qué ley colombiana protege los datos personales?", opts: ["Ley 1581 de 2012", "Ley 100 de 1993", "Ley 80 de 1993", "Ley 594 de 2000"], correct: 0 }
  ],
  TC: [
    { q: "¿Qué gestiona el área de Tecnología en la innovación?", opts: ["Herramientas y sistemas digitales", "Contratos legales", "Rutas de transporte", "Nómina"], correct: 0 }
  ],
  SE: [
    { q: "¿Qué protege principalmente el área de Seguridad?", opts: ["Personas, activos e instalaciones", "El presupuesto anual", "La imagen de marca", "El inventario contable"], correct: 0 }
  ],
  GA: [
    { q: "¿Qué busca la Gestión Ambiental en logística?", opts: ["Reducir el impacto ambiental de la operación", "Aumentar las ventas", "Reducir el personal", "Aumentar el inventario"], correct: 0 }
  ],
  ST: [
    { q: "¿Qué sigla corresponde a Seguridad y Salud en el Trabajo?", opts: ["SST", "SARLAFT", "SGC", "SLA"], correct: 0 }
  ],
  CO: [
    { q: "¿Qué busca optimizar el área de Compras?", opts: ["Costo, calidad y tiempo de adquisición", "El clima organizacional", "La velocidad de internet", "El diseño de oficinas"], correct: 0 }
  ],
  SA: [
    { q: "¿Qué tipo de tareas gestiona Servicios Administrativos?", opts: ["Soporte operativo transversal a la empresa", "Solo contabilidad", "Solo mercadeo", "Solo tecnología"], correct: 0 }
  ],
  SC: [
    { q: "¿Qué mide la satisfacción en Servicio al Cliente?", opts: ["Experiencia y resolución efectiva", "El precio del combustible", "El clima", "La cantidad de facturas"], correct: 0 }
  ],
  LD: [
    { q: "¿Qué significa CD en logística?", opts: ["Centro de Distribución", "Contrato Digital", "Control de Datos", "Costo Directo"], correct: 0 }
  ],
  CA: [
    { q: "¿Qué optimiza el proceso de Cargo?", opts: ["El espacio y peso de la carga transportada", "El salario del conductor", "El clima de la ruta", "La antigüedad del vehículo"], correct: 0 }
  ],
  IN: [
    { q: "¿Qué controla la Gestión de Inventarios?", opts: ["Existencias, ubicación y trazabilidad de productos", "El presupuesto de marketing", "La nómina", "Las contrataciones"], correct: 0 }
  ],
  LA: [
    { q: "¿Qué hace el proceso de Acondicionamiento?", opts: ["Prepara y empaca el producto para su distribución", "Contrata personal", "Diseña contratos", "Gestiona la cartera"], correct: 0 }
  ]
};

module.exports = { MISSIONS, MUNDOS, QUESTIONS_BANK };
