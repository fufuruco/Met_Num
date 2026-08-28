# 🧮 NumLab Engine — Laboratorio Virtual de Métodos Numéricos

Aplicación web interactiva para resolver problemas de **Métodos Numéricos**, **Cálculo** y **Estadística Descriptiva**, construida con React + Vite y desplegada en GitHub Pages.

---

## 📦 Requisitos Previos

Antes de empezar, asegúrate de tener instalado en tu computadora:

1. **Node.js** (versión 18 o superior): [https://nodejs.org](https://nodejs.org)
2. **Git**: [https://git-scm.com](https://git-scm.com)
---

## 🚀 Arranque Local (Ver la app en tu PC)

1. Abre una terminal en la carpeta del proyecto (`D:\Otras\Mate` o donde la tengas clonada).

2. Instala las dependencias (solo la primera vez o cuando se agreguen nuevas):
   ```bash
   npm install
   ```

3. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador y entra a la dirección que te indique la terminal (normalmente):
   ```
   http://localhost:5173
   ```

5. ¡Listo! Ya puedes ver y probar la aplicación en tiempo real. Cualquier cambio que hagas en el código se reflejará automáticamente en el navegador.

> **Nota:** Para detener el servidor, presiona `Ctrl + C` en la terminal.

---

## 📤 Actualizar el Repositorio en GitHub

Cuando termines de hacer cambios en el código y quieras guardarlos en tu repositorio de GitHub:

1. **Agrega todos los archivos modificados:**
   ```bash
   git add .
   ```

2. **Crea un commit con una descripción de lo que hiciste:**
   ```bash
   git commit -m "Descripción de los cambios realizados"
   ```

3. **Sube los cambios a GitHub:**
   ```bash
   git push origin main
   ```

> **Tip:** Si Git te rechaza el push porque hay cambios remotos que no tienes, puedes forzar la subida con:
> ```bash
> git push origin main --force
> ```
> ⚠️ Usa `--force` solo si estás seguro de que tu versión local es la correcta.

---

## 🌐 Actualizar la Página Web en Producción

### Opción A: Publicar en GitHub Pages

Tu página pública en GitHub Pages está en:
**https://fufuruco.github.io/Met_Num/**

Para actualizarla con los últimos cambios, ejecuta un solo comando:

```bash
npm run deploy:gh
```

Este comando automáticamente:
- Compila el proyecto con la ruta base `/Met_Num/`.
- Sube los archivos compilados a la rama `gh-pages` de tu repositorio.
- GitHub Pages publica la nueva versión en 1-3 minutos.

> **Tip:** Después de ejecutar el comando, espera 2-3 minutos y abre la página en una ventana de **Incógnito** (`Ctrl + Shift + N`) para evitar ver la versión vieja por la caché del navegador.

---

---

## 📋 Resumen Rápido de Comandos

| Acción                              | Comando                                    |
|-------------------------------------|--------------------------------------------|
| Instalar dependencias               | `npm install`                              |
| Arrancar servidor local             | `npm run dev`                              |
| Compilar para producción            | `npm run build`                            |
| Guardar cambios en Git              | `git add .` → `git commit -m "msg"` → `git push origin main` |
| Publicar en GitHub Pages            | `npm run deploy:gh`                        |


---

## 📁 Estructura del Proyecto

```
D:\Otras\Mate\
├── src/                        ← Código fuente principal
│   ├── pages/                  ← Páginas (Home, Statistics, Calculus, etc.)
│   ├── components/             ← Componentes reutilizables (Sidebar, Tabs, etc.)
│   ├── lib/                    ← Lógica de cálculo (statisticsMethods.js, etc.)
│   └── App.jsx                 ← Enrutador principal

├── dist/                       ← Archivos compilados (se genera con npm run build)
├── package.json                ← Dependencias y scripts
├── vite.config.js              ← Configuración de Vite
└── README.md                   ← Este archivo
```

---

## 🛠️ Tecnologías Utilizadas

- **React 18** — Interfaz de usuario
- **Vite** — Servidor de desarrollo y empaquetador
- **Tailwind CSS** — Estilos utilitarios
- **Recharts** — Gráficos interactivos (histogramas, regresión)
- **KaTeX** — Renderizado de fórmulas matemáticas
- **math.js** — Motor de evaluación de expresiones matemáticas

- **GitHub Pages** — Hosting alternativo gratuito
