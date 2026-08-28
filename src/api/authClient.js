const API_URL = import.meta.env.VITE_API_URL || '/api';

export const authClient = {
  getToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
    }
  },

  async register(name, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async getMe() {
    const token = this.getToken();
    if (!token) return null;

    // Guest Mode fallback
    if (token.startsWith('guest_')) {
      return {
        id: token,
        name: 'Usuario Invitado',
        email: 'invitado@numlab.local',
        isGuest: true,
      };
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.setToken(null);
        return null;
      }
      return await res.json();
    } catch (err) {
      // If server unreachable, check if we have offline user info stored
      const cached = localStorage.getItem('auth_user_cache');
      if (cached) return JSON.parse(cached);
      return null;
    }
  },

  async useCredit() {
    const token = this.getToken();
    if (!token) return { success: false, remaining: 0 };

    if (token.startsWith('guest_')) {
      const guestCredits = parseInt(localStorage.getItem('guest_credits') ?? '5', 10);
      const remaining = Math.max(0, guestCredits - 1);
      localStorage.setItem('guest_credits', String(remaining));
      return { success: guestCredits > 0, remaining, isPremium: false };
    }

    try {
      const res = await fetch(`${API_URL}/auth/use-credit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (e) {
      return { success: true, remaining: 5, isPremium: false };
    }
  },

  async redeemCode(code) {
    const token = this.getToken();
    if (!token) throw new Error('Debes iniciar sesión para canjear un código');

    const res = await fetch(`${API_URL}/auth/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al canjear código');
    }
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  loginAsGuest() {
    const guestId = 'guest_' + Date.now();
    this.setToken(guestId);
    localStorage.setItem('guest_credits', '5');
    const guestUser = {
      id: guestId,
      name: 'Usuario Invitado',
      email: 'invitado@numlab.local',
      role: 'free',
      dailyCredits: 5,
      isGuest: true,
    };
    localStorage.setItem('auth_user_cache', JSON.stringify(guestUser));
    return guestUser;
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al solicitar recuperación');
    }
    return data;
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al restablecer contraseña');
    }
    return data;
  },

  logout() {
    this.setToken(null);
    localStorage.removeItem('auth_user_cache');
  },

  // Works API
  async getWorks() {
    const token = this.getToken();
    if (!token || token.startsWith('guest_')) {
      return JSON.parse(localStorage.getItem('saved_works') || '[]');
    }

    try {
      const res = await fetch(`${API_URL}/works`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return JSON.parse(localStorage.getItem('saved_works') || '[]');
    }
  },

  async saveWork(workData) {
    const token = this.getToken();
    const local = JSON.parse(localStorage.getItem('saved_works') || '[]');
    const newLocalWork = {
      ...workData,
      id: 'wrk_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('saved_works', JSON.stringify([newLocalWork, ...local]));

    if (token && !token.startsWith('guest_')) {
      try {
        await fetch(`${API_URL}/works`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(workData),
        });
      } catch (e) {}
    }
    return newLocalWork;
  },

  async deleteWork(id) {
    const local = JSON.parse(localStorage.getItem('saved_works') || '[]');
    localStorage.setItem('saved_works', JSON.stringify(local.filter((w) => w.id !== id)));

    const token = this.getToken();
    if (token && !token.startsWith('guest_')) {
      try {
        await fetch(`${API_URL}/works/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }
  },

  // -------------------------------------------------------------
  // ADMIN API
  // -------------------------------------------------------------
  async getPromoCodes() {
    const token = this.getToken();
    const res = await fetch(`${API_URL}/admin/codes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  async createPromoCode(payload) {
    const token = this.getToken();
    const res = await fetch(`${API_URL}/admin/codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  async deletePromoCode(code) {
    const token = this.getToken();
    const res = await fetch(`${API_URL}/admin/codes/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }
};
