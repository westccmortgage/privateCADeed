import type { Locale } from "./config";

/**
 * Translation dictionaries for the core surfaces (Header, Footer, Home,
 * Solutions, command box, live demo, book/callback). English is the canonical
 * shape; `es` and `ru` are typed against it so missing keys fail to compile.
 *
 * Note: illustrative sample deal text (what a borrower "types") is kept in
 * English so the deterministic fallback extractor parses it reliably.
 */

const en = {
  switcher: { label: "Language" },

  header: {
    cta: "Book Deal Review",
    nav: {
      howItWorks: "How It Works",
      solutions: "Solutions",
      tools: "Tools",
      resources: "Resources",
      company: "Company",
      forCapitalSources: "For Capital Sources",
    },
    cols: {
      theEngine: "The engine",
      whyDifferent: "Why it's different",
      capitalPaths: "Capital paths",
      whoItsFor: "Who it's for",
      calculators: "Calculators",
      moreTools: "More tools",
      learn: "Learn",
      more: "More",
      company: "Company",
      capitalSources: "Capital sources",
    },
    links: {
      describeDeal: "Describe your deal",
      deterministicMath: "Deterministic math",
      nextBestQuestion: "Next best question",
      noApplicationForm: "No application form",
      numbersNeverInvented: "Numbers are never invented",
      routedGrcrm: "Routed through GRCRM",
      cashOut: "Cash-Out & Refinance",
      secondDeed: "2nd Deed of Trust",
      fixFlip: "Fix & Flip / Bridge",
      construction: "Construction Completion",
      forBorrowers: "For borrowers",
      forBrokers: "For brokers",
      forCapitalSources: "For capital sources",
      cltvCalc: "CLTV calculator",
      ltvLtcCalc: "LTV / LTC calculator",
      flipProfit: "Fix & flip profit",
      dscrCalc: "DSCR calculator",
      maxLoan: "Max-loan solver",
      allTools: "All tools",
      lienBasics: "California lien position basics",
      understandingCltv: "Understanding CLTV & equity",
      businessPurpose: "Business-purpose vs. consumer",
      glossary: "Glossary",
      faq: "FAQ",
      aboutCadeed: "About CADeed",
      howWeUnderwrite: "How we underwrite",
      complianceLicensing: "Compliance & licensing",
      legalPrivacy: "Legal & privacy",
      submitLendingBox: "Submit your lending box",
      howRoutingWorks: "How routing works",
      receiveScenarios: "Receive matched scenarios",
    },
  },

  footer: {
    tagline: "Private Capital Engine",
    links: {
      howItWorks: "How It Works",
      solutions: "Solutions",
      tools: "Tools",
      resources: "Resources",
      faq: "FAQ",
      forBorrowers: "For Borrowers",
      forBrokers: "For Brokers",
      forCapitalSources: "For Capital Sources",
      company: "Company",
      legalPrivacy: "Legal & Privacy",
    },
    disclaimer:
      "CADeed.com · California Private Capital Engine. Information presented is for preliminary scenario modeling only and does not constitute a loan approval, commitment to lend, or an offer of credit. Private capital arranged through licensed professionals where required.",
  },

  home: {
    eyebrow: "California Private Capital, explained simply",
    heroTitle: "Describe your California real estate deal.",
    heroSub:
      "Tell us what you're trying to do with your property, in your own words. CADeed instantly explains your options for private (non-bank) real estate financing, does the math for you, and shows what a lender would look at.",
    heroReassure:
      "No application, no long forms, and no credit check to see your options — and nothing here is a loan approval or commitment. Just a clear picture, in seconds.",
    helperWhatIs: "What is private capital?",
    helperSeeOptions: "See the options",
    helperHowItWorks: "How it works",
    placeholderEmpty: "Tell us your deal in plain English...",
    placeholderContinue: "Answer or add more detail...",
    errorGeneric: "Something went wrong analyzing the deal.",
    errorUnexpected: "Unexpected error.",
    chatErrorReply:
      "Sorry — I hit a snag processing that. Please try rephrasing your deal.",
    howTitle: "How It Works",
    how: [
      {
        title: "Describe",
        body: "Tell the engine your deal in plain English. No forms, no fields, no application.",
      },
      {
        title: "Calculate",
        body: "Deterministic models compute LTV, CLTV, leverage, and equity — the numbers are never guessed.",
      },
      {
        title: "Route",
        body: "With your consent, the structured scenario goes to GRCRM for licensed review and capital-source routing.",
      },
    ],
    solutionsTitle: "Solutions",
    solutionsIntro:
      "New to private capital? Tap any option to understand what it is, when it fits, and how it works — in plain English. No form to fill out.",
    solutions: [
      {
        title: "Cash-Out & Refinance",
        body: "Turn equity you already have into usable cash — through a new 1st or a 2nd deed of trust.",
      },
      {
        title: "Fix & Flip / Bridge",
        body: "Short-term capital to buy, renovate, and resell — sized around cost and future value.",
      },
      {
        title: "Construction Completion",
        body: "Capital to finish a stalled or bank-declined building project, funded to the remaining budget.",
      },
      {
        title: "2nd Deed of Trust",
        body: "A second loan behind your existing first — tap equity without touching your current loan.",
      },
    ],
    aboutTitle: "About Us",
    aboutLead:
      "CADeed is a California deal intake terminal for private capital. It reads a deal the way an experienced capital desk would — then maps the structure, the math, and the missing pieces in seconds.",
    aboutBody:
      "We pair deterministic underwriting math with language understanding, so the numbers are never invented — only the reasoning is accelerated. Scenarios are routed to licensed professionals and private capital sources through GRCRM.",
    resourcesTitle: "Resources",
    resources: [
      "California lien position basics",
      "Business-purpose vs. consumer loans",
      "Understanding CLTV and equity",
    ],
    bookTitle: "Book a deal review.",
    bookSub:
      "Bring your scenario to a licensed professional and a private capital source for a real, structured conversation.",
  },

  commandBox: {
    tryExample: "Try an example",
    listening: "Listening… speak naturally. Tap the mic or send to stop.",
    exampleHint:
      "Example: I need $300K cash-out on a Los Angeles property worth $1.2M. I owe $520K.",
    ariaDictate: "Dictate your deal",
    ariaStop: "Stop dictation",
    ariaSubmit: "Analyze deal",
    exampleLabels: [
      "2nd position · mid-construction",
      "Cash-out refinance",
      "Fix & flip",
      "Construction completion",
    ],
  },

  demo: {
    caption: "CADeed engine · live preview",
    extracted: "Extracted",
    likelyPath: "Likely capital path",
    strong: "Strong",
    moderate: "Moderate",
    footer: "A live preview — your real numbers are computed the same deterministic way.",
    cta: "Describe your own deal",
    chipLabels: {
      Value: "Value",
      "Existing 1st": "Existing 1st",
      Requested: "Requested",
      Lien: "Lien",
      Location: "Location",
      Owe: "Owe",
      Purchase: "Purchase",
      Rehab: "Rehab",
      ARV: "ARV",
      "As-complete": "As-complete",
    } as Record<string, string>,
    metricLabels: {
      "Combined LTV": "Combined LTV",
      "Loan-to-ARV": "Loan-to-ARV",
      "Loan-to-Value": "Loan-to-Value",
    } as Record<string, string>,
  },

  book: {
    pickTime: "Pick a time",
    preferCallback: "Prefer a callback? Request one instead",
    requestCallback: "Request a callback",
    sending: "Sending…",
    done: "Thanks — we received your request and will reach out shortly.",
    error: "Could not send your request.",
    fieldName: "Full name",
    fieldEmail: "Email",
    fieldPhone: "Phone (optional)",
    fieldMessage: "Tell us briefly about your deal (optional)",
    orCall: "or call",
  },

  solutions: {
    eyebrow: "Solutions",
    title: "What kind of capital fits your deal?",
    intro:
      "Private capital is real estate financing from non-bank sources — funds and individual investors — that can move quickly and is sized around the property and the plan, not just your paperwork. Here's each path in plain English. Read first; you don't have to fill anything out.",
    whenItFits: "When it fits",
    whatLenderLooksAt: "What a lender looks at",
    describeThisDeal: "Describe this kind of deal",
    stillUnsureTitle: "Still not sure which one you need?",
    stillUnsureBody:
      "That's completely normal — and it's exactly what CADeed is for. Just describe your situation in your own words on the home page and the engine will tell you which path likely fits, do the math, and show what's missing. Nothing you see is a loan approval or a commitment to lend; every scenario is reviewed by a licensed professional before anything happens.",
    describeYourDeal: "Describe your deal",
    learnBasics: "Learn the basics first",
    items: [
      {
        title: "Cash-Out & Refinance",
        summary: "Turn equity you already have in a property into usable cash.",
        plain: [
          "If your California property is worth more than you owe on it, the difference is your equity. A cash-out refinance (or a second loan) lets you borrow against that equity and receive money you can use — for a project, another purchase, paying off higher-cost debt, or working capital for your business.",
          "There are two common ways to do it. A new 1st refinance replaces your existing loan with one larger loan and hands you the difference in cash. A 2nd deed of trust leaves your current loan in place and adds a smaller second loan behind it. Which one fits depends on your current rate, how much you need, and the total leverage on the property.",
        ],
        fits: [
          "You have meaningful equity and want to pull some of it out as cash",
          "You'd rather not disturb a low-rate existing first loan (a 2nd may fit)",
          "You need to move faster than a traditional bank timeline",
          "The purpose is business or investment rather than a primary residence",
        ],
        looksAt: [
          "Property value and how much you currently owe",
          "Combined loan-to-value (CLTV) once the new money is added",
          "How the loan gets repaid — your exit strategy",
        ],
      },
      {
        title: "Fix & Flip / Bridge",
        summary: "Short-term capital to buy, renovate, and resell a property.",
        plain: [
          "A fix & flip loan is short-term money for investors who buy a property, renovate it, and sell it for a profit. Because banks are usually too slow and too rigid for these deals, private capital steps in: it can close quickly and is sized around the project, not just your income.",
          'A bridge loan is the same idea in a broader sense — temporary financing that "bridges" the gap until a property is sold or refinanced into something longer-term. Both are meant to be paid off in months, not years, so the plan for the exit matters as much as the numbers.',
        ],
        fits: [
          "You're buying a property to renovate and resell",
          "You need to close quickly to win the deal",
          "You want funding sized to the project's cost and future value",
          "You have a clear plan to sell or refinance when the work is done",
        ],
        looksAt: [
          "Purchase price plus your rehab budget (loan-to-cost, or LTC)",
          "The projected after-repair value (ARV) once work is complete",
          "Your experience and a realistic timeline to finish and exit",
        ],
      },
      {
        title: "Construction Completion",
        summary: "Capital to finish a stalled or bank-declined building project.",
        plain: [
          "Sometimes a construction project runs out of financing before it's finished — the original lender pulls back, a bank declines the next draw, or costs came in higher than planned. Construction completion capital funds the remaining work so the project can reach the finish line.",
          "Because the property is only partly built, this kind of loan is released in stages tied to inspections and the remaining budget, rather than all at once. Lenders want to see how far along the project is, what's left to spend, how much you've already put in, and what the finished property will be worth.",
        ],
        fits: [
          "A project is mid-construction and needs money to be completed",
          "A bank declined the next draw or the construction loan overall",
          "You've already invested significant equity into the build",
          "You can document the remaining budget and the finished value",
        ],
        looksAt: [
          "Project stage, permits, and the cost remaining to complete",
          "Amount already invested and the as-is value today",
          "The as-complete (finished) value and your exit — sale or refinance",
        ],
      },
      {
        title: "2nd Deed of Trust",
        summary: "A second loan that sits behind your existing first loan.",
        plain: [
          'A deed of trust is the document that secures a loan against your property. When you already have a loan (the "1st"), a second deed of trust is an additional loan recorded behind it. It lets you tap equity without touching — or paying off — your existing first loan, which is useful when that first loan has a good rate you\'d like to keep.',
          "Because a 2nd is repaid only after the 1st in a sale or foreclosure, the lender is taking more risk, so what matters most is the combined leverage: your existing first loan plus the new second, measured against the property's value. When the combined total stays within a comfortable range, a 2nd can be a clean, fast way to raise capital.",
        ],
        fits: [
          "You want to keep your existing first loan in place",
          "You need additional capital and have equity to support it",
          "Combined leverage (first + second) stays within range",
          "The purpose is business or investment use",
        ],
        looksAt: [
          "Existing first-loan balance and the property value",
          "Combined loan-to-value (CLTV) — the primary metric for a 2nd",
          "Equity remaining behind both loans and your exit strategy",
        ],
      },
    ],
  },
};

export type Messages = typeof en;

const es: Messages = {
  switcher: { label: "Idioma" },

  header: {
    cta: "Reservar revisión",
    nav: {
      howItWorks: "Cómo funciona",
      solutions: "Soluciones",
      tools: "Herramientas",
      resources: "Recursos",
      company: "Empresa",
      forCapitalSources: "Para fuentes de capital",
    },
    cols: {
      theEngine: "El motor",
      whyDifferent: "Por qué es diferente",
      capitalPaths: "Rutas de capital",
      whoItsFor: "Para quién es",
      calculators: "Calculadoras",
      moreTools: "Más herramientas",
      learn: "Aprende",
      more: "Más",
      company: "Empresa",
      capitalSources: "Fuentes de capital",
    },
    links: {
      describeDeal: "Describe tu operación",
      deterministicMath: "Matemática determinista",
      nextBestQuestion: "Siguiente mejor pregunta",
      noApplicationForm: "Sin formulario de solicitud",
      numbersNeverInvented: "Los números nunca se inventan",
      routedGrcrm: "Derivado a través de GRCRM",
      cashOut: "Refinanciación y retiro de efectivo",
      secondDeed: "2ª escritura de fideicomiso",
      fixFlip: "Reforma y venta / Puente",
      construction: "Finalización de construcción",
      forBorrowers: "Para prestatarios",
      forBrokers: "Para brókers",
      forCapitalSources: "Para fuentes de capital",
      cltvCalc: "Calculadora de CLTV",
      ltvLtcCalc: "Calculadora LTV / LTC",
      flipProfit: "Beneficio de reforma y venta",
      dscrCalc: "Calculadora DSCR",
      maxLoan: "Cálculo de préstamo máximo",
      allTools: "Todas las herramientas",
      lienBasics: "Fundamentos de prelación de gravámenes en California",
      understandingCltv: "Entender el CLTV y el capital",
      businessPurpose: "Fin comercial vs. consumo",
      glossary: "Glosario",
      faq: "Preguntas frecuentes",
      aboutCadeed: "Sobre CADeed",
      howWeUnderwrite: "Cómo evaluamos",
      complianceLicensing: "Cumplimiento y licencias",
      legalPrivacy: "Legal y privacidad",
      submitLendingBox: "Envía tu perfil de préstamo",
      howRoutingWorks: "Cómo funciona la derivación",
      receiveScenarios: "Recibe escenarios compatibles",
    },
  },

  footer: {
    tagline: "Motor de capital privado",
    links: {
      howItWorks: "Cómo funciona",
      solutions: "Soluciones",
      tools: "Herramientas",
      resources: "Recursos",
      faq: "Preguntas frecuentes",
      forBorrowers: "Para prestatarios",
      forBrokers: "Para brókers",
      forCapitalSources: "Para fuentes de capital",
      company: "Empresa",
      legalPrivacy: "Legal y privacidad",
    },
    disclaimer:
      "CADeed.com · Motor de capital privado de California. La información presentada es solo para modelado preliminar de escenarios y no constituye una aprobación de préstamo, un compromiso de prestar ni una oferta de crédito. El capital privado se gestiona a través de profesionales con licencia cuando se requiere.",
  },

  home: {
    eyebrow: "Capital privado de California, explicado de forma sencilla",
    heroTitle: "Describe tu operación inmobiliaria en California.",
    heroSub:
      "Cuéntanos qué quieres hacer con tu propiedad, con tus propias palabras. CADeed te explica al instante tus opciones de financiación inmobiliaria privada (no bancaria), hace los cálculos por ti y te muestra qué miraría un prestamista.",
    heroReassure:
      "Sin solicitud, sin formularios largos y sin consulta de crédito para ver tus opciones — y nada de esto es una aprobación ni un compromiso de préstamo. Solo una imagen clara, en segundos.",
    helperWhatIs: "¿Qué es el capital privado?",
    helperSeeOptions: "Ver las opciones",
    helperHowItWorks: "Cómo funciona",
    placeholderEmpty: "Cuéntanos tu operación en lenguaje sencillo...",
    placeholderContinue: "Responde o añade más detalles...",
    errorGeneric: "Algo salió mal al analizar la operación.",
    errorUnexpected: "Error inesperado.",
    chatErrorReply:
      "Lo siento, tuve un problema al procesar eso. Intenta reformular tu operación.",
    howTitle: "Cómo funciona",
    how: [
      {
        title: "Describe",
        body: "Cuéntale al motor tu operación en lenguaje sencillo. Sin formularios, sin campos, sin solicitud.",
      },
      {
        title: "Calcula",
        body: "Modelos deterministas calculan LTV, CLTV, apalancamiento y capital — los números nunca se adivinan.",
      },
      {
        title: "Deriva",
        body: "Con tu consentimiento, el escenario estructurado se envía a GRCRM para revisión con licencia y derivación a fuentes de capital.",
      },
    ],
    solutionsTitle: "Soluciones",
    solutionsIntro:
      "¿Nuevo en el capital privado? Toca cualquier opción para entender qué es, cuándo encaja y cómo funciona — en lenguaje sencillo. Sin formularios que rellenar.",
    solutions: [
      {
        title: "Refinanciación y retiro de efectivo",
        body: "Convierte el capital que ya tienes en efectivo utilizable — mediante una nueva 1ª o una 2ª escritura de fideicomiso.",
      },
      {
        title: "Reforma y venta / Puente",
        body: "Capital a corto plazo para comprar, reformar y revender — dimensionado según el coste y el valor futuro.",
      },
      {
        title: "Finalización de construcción",
        body: "Capital para terminar un proyecto de construcción paralizado o rechazado por el banco, financiado hasta el presupuesto restante.",
      },
      {
        title: "2ª escritura de fideicomiso",
        body: "Un segundo préstamo detrás de tu primero actual — accede a tu capital sin tocar tu préstamo vigente.",
      },
    ],
    aboutTitle: "Sobre nosotros",
    aboutLead:
      "CADeed es un terminal de recepción de operaciones de capital privado en California. Lee una operación como lo haría una mesa de capital experimentada — y traza la estructura, los cálculos y lo que falta en segundos.",
    aboutBody:
      "Combinamos matemáticas de suscripción deterministas con comprensión del lenguaje, de modo que los números nunca se inventan — solo se acelera el razonamiento. Los escenarios se derivan a profesionales con licencia y a fuentes de capital privado a través de GRCRM.",
    resourcesTitle: "Recursos",
    resources: [
      "Fundamentos de la prelación de gravámenes en California",
      "Préstamos con fin comercial vs. de consumo",
      "Entender el CLTV y el capital",
    ],
    bookTitle: "Reserva una revisión de tu operación.",
    bookSub:
      "Lleva tu escenario a un profesional con licencia y a una fuente de capital privado para una conversación real y estructurada.",
  },

  commandBox: {
    tryExample: "Prueba un ejemplo",
    listening: "Escuchando… habla con naturalidad. Toca el micrófono o envía para parar.",
    exampleHint:
      "Ejemplo: Necesito $300K en efectivo de una propiedad en Los Ángeles que vale $1.2M. Debo $520K.",
    ariaDictate: "Dicta tu operación",
    ariaStop: "Detener dictado",
    ariaSubmit: "Analizar operación",
    exampleLabels: [
      "2ª posición · construcción en curso",
      "Refinanciación con retiro",
      "Reforma y venta",
      "Finalización de construcción",
    ],
  },

  demo: {
    caption: "Motor CADeed · vista en vivo",
    extracted: "Extraído",
    likelyPath: "Ruta de capital probable",
    strong: "Sólido",
    moderate: "Moderado",
    footer: "Una vista previa en vivo — tus números reales se calculan de la misma forma determinista.",
    cta: "Describe tu propia operación",
    chipLabels: {
      Value: "Valor",
      "Existing 1st": "1ª existente",
      Requested: "Solicitado",
      Lien: "Gravamen",
      Location: "Ubicación",
      Owe: "Debe",
      Purchase: "Compra",
      Rehab: "Reforma",
      ARV: "ARV",
      "As-complete": "Al terminar",
    },
    metricLabels: {
      "Combined LTV": "LTV combinado",
      "Loan-to-ARV": "Préstamo/ARV",
      "Loan-to-Value": "Préstamo/Valor",
    },
  },

  book: {
    pickTime: "Elige una hora",
    preferCallback: "¿Prefieres que te llamemos? Solicítalo aquí",
    requestCallback: "Solicitar una llamada",
    sending: "Enviando…",
    done: "Gracias — recibimos tu solicitud y te contactaremos en breve.",
    error: "No se pudo enviar tu solicitud.",
    fieldName: "Nombre completo",
    fieldEmail: "Correo electrónico",
    fieldPhone: "Teléfono (opcional)",
    fieldMessage: "Cuéntanos brevemente sobre tu operación (opcional)",
    orCall: "o llama al",
  },

  solutions: {
    eyebrow: "Soluciones",
    title: "¿Qué tipo de capital encaja con tu operación?",
    intro:
      "El capital privado es financiación inmobiliaria de fuentes no bancarias — fondos e inversores particulares — que puede moverse rápido y se dimensiona según la propiedad y el plan, no solo tu papeleo. Aquí tienes cada ruta en lenguaje sencillo. Lee primero; no tienes que rellenar nada.",
    whenItFits: "Cuándo encaja",
    whatLenderLooksAt: "Qué mira un prestamista",
    describeThisDeal: "Describe este tipo de operación",
    stillUnsureTitle: "¿Aún no sabes cuál necesitas?",
    stillUnsureBody:
      "Es completamente normal — y es justo para lo que sirve CADeed. Solo describe tu situación con tus propias palabras en la página de inicio y el motor te dirá qué ruta encaja mejor, hará los cálculos y te mostrará qué falta. Nada de lo que ves es una aprobación ni un compromiso de préstamo; cada escenario lo revisa un profesional con licencia antes de que ocurra nada.",
    describeYourDeal: "Describe tu operación",
    learnBasics: "Aprende primero lo básico",
    items: [
      {
        title: "Refinanciación y retiro de efectivo",
        summary: "Convierte el capital que ya tienes en una propiedad en efectivo utilizable.",
        plain: [
          "Si tu propiedad en California vale más de lo que debes por ella, la diferencia es tu capital (equity). Una refinanciación con retiro de efectivo (o un segundo préstamo) te permite pedir prestado contra ese capital y recibir dinero que puedes usar — para un proyecto, otra compra, saldar deudas más caras o capital de trabajo para tu negocio.",
          "Hay dos maneras comunes de hacerlo. Una nueva 1ª refinanciación sustituye tu préstamo actual por uno mayor y te entrega la diferencia en efectivo. Una 2ª escritura de fideicomiso deja tu préstamo actual en su lugar y añade un segundo préstamo menor detrás. Cuál encaja depende de tu tasa actual, cuánto necesitas y el apalancamiento total sobre la propiedad.",
        ],
        fits: [
          "Tienes un capital significativo y quieres retirar parte en efectivo",
          "Prefieres no tocar un primer préstamo con buena tasa (puede encajar una 2ª)",
          "Necesitas moverte más rápido que el plazo de un banco tradicional",
          "El fin es comercial o de inversión, no una vivienda principal",
        ],
        looksAt: [
          "El valor de la propiedad y cuánto debes actualmente",
          "El loan-to-value combinado (CLTV) una vez añadido el nuevo dinero",
          "Cómo se devuelve el préstamo — tu estrategia de salida",
        ],
      },
      {
        title: "Reforma y venta / Puente",
        summary: "Capital a corto plazo para comprar, reformar y revender una propiedad.",
        plain: [
          "Un préstamo de reforma y venta (fix & flip) es dinero a corto plazo para inversores que compran una propiedad, la reforman y la venden con beneficio. Como los bancos suelen ser demasiado lentos y rígidos para estas operaciones, entra el capital privado: puede cerrar rápido y se dimensiona según el proyecto, no solo tus ingresos.",
          'Un préstamo puente es la misma idea en un sentido más amplio — financiación temporal que "tiende un puente" hasta que la propiedad se vende o se refinancia en algo a más largo plazo. Ambos están pensados para devolverse en meses, no en años, así que el plan de salida importa tanto como los números.',
        ],
        fits: [
          "Estás comprando una propiedad para reformarla y revenderla",
          "Necesitas cerrar rápido para ganar la operación",
          "Quieres financiación dimensionada al coste del proyecto y su valor futuro",
          "Tienes un plan claro para vender o refinanciar cuando termine la obra",
        ],
        looksAt: [
          "Precio de compra más tu presupuesto de reforma (loan-to-cost, o LTC)",
          "El valor tras la reforma (ARV) previsto una vez terminada la obra",
          "Tu experiencia y un plazo realista para terminar y salir",
        ],
      },
      {
        title: "Finalización de construcción",
        summary: "Capital para terminar un proyecto de construcción paralizado o rechazado por el banco.",
        plain: [
          "A veces un proyecto de construcción se queda sin financiación antes de terminar — el prestamista original se retira, un banco rechaza el siguiente desembolso o los costes salieron más altos de lo previsto. El capital de finalización de construcción financia la obra restante para que el proyecto llegue a la meta.",
          "Como la propiedad solo está parcialmente construida, este tipo de préstamo se libera por etapas ligadas a inspecciones y al presupuesto restante, en lugar de todo de una vez. Los prestamistas quieren ver cuánto ha avanzado el proyecto, cuánto queda por gastar, cuánto has aportado ya y cuánto valdrá la propiedad terminada.",
        ],
        fits: [
          "Un proyecto está a medio construir y necesita dinero para completarse",
          "Un banco rechazó el siguiente desembolso o el préstamo de construcción en general",
          "Ya has invertido un capital significativo en la obra",
          "Puedes documentar el presupuesto restante y el valor terminado",
        ],
        looksAt: [
          "Etapa del proyecto, permisos y coste restante para terminar",
          "Importe ya invertido y el valor actual (as-is)",
          "El valor al terminar (as-complete) y tu salida — venta o refinanciación",
        ],
      },
      {
        title: "2ª escritura de fideicomiso",
        summary: "Un segundo préstamo situado detrás de tu primer préstamo actual.",
        plain: [
          'Una escritura de fideicomiso (deed of trust) es el documento que garantiza un préstamo con tu propiedad. Cuando ya tienes un préstamo (el "1º"), una segunda escritura es un préstamo adicional registrado detrás. Te permite acceder a tu capital sin tocar — ni saldar — tu primer préstamo actual, lo cual es útil cuando ese primer préstamo tiene una buena tasa que quieres conservar.',
          "Como una 2ª solo se devuelve después de la 1ª en una venta o ejecución, el prestamista asume más riesgo, así que lo que más importa es el apalancamiento combinado: tu primer préstamo actual más la nueva segunda, medidos contra el valor de la propiedad. Cuando el total combinado se mantiene en un rango cómodo, una 2ª puede ser una forma limpia y rápida de conseguir capital.",
        ],
        fits: [
          "Quieres mantener tu primer préstamo actual en su lugar",
          "Necesitas capital adicional y tienes capital para respaldarlo",
          "El apalancamiento combinado (1ª + 2ª) se mantiene en rango",
          "El fin es de uso comercial o de inversión",
        ],
        looksAt: [
          "Saldo del primer préstamo actual y el valor de la propiedad",
          "El loan-to-value combinado (CLTV) — la métrica principal para una 2ª",
          "El capital restante detrás de ambos préstamos y tu estrategia de salida",
        ],
      },
    ],
  },
};

const ru: Messages = {
  switcher: { label: "Язык" },

  header: {
    cta: "Разбор сделки",
    nav: {
      howItWorks: "Как это работает",
      solutions: "Решения",
      tools: "Инструменты",
      resources: "Ресурсы",
      company: "Компания",
      forCapitalSources: "Источникам капитала",
    },
    cols: {
      theEngine: "Движок",
      whyDifferent: "Чем отличается",
      capitalPaths: "Пути капитала",
      whoItsFor: "Для кого",
      calculators: "Калькуляторы",
      moreTools: "Ещё инструменты",
      learn: "Обучение",
      more: "Ещё",
      company: "Компания",
      capitalSources: "Источники капитала",
    },
    links: {
      describeDeal: "Опишите сделку",
      deterministicMath: "Детерминированная математика",
      nextBestQuestion: "Следующий лучший вопрос",
      noApplicationForm: "Без заявки",
      numbersNeverInvented: "Числа никогда не выдумываются",
      routedGrcrm: "Через GRCRM",
      cashOut: "Рефинансирование с наличными",
      secondDeed: "Второй deed of trust",
      fixFlip: "Fix & Flip / Бридж",
      construction: "Завершение строительства",
      forBorrowers: "Заёмщикам",
      forBrokers: "Брокерам",
      forCapitalSources: "Источникам капитала",
      cltvCalc: "Калькулятор CLTV",
      ltvLtcCalc: "Калькулятор LTV / LTC",
      flipProfit: "Прибыль fix & flip",
      dscrCalc: "Калькулятор DSCR",
      maxLoan: "Расчёт макс. займа",
      allTools: "Все инструменты",
      lienBasics: "Основы очерёдности залогов в Калифорнии",
      understandingCltv: "Понимание CLTV и капитала",
      businessPurpose: "Бизнес vs. потребитель",
      glossary: "Глоссарий",
      faq: "Частые вопросы",
      aboutCadeed: "О CADeed",
      howWeUnderwrite: "Как мы оцениваем",
      complianceLicensing: "Соответствие и лицензии",
      legalPrivacy: "Юридическое и конфиденциальность",
      submitLendingBox: "Отправьте свой профиль кредитования",
      howRoutingWorks: "Как работает подбор",
      receiveScenarios: "Получайте подходящие сценарии",
    },
  },

  footer: {
    tagline: "Движок частного капитала",
    links: {
      howItWorks: "Как это работает",
      solutions: "Решения",
      tools: "Инструменты",
      resources: "Ресурсы",
      faq: "Частые вопросы",
      forBorrowers: "Заёмщикам",
      forBrokers: "Брокерам",
      forCapitalSources: "Источникам капитала",
      company: "Компания",
      legalPrivacy: "Юридическое и конфиденциальность",
    },
    disclaimer:
      "CADeed.com · Калифорнийский движок частного капитала. Представленная информация служит только для предварительного моделирования сценариев и не является одобрением займа, обязательством кредитовать или предложением кредита. Частный капитал привлекается через лицензированных специалистов там, где это требуется.",
  },

  home: {
    eyebrow: "Частный капитал Калифорнии — простыми словами",
    heroTitle: "Опишите свою сделку с недвижимостью в Калифорнии.",
    heroSub:
      "Расскажите своими словами, что вы хотите сделать со своей недвижимостью. CADeed мгновенно объяснит варианты частного (небанковского) финансирования недвижимости, посчитает всё за вас и покажет, на что смотрит кредитор.",
    heroReassure:
      "Никакой заявки, длинных форм и проверки кредитной истории, чтобы увидеть варианты — и ничто здесь не является одобрением займа или обязательством. Просто ясная картина за секунды.",
    helperWhatIs: "Что такое частный капитал?",
    helperSeeOptions: "Посмотреть варианты",
    helperHowItWorks: "Как это работает",
    placeholderEmpty: "Опишите вашу сделку простыми словами...",
    placeholderContinue: "Ответьте или добавьте детали...",
    errorGeneric: "Что-то пошло не так при анализе сделки.",
    errorUnexpected: "Непредвиденная ошибка.",
    chatErrorReply:
      "Извините, возникла заминка при обработке. Попробуйте переформулировать сделку.",
    howTitle: "Как это работает",
    how: [
      {
        title: "Опишите",
        body: "Расскажите движку о сделке простыми словами. Без форм, без полей, без заявки.",
      },
      {
        title: "Рассчитайте",
        body: "Детерминированные модели вычисляют LTV, CLTV, плечо и капитал — числа никогда не выдумываются.",
      },
      {
        title: "Направьте",
        body: "С вашего согласия структурированный сценарий отправляется в GRCRM для проверки лицензированным специалистом и подбора источника капитала.",
      },
    ],
    solutionsTitle: "Решения",
    solutionsIntro:
      "Впервые сталкиваетесь с частным капиталом? Нажмите любой вариант, чтобы понять, что это, когда подходит и как работает — простыми словами. Ничего заполнять не нужно.",
    solutions: [
      {
        title: "Рефинансирование с наличными",
        body: "Превратите уже накопленный капитал в наличные — через новый 1-й или 2-й deed of trust.",
      },
      {
        title: "Fix & Flip / Бридж",
        body: "Краткосрочный капитал, чтобы купить, отремонтировать и перепродать — рассчитан по затратам и будущей стоимости.",
      },
      {
        title: "Завершение строительства",
        body: "Капитал, чтобы завершить остановленный или отклонённый банком проект, в размере оставшегося бюджета.",
      },
      {
        title: "Второй deed of trust",
        body: "Второй заём позади вашего текущего первого — доступ к капиталу, не трогая текущий заём.",
      },
    ],
    aboutTitle: "О нас",
    aboutLead:
      "CADeed — это калифорнийский терминал приёма сделок для частного капитала. Он читает сделку так, как это сделал бы опытный капитал-деск — и за секунды выстраивает структуру, расчёты и недостающие детали.",
    aboutBody:
      "Мы соединяем детерминированную андеррайтинговую математику с пониманием языка, поэтому числа никогда не выдумываются — ускоряется только рассуждение. Сценарии направляются лицензированным специалистам и источникам частного капитала через GRCRM.",
    resourcesTitle: "Ресурсы",
    resources: [
      "Основы очерёдности залогов в Калифорнии",
      "Займы для бизнеса и потребительские займы",
      "Понимание CLTV и капитала",
    ],
    bookTitle: "Запишитесь на разбор сделки.",
    bookSub:
      "Обсудите свой сценарий с лицензированным специалистом и источником частного капитала — предметно и по делу.",
  },

  commandBox: {
    tryExample: "Попробуйте пример",
    listening: "Слушаю… говорите свободно. Нажмите микрофон или отправьте, чтобы остановить.",
    exampleHint:
      "Пример: Мне нужно $300K наличными под недвижимость в Лос-Анджелесе стоимостью $1.2M. Я должен $520K.",
    ariaDictate: "Продиктуйте сделку",
    ariaStop: "Остановить диктовку",
    ariaSubmit: "Анализировать сделку",
    exampleLabels: [
      "2-я позиция · в процессе стройки",
      "Рефинансирование с наличными",
      "Fix & flip",
      "Завершение строительства",
    ],
  },

  demo: {
    caption: "Движок CADeed · живой предпросмотр",
    extracted: "Извлечено",
    likelyPath: "Вероятный путь капитала",
    strong: "Сильный",
    moderate: "Умеренный",
    footer: "Живой предпросмотр — ваши реальные числа считаются так же детерминированно.",
    cta: "Опишите свою сделку",
    chipLabels: {
      Value: "Стоимость",
      "Existing 1st": "Текущий 1-й",
      Requested: "Запрошено",
      Lien: "Залог",
      Location: "Локация",
      Owe: "Долг",
      Purchase: "Покупка",
      Rehab: "Ремонт",
      ARV: "ARV",
      "As-complete": "По завершении",
    },
    metricLabels: {
      "Combined LTV": "Совокупный LTV",
      "Loan-to-ARV": "Заём к ARV",
      "Loan-to-Value": "Заём к стоимости",
    },
  },

  book: {
    pickTime: "Выберите время",
    preferCallback: "Хотите, чтобы вам перезвонили? Запросите звонок",
    requestCallback: "Запросить звонок",
    sending: "Отправка…",
    done: "Спасибо — мы получили вашу заявку и скоро свяжемся.",
    error: "Не удалось отправить заявку.",
    fieldName: "Полное имя",
    fieldEmail: "Эл. почта",
    fieldPhone: "Телефон (необязательно)",
    fieldMessage: "Коротко о вашей сделке (необязательно)",
    orCall: "или позвоните",
  },

  solutions: {
    eyebrow: "Решения",
    title: "Какой капитал подходит вашей сделке?",
    intro:
      "Частный капитал — это финансирование недвижимости из небанковских источников — фондов и частных инвесторов — которое работает быстро и рассчитывается по объекту и плану, а не только по вашим документам. Ниже каждый путь простыми словами. Сначала прочитайте; ничего заполнять не нужно.",
    whenItFits: "Когда подходит",
    whatLenderLooksAt: "На что смотрит кредитор",
    describeThisDeal: "Опишите такую сделку",
    stillUnsureTitle: "Всё ещё не уверены, что вам нужно?",
    stillUnsureBody:
      "Это совершенно нормально — именно для этого и создан CADeed. Просто опишите свою ситуацию своими словами на главной странице, и движок подскажет, какой путь скорее всего подходит, посчитает всё и покажет, чего не хватает. Ничто из увиденного не является одобрением займа или обязательством кредитовать; каждый сценарий проверяет лицензированный специалист, прежде чем что-либо произойдёт.",
    describeYourDeal: "Опишите свою сделку",
    learnBasics: "Сначала изучите основы",
    items: [
      {
        title: "Рефинансирование с наличными",
        summary: "Превратите уже накопленный в недвижимости капитал в доступные наличные.",
        plain: [
          "Если ваша недвижимость в Калифорнии стоит больше, чем вы по ней должны, разница — это ваш капитал (equity). Рефинансирование с получением наличных (или второй заём) позволяет занять под этот капитал и получить деньги, которые можно использовать — на проект, другую покупку, погашение более дорогих долгов или оборотные средства для бизнеса.",
          "Есть два распространённых способа. Новое 1-е рефинансирование заменяет ваш текущий заём одним большим и выдаёт разницу наличными. Второй deed of trust оставляет текущий заём на месте и добавляет меньший второй заём позади него. Что подойдёт — зависит от вашей текущей ставки, нужной суммы и общего плеча по объекту.",
        ],
        fits: [
          "У вас есть существенный капитал, и вы хотите вывести часть наличными",
          "Вы не хотите трогать первый заём с низкой ставкой (может подойти 2-й)",
          "Вам нужно действовать быстрее, чем сроки традиционного банка",
          "Цель — бизнес или инвестиции, а не основное жильё",
        ],
        looksAt: [
          "Стоимость объекта и сколько вы должны сейчас",
          "Совокупный loan-to-value (CLTV) после добавления новых денег",
          "Как заём будет погашен — ваша стратегия выхода",
        ],
      },
      {
        title: "Fix & Flip / Бридж",
        summary: "Краткосрочный капитал, чтобы купить, отремонтировать и перепродать объект.",
        plain: [
          "Заём fix & flip — это краткосрочные деньги для инвесторов, которые покупают объект, ремонтируют его и продают с прибылью. Поскольку банки обычно слишком медленны и негибки для таких сделок, вступает частный капитал: он закрывается быстро и рассчитывается по проекту, а не только по вашему доходу.",
          'Бридж-заём — та же идея в более широком смысле: временное финансирование, которое «наводит мост» до момента, когда объект продаётся или рефинансируется в нечто более долгосрочное. Оба рассчитаны на погашение за месяцы, а не годы, поэтому план выхода важен не меньше цифр.',
        ],
        fits: [
          "Вы покупаете объект, чтобы отремонтировать и перепродать",
          "Вам нужно быстро закрыть, чтобы получить сделку",
          "Вам нужно финансирование по стоимости проекта и будущей стоимости",
          "У вас есть чёткий план продать или рефинансировать по завершении работ",
        ],
        looksAt: [
          "Цена покупки плюс бюджет ремонта (loan-to-cost, или LTC)",
          "Прогнозная стоимость после ремонта (ARV) по завершении работ",
          "Ваш опыт и реалистичный срок завершения и выхода",
        ],
      },
      {
        title: "Завершение строительства",
        summary: "Капитал, чтобы завершить остановленный или отклонённый банком проект.",
        plain: [
          "Иногда у строительного проекта заканчивается финансирование до завершения — исходный кредитор отступает, банк отклоняет следующий транш или расходы вышли выше запланированных. Капитал на завершение строительства финансирует оставшиеся работы, чтобы проект дошёл до финиша.",
          "Поскольку объект построен лишь частично, такой заём выдаётся поэтапно, привязан к инспекциям и оставшемуся бюджету, а не выдаётся сразу целиком. Кредиторы хотят видеть, насколько продвинулся проект, сколько осталось потратить, сколько вы уже вложили и сколько будет стоить готовый объект.",
        ],
        fits: [
          "Проект в процессе стройки и нуждается в деньгах для завершения",
          "Банк отклонил следующий транш или строительный заём целиком",
          "Вы уже вложили значительный капитал в стройку",
          "Вы можете документально подтвердить оставшийся бюджет и итоговую стоимость",
        ],
        looksAt: [
          "Стадия проекта, разрешения и стоимость, оставшаяся до завершения",
          "Уже вложенная сумма и текущая стоимость (as-is)",
          "Стоимость по завершении (as-complete) и ваш выход — продажа или рефинансирование",
        ],
      },
      {
        title: "Второй deed of trust",
        summary: "Второй заём, стоящий позади вашего текущего первого займа.",
        plain: [
          'Deed of trust — это документ, который обеспечивает заём вашей недвижимостью. Когда у вас уже есть заём (первый, «1-й»), второй deed of trust — это дополнительный заём, зарегистрированный позади него. Он позволяет получить доступ к капиталу, не трогая — и не погашая — ваш текущий первый заём, что удобно, когда у первого хорошая ставка, которую вы хотите сохранить.',
          "Поскольку 2-й погашается только после 1-го при продаже или обращении взыскания, кредитор берёт больше риска, поэтому важнее всего совокупное плечо: ваш текущий первый заём плюс новый второй по отношению к стоимости объекта. Когда совокупная сумма остаётся в комфортном диапазоне, 2-й может быть чистым и быстрым способом привлечь капитал.",
        ],
        fits: [
          "Вы хотите сохранить текущий первый заём на месте",
          "Вам нужен дополнительный капитал, и есть equity для его поддержки",
          "Совокупное плечо (1-й + 2-й) остаётся в диапазоне",
          "Цель — бизнес или инвестиционное использование",
        ],
        looksAt: [
          "Остаток текущего первого займа и стоимость объекта",
          "Совокупный loan-to-value (CLTV) — главная метрика для 2-го",
          "Остаток капитала позади обоих займов и ваша стратегия выхода",
        ],
      },
    ],
  },
};

export const dictionaries: Record<Locale, Messages> = { en, es, ru };
