const express = require("express");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors()); // Permite peticiones desde el frontend React
app.use(express.json());

// Multer: guarda el PDF en memoria (no en disco)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"), false);
    }
  },
});

// ─── Función principal: llamar a Claude API ────────────────────────────────────
async function analizarPDFconClaude(pdfBase64, tipoDocumento = "auto") {
  const prompts = {
    factura: `Eres un experto contable. Analiza esta factura y extrae TODOS los datos en formato JSON.
Devuelve ÚNICAMENTE el JSON, sin texto adicional, sin backticks, sin explicaciones.

El JSON debe tener esta estructura exacta:
{
  "tipo": "factura",
  "proveedor": {
    "nombre": "",
    "ruc_o_nit": "",
    "direccion": "",
    "telefono": "",
    "email": ""
  },
  "cliente": {
    "nombre": "",
    "ruc_o_nit": "",
    "direccion": ""
  },
  "documento": {
    "numero": "",
    "fecha_emision": "",
    "fecha_vencimiento": "",
    "moneda": ""
  },
  "items": [
    {
      "descripcion": "",
      "cantidad": 0,
      "precio_unitario": 0,
      "subtotal": 0
    }
  ],
  "totales": {
    "subtotal": 0,
    "igv_iva_porcentaje": 0,
    "igv_iva_monto": 0,
    "total": 0
  },
  "alertas": [],
  "resumen": ""
}

En el campo "alertas" incluye advertencias como:
- Si el total no coincide con la suma de items
- Si la fecha está vencida o vence pronto
- Si faltan datos obligatorios
- Cualquier irregularidad encontrada`,

    contrato: `Eres un experto legal. Analiza este contrato y extrae los datos clave en formato JSON.
Devuelve ÚNICAMENTE el JSON, sin texto adicional, sin backticks, sin explicaciones.

El JSON debe tener esta estructura exacta:
{
  "tipo": "contrato",
  "partes": [
    { "rol": "", "nombre": "", "documento_identidad": "", "representante": "" }
  ],
  "documento": {
    "tipo_contrato": "",
    "numero": "",
    "fecha_firma": "",
    "fecha_inicio": "",
    "fecha_fin": "",
    "renovacion_automatica": false,
    "lugar_firma": ""
  },
  "objeto": "",
  "monto": {
    "valor": 0,
    "moneda": "",
    "forma_pago": "",
    "periodicidad": ""
  },
  "obligaciones_parte_a": [],
  "obligaciones_parte_b": [],
  "penalidades": [],
  "clausulas_importantes": [],
  "alertas": [],
  "resumen": ""
}

En "alertas" incluye:
- Cláusulas de riesgo o inusuales
- Fechas próximas a vencer (menos de 30 días)
- Renovación automática activa
- Penalidades elevadas`,

    auto: `Eres un experto en documentos legales y contables. Primero identifica si el documento es una FACTURA, un CONTRATO, u otro tipo.
Luego extrae todos los datos relevantes en formato JSON.
Devuelve ÚNICAMENTE el JSON, sin texto adicional, sin backticks, sin explicaciones.

Si es FACTURA usa esta estructura:
{
  "tipo": "factura",
  "proveedor": { "nombre": "", "ruc_o_nit": "", "direccion": "", "telefono": "", "email": "" },
  "cliente": { "nombre": "", "ruc_o_nit": "", "direccion": "" },
  "documento": { "numero": "", "fecha_emision": "", "fecha_vencimiento": "", "moneda": "" },
  "items": [{ "descripcion": "", "cantidad": 0, "precio_unitario": 0, "subtotal": 0 }],
  "totales": { "subtotal": 0, "igv_iva_porcentaje": 0, "igv_iva_monto": 0, "total": 0 },
  "alertas": [],
  "resumen": ""
}

Si es CONTRATO usa esta estructura:
{
  "tipo": "contrato",
  "partes": [{ "rol": "", "nombre": "", "documento_identidad": "" }],
  "documento": { "tipo_contrato": "", "numero": "", "fecha_firma": "", "fecha_inicio": "", "fecha_fin": "", "renovacion_automatica": false },
  "objeto": "",
  "monto": { "valor": 0, "moneda": "", "forma_pago": "" },
  "obligaciones_parte_a": [],
  "obligaciones_parte_b": [],
  "penalidades": [],
  "clausulas_importantes": [],
  "alertas": [],
  "resumen": ""
}

Si es otro tipo de documento:
{
  "tipo": "otro",
  "descripcion_documento": "",
  "datos_principales": {},
  "alertas": [],
  "resumen": ""
}`
  };

  const prompt = prompts[tipoDocumento] || prompts.auto;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error de Claude API: ${error.error?.message || "Error desconocido"}`);
  }

  const data = await response.json();
  const textoRespuesta = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Limpiar y parsear el JSON
  const jsonLimpio = textoRespuesta
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(jsonLimpio);
}

// ─── Rutas ─────────────────────────────────────────────────────────────────────

// GET / → verificar que el servidor funciona
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    mensaje: "Servidor Analizador IA funcionando",
    version: "1.0.0",
  });
});

// POST /analizar → recibe PDF y devuelve análisis
app.post("/analizar", upload.single("archivo"), async (req, res) => {
  try {
    // 1. Validar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No se recibió ningún archivo PDF",
      });
    }

    // 2. Validar API Key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "ANTHROPIC_API_KEY no está configurada en el servidor",
      });
    }

    const tipoDocumento = req.body.tipo || "auto"; // "factura", "contrato" o "auto"
    const nombreArchivo = req.file.originalname;
    const tamanoKB = Math.round(req.file.size / 1024);

    console.log(`\n📄 Analizando: ${nombreArchivo} (${tamanoKB} KB) | Tipo: ${tipoDocumento}`);

    // 3. Convertir PDF a base64
    const pdfBase64 = req.file.buffer.toString("base64");

    // 4. Llamar a Claude
    const inicio = Date.now();
    const resultado = await analizarPDFconClaude(pdfBase64, tipoDocumento);
    const tiempoMs = Date.now() - inicio;

    console.log(`✅ Análisis completado en ${tiempoMs}ms | Tipo detectado: ${resultado.tipo}`);

    // 5. Devolver resultado
    res.json({
      ok: true,
      archivo: nombreArchivo,
      tamano_kb: tamanoKB,
      tiempo_ms: tiempoMs,
      datos: resultado,
    });

  } catch (error) {
    console.error("❌ Error al analizar:", error.message);

    // Error de JSON inválido (Claude no devolvió JSON puro)
    if (error instanceof SyntaxError) {
      return res.status(422).json({
        ok: false,
        error: "El documento no pudo ser interpretado correctamente. Intenta con un PDF de mejor calidad.",
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error interno del servidor",
    });
  }
});

// ─── Iniciar servidor ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET  /         → Estado del servidor`);
  console.log(`   POST /analizar → Analizar PDF\n`);
});
