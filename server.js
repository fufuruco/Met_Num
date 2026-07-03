import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

export const createApp = () => {
  const app = express();
  app.use(express.json());

const users = new Map();
const sessions = new Map();

const createToken = () => `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const getUserByEmail = (email) => users.get(email.toLowerCase());

const createSession = (email) => {
  const token = createToken();
  sessions.set(token, { email });
  return token;
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const session = token ? sessions.get(token) : null;

  if (!session) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  req.user = { email: session.email };
  next();
};

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', mode: isProd ? 'production' : 'development' });
  });

  app.get('/api/auth/public-settings', (_req, res) => {
  res.json({
    id: 'local-app',
    public_settings: {
      authRequired: false,
      mode: 'express-local'
    }
  });
});

  app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (getUserByEmail(email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const otpCode = '123456';
  users.set(email.toLowerCase(), {
    email: email.toLowerCase(),
    password,
    verified: false,
    otpCode
  });

  res.json({ ok: true, message: 'Registration successful', otpCode });
});

  app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otpCode } = req.body || {};
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.otpCode !== otpCode) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  user.verified = true;
  const token = createSession(user.email);
  res.json({ ok: true, token, user: { email: user.email, role: 'user' } });
});

  app.post('/api/auth/resend-otp', (req, res) => {
  const { email } = req.body || {};
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.otpCode = '123456';
  res.json({ ok: true, message: 'Verification code resent' });
});

  app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = createSession(user.email);
  res.json({ ok: true, token, user: { email: user.email, role: 'user' } });
});

  app.post('/api/auth/login-provider', (req, res) => {
  const { provider } = req.body || {};
  if (!provider) {
    return res.status(400).json({ message: 'Provider is required' });
  }

  const email = `demo-${provider}@local.test`;
  if (!getUserByEmail(email)) {
    users.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      password: 'provider-login',
      verified: true
    });
  }

  const token = createSession(email);
  res.json({ ok: true, token, user: { email, role: 'user' } });
});

  app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body || {};
  const user = getUserByEmail(email);
  if (!user) {
    return res.json({ ok: true, message: 'If the account exists, a reset link was sent' });
  }

  user.resetToken = 'demo-reset-token';
  res.json({ ok: true, message: 'If the account exists, a reset link was sent' });
});

  app.post('/api/auth/reset-password', (req, res) => {
  const { resetToken, newPassword } = req.body || {};
  let targetUser = null;

  for (const user of users.values()) {
    if (user.resetToken === resetToken) {
      targetUser = user;
      break;
    }
  }

  if (!targetUser) {
    return res.status(400).json({ message: 'Invalid reset link' });
  }

  targetUser.password = newPassword;
  delete targetUser.resetToken;
  res.json({ ok: true, message: 'Password changed successfully' });
});

  app.get('/api/auth/me', authenticate, (req, res) => {
  const user = getUserByEmail(req.user.email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ ok: true, user: { email: user.email, role: 'user' } });
});

  app.post('/api/auth/logout', authenticate, (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    sessions.delete(token);
  }
  res.json({ ok: true });
});

  return app;
};

const startServer = async () => {
  const app = createApp();
  const serveFrontend = async () => {
    if (isProd) {
      app.use(express.static(path.join(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
      return;
    }

    const hmrPort = Number(process.env.VITE_HMR_PORT || 24679);
    const vite = await createViteServer({
      configFile: path.join(__dirname, 'entities', 'vite.config.js'),
      root: path.join(__dirname, 'entities'),
      server: {
        middlewareMode: true,
        hmr: { port: hmrPort, host: '127.0.0.1' },
        fs: { strict: false }
      }
    });

    app.use(vite.middlewares);

    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      if (req.path.includes('.')) {
        return next();
      }
      return res.status(200).set({ 'Content-Type': 'text/html' }).end((() => {
        const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Mate App</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`;
        return html;
      })());
    });
  };

  await serveFrontend();

  const port = Number(process.env.PORT || 3000);
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
      resolve(server);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const fallbackPort = port + 1;
        console.warn(`Port ${port} is busy, trying ${fallbackPort}`);
        const fallbackServer = app.listen(fallbackPort, () => {
          const address = fallbackServer.address();
          const actualPort = typeof address === 'object' && address ? address.port : fallbackPort;
          console.log(`Server listening on http://localhost:${actualPort}`);
          resolve(fallbackServer);
        });
      } else {
        console.error(error);
        process.exit(1);
      }
    });
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default startServer;
