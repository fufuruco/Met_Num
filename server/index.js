import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config(); // fallback to cwd .env if any

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'numlab_super_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database initialization (File-based persistent JSON database)
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function loadDB() {
  try {
    let db;
    if (!fs.existsSync(DB_FILE)) {
      db = { users: [], works: [], resetTokens: [], promoCodes: [] };
    } else {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    }

    if (!db.promoCodes) db.promoCodes = [];

    // Initialize Admin User
    const adminEmail = 'JPereira';
    const adminExists = db.users.find(u => u.email === adminEmail);
    if (!adminExists) {
      // Sync bcrypt hash since this is startup
      const hashedPassword = bcrypt.hashSync('Lulo2026', 10);
      db.users.push({
        id: 'usr_admin_' + Date.now(),
        name: 'Administrador JP',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        dailyCredits: 9999,
        lastCreditDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        premiumUntil: Date.now() + 1000 * 60 * 60 * 24 * 365 * 100 // 100 years premium
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } else if (db.users.length > 0 && adminExists) {
       // ensure admin always has admin role
       if(adminExists.role !== 'admin') {
           adminExists.role = 'admin';
           fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
       }
    }

    return db;
  } catch (e) {
    console.error('Error loading database:', e);
    return { users: [], works: [], resetTokens: [], promoCodes: [] };
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const db = loadDB();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (existing) {
      return res.status(400).json({ error: 'Ya existe una cuenta con este correo electrónico' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name?.trim() || email.split('@')[0],
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'free', // 'free' | 'premium' | 'admin'
      dailyCredits: 5,
      lastCreditDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDB(db);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        dailyCredits: newUser.dailyCredits,
      },
    });
  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ error: 'Error en el servidor al registrar usuario' });
  }
});

// Helper to refresh user daily credits and check premium expiry
function getUpdatedUserCredits(user) {
  if (user.role === 'admin') return user;

  const now = Date.now();
  if (user.role === 'premium' && user.premiumUntil) {
    if (now > user.premiumUntil) {
      user.role = 'free';
      user.premiumUntil = null;
    }
  }

  const today = new Date().toISOString().split('T')[0];
  if (user.lastCreditDate !== today) {
    user.dailyCredits = 5;
    user.lastCreditDate = today;
  }
  return user;
}

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const db = loadDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    getUpdatedUserCredits(user);
    saveDB(db);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role || 'free' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'free',
        dailyCredits: user.role === 'premium' ? 999 : user.dailyCredits ?? 5,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
  }
});

// Me (Get Current User & sync credits)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    getUpdatedUserCredits(user);
    saveDB(db);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'free',
      dailyCredits: user.role === 'premium' ? 999 : user.dailyCredits ?? 5,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Error en me:', err);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
});

// Consume 1 Step-by-Step Credit
app.post('/api/auth/use-credit', authenticateToken, (req, res) => {
  try {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.role === 'premium') {
      return res.json({ success: true, remaining: 999, isPremium: true });
    }

    getUpdatedUserCredits(user);

    if ((user.dailyCredits ?? 5) <= 0) {
      return res.status(403).json({
        error: 'Has consumido tus 5 créditos diarios gratuitos. Se renovarán mañana o puedes activar Premium.',
        remaining: 0,
      });
    }

    user.dailyCredits = Math.max(0, (user.dailyCredits ?? 5) - 1);
    saveDB(db);

    res.json({ success: true, remaining: user.dailyCredits, isPremium: false });
  } catch (err) {
    console.error('Error en use-credit:', err);
    res.status(500).json({ error: 'Error al descontar crédito' });
  }
});

// Redeem Promo / Activation Code for Instant Premium
app.post('/api/auth/redeem-code', authenticateToken, (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Ingresa un código de activación' });
    }

    const cleanCode = code.trim().toUpperCase();
    const db = loadDB();
    const promoCode = db.promoCodes.find((c) => c.code === cleanCode);

    if (!promoCode || !promoCode.isActive || promoCode.uses >= promoCode.maxUses) {
      return res.status(400).json({ error: 'Código de activación inválido, expirado o ya no tiene usos disponibles' });
    }

    const user = db.users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Apply promo
    promoCode.uses += 1;
    if (promoCode.uses >= promoCode.maxUses) {
      promoCode.isActive = false; // Disable if maxed out
    }

    const now = Date.now();
    // If already premium, extend the duration, otherwise start from now
    const baseTime = (user.role === 'premium' && user.premiumUntil && user.premiumUntil > now) ? user.premiumUntil : now;
    user.premiumUntil = baseTime + (promoCode.durationDays * 24 * 60 * 60 * 1000);
    user.role = 'premium';
    user.dailyCredits = 999;

    saveDB(db);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: `¡Código canjeado con éxito! Tienes Premium por ${promoCode.durationDays} días.`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyCredits: user.dailyCredits,
        premiumUntil: user.premiumUntil
      }
    });
  } catch (err) {
    console.error('Error en redeem-code:', err);
    res.status(500).json({ error: 'Error al canjear el código' });
  }
});

// Forgot Password Request
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const db = loadDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(404).json({ error: 'No existe ninguna cuenta registrada con este correo' });
    }

    const resetToken = 'rst_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    db.resetTokens = db.resetTokens || [];
    db.resetTokens.push({
      token: resetToken,
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + 3600000, // 1 hora
    });
    saveDB(db);

    res.json({
      message: 'Token de restablecimiento generado con éxito',
      resetToken,
      resetUrl: `/reset-password?token=${resetToken}`,
    });
  } catch (err) {
    console.error('Error en forgot-password:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Reset Password Execution
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    const db = loadDB();
    const recordIndex = (db.resetTokens || []).findIndex(
      (r) => r.token === token && r.expiresAt > Date.now()
    );

    if (recordIndex === -1) {
      return res.status(400).json({ error: 'El token de recuperación es inválido o ha expirado' });
    }

    const record = db.resetTokens[recordIndex];
    const user = db.users.find((u) => u.id === record.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    // Eliminar token usado
    db.resetTokens.splice(recordIndex, 1);
    saveDB(db);

    res.json({ message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error en reset-password:', err);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
});

// -------------------------------------------------------------
// ADMIN ENDPOINTS
// -------------------------------------------------------------

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de administrador' });
  }
  next();
}

app.get('/api/admin/codes', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = loadDB();
    res.json(db.promoCodes || []);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener códigos' });
  }
});

app.post('/api/admin/codes', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { code, durationDays, maxUses } = req.body;
    if (!code || !durationDays || !maxUses) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }

    const db = loadDB();
    if (!db.promoCodes) db.promoCodes = [];
    
    const cleanCode = code.trim().toUpperCase();
    if (db.promoCodes.find(c => c.code === cleanCode)) {
      return res.status(400).json({ error: 'El código ya existe' });
    }

    const newCode = {
      code: cleanCode,
      durationDays: parseInt(durationDays, 10),
      maxUses: parseInt(maxUses, 10),
      uses: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    db.promoCodes.push(newCode);
    saveDB(db);
    res.status(201).json(newCode);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear código' });
  }
});

app.delete('/api/admin/codes/:code', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = loadDB();
    const cleanCode = req.params.code.trim().toUpperCase();
    db.promoCodes = (db.promoCodes || []).filter(c => c.code !== cleanCode);
    saveDB(db);
    res.json({ message: 'Código eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar código' });
  }
});

// -------------------------------------------------------------
// SAVED WORKS (PERSISTENT CLOUD / LOCAL STORAGE)
// -------------------------------------------------------------

// Get user's saved works
app.get('/api/works', authenticateToken, (req, res) => {
  try {
    const db = loadDB();
    const userWorks = (db.works || []).filter((w) => w.userId === req.user.id);
    res.json(userWorks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    console.error('Error en get works:', err);
    res.status(500).json({ error: 'Error al obtener trabajos' });
  }
});

// Save a new work
app.post('/api/works', authenticateToken, (req, res) => {
  try {
    const { module, method, problemSetup, resultData } = req.body;
    const db = loadDB();

    const newWork = {
      id: 'wrk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: req.user.id,
      module,
      method,
      problemSetup,
      resultData,
      createdAt: new Date().toISOString(),
    };

    db.works = db.works || [];
    db.works.push(newWork);
    saveDB(db);

    res.status(201).json(newWork);
  } catch (err) {
    console.error('Error en save work:', err);
    res.status(500).json({ error: 'Error al guardar el trabajo' });
  }
});

// Delete a work
app.delete('/api/works/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const db = loadDB();

    db.works = (db.works || []).filter((w) => !(w.id === id && w.userId === req.user.id));
    saveDB(db);

    res.json({ message: 'Trabajo eliminado correctamente' });
  } catch (err) {
    console.error('Error en delete work:', err);
    res.status(500).json({ error: 'Error al eliminar el trabajo' });
  }
});

// -------------------------------------------------------------
// AI STEP-BY-STEP SOLVER (GEMINI)
// -------------------------------------------------------------

const SYSTEM_PROMPT_MATH = `Eres un tutor de matemáticas universitario experto. Tu trabajo es resolver problemas matemáticos mostrando CADA paso intermedio con explicaciones claras y detalladas en español.

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin bloques de código.
2. El JSON debe tener esta estructura exacta:
{
  "steps": [
    {
      "title": "Título corto del paso",
      "explanation": "Explicación detallada en español de QUÉ se hace y POR QUÉ",
      "latex": "Expresión matemática en LaTeX puro (sin delimitadores $)"
    }
  ],
  "result": "Resultado final en texto plano",
  "resultLatex": "Resultado final en LaTeX puro"
}
3. Incluye MÍNIMO 5 pasos y MÁXIMO 15 pasos para problemas complejos.
4. Cada paso debe explicar la REGLA o TEOREMA que se aplica (ej: "Aplicamos la regla de la cadena porque...", "Usamos integración por partes donde u=... y dv=...").
5. Muestra las sustituciones intermedias explícitamente.
6. En integrales: muestra el método usado, las sustituciones, el desarrollo algebraico intermedio y la verificación.
7. En derivadas: indica qué regla se aplica en cada paso (cadena, producto, cociente, etc).
8. En ecuaciones: muestra cada operación algebraica que se aplica a ambos lados.
9. En simplificaciones: muestra la factorización, cancelación o agrupación paso a paso.
10. El LaTeX debe ser compatible con KaTeX (no uses \\displaystyle, \\begin{align}, ni entornos complejos. Usa \\frac{}{}, \\sqrt{}, \\int, \\sum, etc).`;

app.post('/api/solve-steps', async (req, res) => {
  try {
    const { expression, operation, context } = req.body;

    if (!expression) {
      return res.status(400).json({ error: 'Se requiere una expresión matemática' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API Key de Gemini no configurada' });
    }

    let userPrompt = '';

    switch (operation) {
      case 'simplify':
        userPrompt = `Simplifica la siguiente expresión algebraica paso a paso: ${expression}`;
        break;
      case 'expand':
        userPrompt = `Expande (multiplica y distribuye) la siguiente expresión paso a paso: ${expression}`;
        break;
      case 'factor':
        userPrompt = `Factoriza la siguiente expresión paso a paso, identificando factor común, diferencia de cuadrados, trinomio cuadrado perfecto u otras técnicas: ${expression}`;
        break;
      case 'solve':
        userPrompt = `Resuelve la siguiente ecuación paso a paso, mostrando cada operación algebraica aplicada a ambos lados: ${expression}`;
        break;
      case 'derivative':
        const orderD = context?.order || 1;
        userPrompt = `Calcula la derivada de orden ${orderD} de la función f(x) = ${expression} paso a paso. Indica claramente qué regla de derivación aplicas en cada paso (regla de la cadena, del producto, del cociente, derivadas trigonométricas, exponenciales, etc).`;
        break;
      case 'integral':
        if (context?.definite && context?.a !== undefined && context?.b !== undefined) {
          userPrompt = `Calcula la integral definida de ${expression} con límites desde ${context.a} hasta ${context.b}, paso a paso. Primero encuentra la antiderivada, luego aplica el Teorema Fundamental del Cálculo (Regla de Barrow). Muestra la evaluación en los límites y la resta final.`;
        } else {
          userPrompt = `Calcula la integral indefinida de ${expression} dx paso a paso. Identifica el método más apropiado (directa, sustitución, por partes, fracciones parciales, trigonométrica) y muestra cada sustitución y transformación algebraica intermedia. No olvides la constante de integración C.`;
        }
        break;
      default:
        userPrompt = `Resuelve lo siguiente paso a paso con explicaciones detalladas: ${expression}`;
    }

    let response;
    try {
      response = await geminiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT_MATH,
          temperature: 0.2,
        }
      });
    } catch (modelErr) {
      console.warn('Fallo con gemini-3.5-flash, probando gemini-3.7-flash:', modelErr.message);
      response = await geminiClient.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT_MATH,
          temperature: 0.2,
        }
      });
    }

    const text = response.text.trim();
    
    // Clean potential markdown code blocks
    let cleanJson = text;
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed = JSON.parse(cleanJson);

    res.json({
      steps: parsed.steps || [],
      result: parsed.result || '',
      resultLatex: parsed.resultLatex || '',
      aiPowered: true
    });

  } catch (err) {
    console.error('Error en solve-steps (Gemini):', err.message || err);
    res.status(500).json({ 
      error: 'Error al procesar con IA. Intenta de nuevo.',
      details: err.message 
    });
  }
});

// General Prompt solver for Calculus and other modules
app.post('/api/solve-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Se requiere un prompt' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API Key no configurada' });
    }

    let response;
    try {
      response = await geminiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Eres un profesor de matemáticas y cálculo experto. Proporciona soluciones paso a paso muy detalladas con explicaciones claras en español y fórmulas en LaTeX formateadas para KaTeX ($...$ para fórmulas en línea y $$...$$ para fórmulas en bloque).',
          temperature: 0.2,
        }
      });
    } catch (e) {
      response = await geminiClient.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Eres un profesor de matemáticas y cálculo experto. Proporciona soluciones paso a paso muy detalladas con explicaciones claras en español y fórmulas en LaTeX formateadas para KaTeX ($...$ para fórmulas en línea y $$...$$ para fórmulas en bloque).',
          temperature: 0.2,
        }
      });
    }

    res.json({ result: response.text });
  } catch (err) {
    console.error('Error en solve-prompt:', err);
    res.status(500).json({ error: 'Error al procesar el cálculo con IA', details: err.message });
  }
});

// Serve static frontend build if present (Production deployment mode)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express NumLab activo en http://localhost:${PORT}`);
});
