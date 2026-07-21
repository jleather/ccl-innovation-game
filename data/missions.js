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
  CA: { codigo: "CA", nombre: "Cargo", mundo: "MISIONALES", refClasico: "Kart Racer CCL (30 pilotos)", desc: "Carrera pseudo-3D de karts de carga con hasta 30 pilotos en pista; el admin elige el circuito." },
  IN: { codigo: "IN", nombre: "Inventarios", mundo: "MISIONALES", refClasico: "Galaga", desc: "Escanea (dispara) los códigos de barra en formación antes de que aterricen." },
  LA: { codigo: "LA", nombre: "Logística de Acondicionamiento", mundo: "MISIONALES", refClasico: "Donkey Kong", desc: "Escala la línea de ensamblaje esquivando obstáculos en cada nivel." }
};

const MUNDOS = ["DIRECCIONALES", "APOYO", "MISIONALES"];

// Banco de preguntas por misión — se muestran como popup durante la partida.
// Respuesta correcta: +multiplicador y +10s al reloj global.
// Respuesta incorrecta: -multiplicador y -10s al reloj global.
const QUESTIONS_BANK = {
  GI: [
    { q: "¿Qué certificación de innovación busca CCL?", opts: ["ISO 9001", "Sello BPI (Buenas Prácticas de Innovación)", "ISO 14001", "OHSAS 18001"], correct: 1 },
    { q: "¿Qué norma técnica colombiana rige la gestión de innovación?", opts: ["NTC 5801", "NTC 6001", "NTC 1486", "NTC 4703"], correct: 0 },
    { q: "¿Qué tipo de innovación cambia la forma de entregar valor sin cambiar el producto?", opts: ["Innovación de modelo de negocio", "Innovación de producto", "Innovación de packaging", "Innovación de marca"], correct: 0 },
    { q: "¿Qué mide un indicador de innovación como el de NTC 5801?", opts: ["La gestión sistemática de la innovación en la empresa", "Solo las ventas del mes", "El clima laboral", "El número de reuniones"], correct: 0 },
    { q: "¿Cuál es un beneficio clave de tener un pipeline de innovación?", opts: ["Priorizar y dar seguimiento ordenado a las ideas", "Eliminar toda la competencia", "Reducir el número de empleados", "Aumentar el precio de venta"], correct: 0 }
  ],
  GP: [
    { q: "¿Qué área evalúa nuevas oportunidades de negocio en CCL?", opts: ["Gestión Comercial", "Jurídica", "Seguridad", "Compras"], correct: 0 },
    { q: "¿Qué mide principalmente un CRM comercial?", opts: ["La relación y seguimiento con clientes", "El inventario de bodega", "La nómina", "El mantenimiento de vehículos"], correct: 0 },
    { q: "¿Qué es un 'pipeline comercial'?", opts: ["Las oportunidades de venta en distintas etapas", "Una tubería física", "Un tipo de contrato", "Un software de nómina"], correct: 0 },
    { q: "¿Qué factor suele priorizarse al segmentar clientes B2B?", opts: ["Volumen y frecuencia de carga", "El color del logo", "La fecha de fundación", "El clima de su ciudad"], correct: 0 },
    { q: "¿Qué busca la fidelización de clientes en logística?", opts: ["Mantener contratos de largo plazo y recompra", "Aumentar el precio sin aviso", "Reducir el servicio", "Cambiar de operador cada mes"], correct: 0 }
  ],
  PE: [
    { q: "¿Qué metodología prioriza requisitos como Must/Should/Could/Won't?", opts: ["SCRUM", "MoSCoW", "SWOT", "OKR"], correct: 1 },
    { q: "¿Qué significan las siglas OKR?", opts: ["Objectives and Key Results", "Operational Key Reports", "Organized KPI Review", "Open Knowledge Repository"], correct: 0 },
    { q: "¿Qué analiza una matriz DOFA/SWOT?", opts: ["Debilidades, Oportunidades, Fortalezas y Amenazas", "Solo la competencia", "Solo las finanzas", "Solo el clima laboral"], correct: 0 },
    { q: "¿Qué busca un mapa de ruta (roadmap) estratégico?", opts: ["Visualizar hitos y prioridades en el tiempo", "Calcular la nómina", "Diseñar el logo", "Medir el clima"], correct: 0 },
    { q: "¿Qué es un KPI?", opts: ["Un indicador clave de desempeño", "Un tipo de contrato laboral", "Un software de facturación", "Una norma ambiental"], correct: 0 }
  ],
  GC: [
    { q: "¿Qué mide principalmente Gestión de Calidad?", opts: ["Cumplimiento de estándares y reducción de errores", "Rentabilidad financiera", "Clima laboral", "Tráfico web"], correct: 0 },
    { q: "¿Qué es una 'no conformidad' en un sistema de calidad?", opts: ["Un incumplimiento de un requisito establecido", "Una idea de innovación", "Un tipo de factura", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué ciclo de mejora continua es ampliamente usado en calidad?", opts: ["PHVA (Planear-Hacer-Verificar-Actuar)", "FIFO", "SWOT", "CRM"], correct: 0 },
    { q: "¿Qué busca una auditoría interna de calidad?", opts: ["Verificar el cumplimiento de procesos y normas", "Vender más servicios", "Contratar personal nuevo", "Diseñar publicidad"], correct: 0 },
    { q: "¿Qué norma internacional es la más común para sistemas de gestión de calidad?", opts: ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 27001"], correct: 0 }
  ],
  GF: [
    { q: "¿Cuál es una función clave de Gestión Financiera?", opts: ["Control de facturación y flujo de caja", "Selección de personal", "Diseño de rutas", "Mantenimiento de flota"], correct: 0 },
    { q: "¿Qué mide el flujo de caja?", opts: ["Entradas y salidas de efectivo de la empresa", "El número de empleados", "El clima laboral", "Las rutas de transporte"], correct: 0 },
    { q: "¿Qué es una cartera vencida?", opts: ["Facturas pendientes de pago fuera de plazo", "Un tipo de vehículo", "Un contrato laboral", "Una certificación"], correct: 0 },
    { q: "¿Qué documento resume ingresos y gastos de un periodo?", opts: ["Estado de resultados", "Manual de calidad", "Contrato laboral", "Mapa de procesos"], correct: 0 },
    { q: "¿Qué busca optimizar la gestión de tesorería?", opts: ["La liquidez disponible para operar", "El número de reuniones", "El diseño de oficinas", "La velocidad de internet"], correct: 0 }
  ],
  GH: [
    { q: "¿Qué proceso gestiona la selección y bienestar del personal?", opts: ["Gestión Humana", "SARLAFT", "Cargo", "Inventarios"], correct: 0 },
    { q: "¿Qué mide el clima organizacional?", opts: ["La percepción de los empleados sobre su entorno laboral", "Las ventas del mes", "El inventario de bodega", "Las rutas de transporte"], correct: 0 },
    { q: "¿Qué busca un plan de capacitación?", opts: ["Desarrollar competencias del personal", "Reducir el salario", "Aumentar el inventario", "Cambiar proveedores"], correct: 0 },
    { q: "¿Qué es la curva de aprendizaje de un nuevo colaborador?", opts: ["El tiempo y proceso para alcanzar su desempeño óptimo", "Un tipo de contrato", "Un indicador financiero", "Una norma ambiental"], correct: 0 },
    { q: "¿Qué evalúa una entrevista por competencias?", opts: ["Comportamientos pasados relacionados con el cargo", "Solo el nivel de estudios", "Solo la edad", "Solo la apariencia"], correct: 0 }
  ],
  SF: [
    { q: "¿Qué previene el sistema SARLAFT?", opts: ["Lavado de activos y financiación del terrorismo", "Accidentes laborales", "Errores de inventario", "Fallas tecnológicas"], correct: 0 },
    { q: "¿Qué es la 'debida diligencia' en SARLAFT?", opts: ["El proceso de conocer y verificar a clientes y terceros", "Un tipo de factura", "Un cargo directivo", "Una certificación ambiental"], correct: 0 },
    { q: "¿Qué es una 'señal de alerta' en SARLAFT?", opts: ["Un indicio de operación inusual o sospechosa", "Un descuento comercial", "Un tipo de contrato", "Una capacitación"], correct: 0 },
    { q: "¿Qué entidad supervisa el cumplimiento SARLAFT en Colombia según el sector?", opts: ["Superintendencias (según el sector regulado)", "El Ministerio de Cultura", "La Alcaldía local", "El SENA"], correct: 0 },
    { q: "¿Qué busca un oficial de cumplimiento SARLAFT?", opts: ["Vigilar y reportar operaciones sospechosas", "Vender más servicios", "Diseñar rutas de transporte", "Gestionar el inventario"], correct: 0 }
  ],
  JR: [
    { q: "¿Qué ley colombiana protege los datos personales?", opts: ["Ley 1581 de 2012", "Ley 100 de 1993", "Ley 80 de 1993", "Ley 594 de 2000"], correct: 0 },
    { q: "¿Qué es el Habeas Data en Colombia?", opts: ["El derecho a conocer, actualizar y rectificar datos propios", "Un tipo de impuesto", "Un contrato laboral", "Una norma ambiental"], correct: 0 },
    { q: "¿Qué es una cláusula de confidencialidad?", opts: ["Un acuerdo para proteger información sensible", "Un tipo de factura", "Un cargo directivo", "Un plan de mercadeo"], correct: 0 },
    { q: "¿Qué revisa Jurídica antes de firmar un contrato con un tercero?", opts: ["Riesgos legales, cláusulas y cumplimiento normativo", "El color corporativo", "El horario de almuerzo", "El clima laboral"], correct: 0 },
    { q: "¿Qué es un otrosí en un contrato?", opts: ["Un documento que modifica un contrato existente", "Un nuevo empleado", "Un tipo de factura", "Una certificación"], correct: 0 }
  ],
  TC: [
    { q: "¿Qué gestiona el área de Tecnología en la innovación?", opts: ["Herramientas y sistemas digitales", "Contratos legales", "Rutas de transporte", "Nómina"], correct: 0 },
    { q: "¿Qué es un ERP?", opts: ["Un sistema integrado de gestión empresarial", "Un tipo de contrato", "Una norma de calidad", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué busca la transformación digital en logística?", opts: ["Optimizar procesos usando tecnología", "Eliminar todos los empleados", "Aumentar el papeleo", "Reducir la calidad"], correct: 0 },
    { q: "¿Qué es la trazabilidad digital de un envío?", opts: ["El seguimiento en tiempo real de su ubicación y estado", "Un tipo de factura", "Un contrato laboral", "Una norma ambiental"], correct: 0 },
    { q: "¿Qué protege una política de ciberseguridad?", opts: ["Los datos y sistemas de accesos no autorizados", "El clima laboral", "El inventario físico", "Las rutas de transporte"], correct: 0 }
  ],
  SE: [
    { q: "¿Qué protege principalmente el área de Seguridad?", opts: ["Personas, activos e instalaciones", "El presupuesto anual", "La imagen de marca", "El inventario contable"], correct: 0 },
    { q: "¿Qué es un plan de contingencia?", opts: ["Un protocolo de respuesta ante incidentes", "Un tipo de factura", "Un contrato laboral", "Una certificación de calidad"], correct: 0 },
    { q: "¿Qué busca el control de acceso a instalaciones?", opts: ["Permitir el ingreso solo a personal autorizado", "Aumentar las ventas", "Reducir el inventario", "Cambiar proveedores"], correct: 0 },
    { q: "¿Qué es el 'GPS' en el contexto de seguridad de carga?", opts: ["Sistema de posicionamiento para monitorear vehículos", "Un tipo de contrato", "Una norma de calidad", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué mide un análisis de riesgo de seguridad?", opts: ["La probabilidad e impacto de amenazas", "El clima laboral", "Las ventas del mes", "El diseño de oficinas"], correct: 0 }
  ],
  GA: [
    { q: "¿Qué busca la Gestión Ambiental en logística?", opts: ["Reducir el impacto ambiental de la operación", "Aumentar las ventas", "Reducir el personal", "Aumentar el inventario"], correct: 0 },
    { q: "¿Qué mide la huella de carbono?", opts: ["Las emisiones de gases de efecto invernadero generadas", "El número de empleados", "El clima laboral", "El inventario de bodega"], correct: 0 },
    { q: "¿Qué es la logística inversa?", opts: ["El proceso de retorno y reciclaje de productos/empaques", "Un tipo de contrato", "Una norma de calidad", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué busca la optimización de rutas en términos ambientales?", opts: ["Reducir kilómetros recorridos y consumo de combustible", "Aumentar el precio del flete", "Reducir el inventario", "Cambiar de proveedor"], correct: 0 },
    { q: "¿Qué norma internacional aplica a la gestión ambiental?", opts: ["ISO 14001", "ISO 9001", "ISO 45001", "ISO 27001"], correct: 0 }
  ],
  ST: [
    { q: "¿Qué sigla corresponde a Seguridad y Salud en el Trabajo?", opts: ["SST", "SARLAFT", "SGC", "SLA"], correct: 0 },
    { q: "¿Qué es un 'acto inseguro' en SST?", opts: ["Una acción humana que puede causar un accidente", "Un tipo de factura", "Un contrato laboral", "Una norma ambiental"], correct: 0 },
    { q: "¿Qué busca una matriz de riesgos laborales?", opts: ["Identificar y valorar peligros en el trabajo", "Aumentar las ventas", "Reducir el inventario", "Cambiar de proveedor"], correct: 0 },
    { q: "¿Qué es un EPP?", opts: ["Elemento de Protección Personal", "Un tipo de contrato", "Una norma de calidad", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué mide la tasa de accidentalidad laboral?", opts: ["La frecuencia de accidentes de trabajo en un periodo", "El clima laboral únicamente", "Las ventas del mes", "El inventario de bodega"], correct: 0 }
  ],
  CO: [
    { q: "¿Qué busca optimizar el área de Compras?", opts: ["Costo, calidad y tiempo de adquisición", "El clima organizacional", "La velocidad de internet", "El diseño de oficinas"], correct: 0 },
    { q: "¿Qué es una cotización comparativa?", opts: ["Comparar precios y condiciones de varios proveedores", "Un tipo de contrato laboral", "Una norma de calidad", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué busca la evaluación de proveedores?", opts: ["Medir su desempeño, calidad y cumplimiento", "Aumentar las ventas", "Reducir el personal", "Cambiar el logo"], correct: 0 },
    { q: "¿Qué es una orden de compra?", opts: ["Un documento formal que solicita bienes o servicios", "Un tipo de factura de nómina", "Una norma ambiental", "Un contrato laboral"], correct: 0 },
    { q: "¿Qué busca negociar el área de Compras con proveedores estratégicos?", opts: ["Mejores condiciones de precio, plazo y calidad", "Solo el color del empaque", "El horario de almuerzo", "El clima laboral"], correct: 0 }
  ],
  SA: [
    { q: "¿Qué tipo de tareas gestiona Servicios Administrativos?", opts: ["Soporte operativo transversal a la empresa", "Solo contabilidad", "Solo mercadeo", "Solo tecnología"], correct: 0 },
    { q: "¿Qué incluye típicamente la gestión documental?", opts: ["Organización, archivo y control de documentos", "Solo la nómina", "Solo el inventario", "Solo el mercadeo"], correct: 0 },
    { q: "¿Qué busca la gestión de activos fijos?", opts: ["Controlar y mantener los bienes de la empresa", "Aumentar las ventas", "Reducir el personal", "Cambiar de proveedor"], correct: 0 },
    { q: "¿Qué es un SLA (Service Level Agreement)?", opts: ["Un acuerdo de nivel de servicio con tiempos y condiciones", "Un tipo de factura", "Una norma ambiental", "Un contrato laboral"], correct: 0 },
    { q: "¿Qué busca optimizar la gestión de servicios generales?", opts: ["El funcionamiento eficiente de las instalaciones", "El clima laboral únicamente", "Las ventas del mes", "El inventario de bodega"], correct: 0 }
  ],
  SC: [
    { q: "¿Qué mide la satisfacción en Servicio al Cliente?", opts: ["Experiencia y resolución efectiva", "El precio del combustible", "El clima", "La cantidad de facturas"], correct: 0 },
    { q: "¿Qué es un NPS (Net Promoter Score)?", opts: ["Una métrica de recomendación y lealtad del cliente", "Un tipo de factura", "Una norma ambiental", "Un contrato laboral"], correct: 0 },
    { q: "¿Qué busca un protocolo de atención al cliente?", opts: ["Estandarizar una experiencia de calidad", "Aumentar el precio sin aviso", "Reducir el inventario", "Cambiar de proveedor"], correct: 0 },
    { q: "¿Qué es un PQR?", opts: ["Petición, Queja o Reclamo de un cliente", "Un tipo de contrato", "Una norma de calidad", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué canal es clave para la atención omnicanal?", opts: ["Integrar varios canales (llamada, chat, correo) de forma coherente", "Solo el correo postal", "Solo el fax", "Solo el telegrama"], correct: 0 }
  ],
  LD: [
    { q: "¿Qué significa CD en logística?", opts: ["Centro de Distribución", "Contrato Digital", "Control de Datos", "Costo Directo"], correct: 0 },
    { q: "¿Qué es el picking en un centro de distribución?", opts: ["El proceso de recolectar productos para un pedido", "Un tipo de factura", "Una norma ambiental", "Un contrato laboral"], correct: 0 },
    { q: "¿Qué busca el cross-docking?", opts: ["Transferir mercancía directamente sin almacenarla mucho tiempo", "Aumentar el inventario permanente", "Reducir el personal", "Cambiar de proveedor"], correct: 0 },
    { q: "¿Qué mide el nivel de servicio (fill rate) de un CD?", opts: ["El porcentaje de pedidos entregados completos y a tiempo", "El clima laboral", "El color del empaque", "El horario de almuerzo"], correct: 0 },
    { q: "¿Qué busca optimizar el layout de una bodega?", opts: ["Flujo eficiente de mercancía y personas", "El diseño de la fachada", "El logo corporativo", "El uniforme del personal"], correct: 0 }
  ],
  CA: [
    { q: "¿Qué optimiza el proceso de Cargo?", opts: ["El espacio y peso de la carga transportada", "El salario del conductor", "El clima de la ruta", "La antigüedad del vehículo"], correct: 0 },
    { q: "¿Qué es la consolidación de carga?", opts: ["Agrupar varios envíos pequeños en uno mayor", "Un tipo de contrato", "Una norma ambiental", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué documento ampara legalmente el transporte de mercancía?", opts: ["La remesa o manifiesto de carga", "La hoja de vida del conductor", "El manual de calidad", "El plan de mercadeo"], correct: 0 },
    { q: "¿Qué busca el cálculo de peso volumétrico?", opts: ["Determinar el costo de envío según espacio ocupado", "El clima laboral", "El inventario de bodega", "Las ventas del mes"], correct: 0 },
    { q: "¿Qué es la carga paletizada?", opts: ["Mercancía organizada sobre estibas/pallets para su manejo", "Un tipo de contrato", "Una norma de calidad", "Un cargo directivo"], correct: 0 }
  ],
  IN: [
    { q: "¿Qué controla la Gestión de Inventarios?", opts: ["Existencias, ubicación y trazabilidad de productos", "El presupuesto de marketing", "La nómina", "Las contrataciones"], correct: 0 },
    { q: "¿Qué es el método FIFO?", opts: ["Primero en entrar, primero en salir", "Un tipo de contrato", "Una norma ambiental", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué mide la rotación de inventario?", opts: ["Cuántas veces se renueva el stock en un periodo", "El clima laboral", "El color del empaque", "El horario de almuerzo"], correct: 0 },
    { q: "¿Qué busca un inventario cíclico?", opts: ["Verificar existencias periódicamente sin detener la operación", "Aumentar las ventas", "Reducir el personal", "Cambiar de proveedor"], correct: 0 },
    { q: "¿Qué es el stock de seguridad?", opts: ["Inventario adicional para cubrir imprevistos en la demanda", "Un tipo de factura", "Una norma de calidad", "Un contrato laboral"], correct: 0 }
  ],
  LA: [
    { q: "¿Qué hace el proceso de Acondicionamiento?", opts: ["Prepara y empaca el producto para su distribución", "Contrata personal", "Diseña contratos", "Gestiona la cartera"], correct: 0 },
    { q: "¿Qué es el reempaque en logística?", opts: ["Cambiar o adaptar el empaque original de un producto", "Un tipo de contrato", "Una norma ambiental", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué busca el control de calidad en el acondicionamiento?", opts: ["Verificar que el empaque cumpla estándares antes de despachar", "Aumentar las ventas", "Reducir el personal", "Cambiar de proveedor"], correct: 0 },
    { q: "¿Qué es la cadena de frío?", opts: ["Mantener un rango de temperatura controlado en toda la logística", "Un tipo de contrato", "Una norma de calidad general", "Un cargo directivo"], correct: 0 },
    { q: "¿Qué busca el etiquetado correcto de un producto?", opts: ["Trazabilidad, información clara y cumplimiento normativo", "El clima laboral", "El horario de almuerzo", "Las ventas del mes"], correct: 0 }
  ]
};

module.exports = { MISSIONS, MUNDOS, QUESTIONS_BANK };
