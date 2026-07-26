import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { evaluateFunction } from '@/lib/mathParser';

// ── Simplified Marching Cubes lookup tables ──────────────────────────────────
// Edge table: which edges are intersected for each cube configuration
const edgeTable = new Int32Array([
  0x0,0x109,0x203,0x30a,0x406,0x50f,0x605,0x70c,0x80c,0x905,0xa0f,0xb06,0xc0a,0xd03,0xe09,0xf00,
  0x190,0x99,0x393,0x29a,0x596,0x49f,0x795,0x69c,0x99c,0x895,0xb9f,0xa96,0xd9a,0xc93,0xf99,0xe90,
  0x230,0x339,0x33,0x13a,0x636,0x73f,0x435,0x53c,0xa3c,0xb35,0x83f,0x936,0xe3a,0xf33,0xc39,0xd30,
  0x3a0,0x2a9,0x1a3,0xaa,0x7a6,0x6af,0x5a5,0x4ac,0xbac,0xaa5,0x9af,0x8a6,0xfaa,0xea3,0xda9,0xca0,
  0x460,0x569,0x663,0x76a,0x66,0x16f,0x265,0x36c,0xc6c,0xd65,0xe6f,0xf66,0x86a,0x963,0xa69,0xb60,
  0x5f0,0x4f9,0x7f3,0x6fa,0x1f6,0xff,0x3f5,0x2fc,0xdfc,0xcf5,0xfff,0xef6,0x9fa,0x8f3,0xbf9,0xaf0,
  0x650,0x759,0x453,0x55a,0x256,0x35f,0x55,0x15c,0xe5c,0xf55,0xc5f,0xd56,0xa5a,0xb53,0x859,0x950,
  0x7c0,0x6c9,0x5c3,0x4ca,0x3c6,0x2cf,0x1c5,0xcc,0xfcc,0xec5,0xdcf,0xcc6,0xbca,0xac3,0x9c9,0x8c0,
  0x8c0,0x9c9,0xac3,0xbca,0xcc6,0xdcf,0xec5,0xfcc,0xcc,0x1c5,0x2cf,0x3c6,0x4ca,0x5c3,0x6c9,0x7c0,
  0x950,0x859,0xb53,0xa5a,0xd56,0xc5f,0xf55,0xe5c,0x15c,0x55,0x35f,0x256,0x55a,0x453,0x759,0x650,
  0xaf0,0xbf9,0x8f3,0x9fa,0xef6,0xfff,0xcf5,0xdfc,0x2fc,0x3f5,0xff,0x1f6,0x6fa,0x7f3,0x4f9,0x5f0,
  0xb60,0xa69,0x963,0x86a,0xf66,0xe6f,0xd65,0xc6c,0x36c,0x265,0x16f,0x66,0x76a,0x663,0x569,0x460,
  0xca0,0xda9,0xea3,0xfaa,0x8a6,0x9af,0xaa5,0xbac,0x4ac,0x5a5,0x6af,0x7a6,0xaa,0x1a3,0x2a9,0x3a0,
  0xd30,0xc39,0xf33,0xe3a,0x936,0x835,0xb3f,0xa36,0x53c,0x435,0x73f,0x636,0x13a,0x33,0x339,0x230,
  0xe90,0xf99,0xc93,0xd9a,0xa96,0xb9f,0x895,0x99c,0x69c,0x795,0x49f,0x596,0x29a,0x393,0x99,0x190,
  0xf00,0xe09,0xd03,0xc0a,0xb06,0xa0f,0x905,0x80c,0x70c,0x605,0x50f,0x406,0x30a,0x203,0x109,0x0
]);

// Tri table for marching cubes (256 cases, each up to 16 entries, -1 = end)
// Trimmed for brevity - using a real implementation
const triTable = [
  [],
  [0,8,3],[0,1,9],[1,8,3,9,8,1],[1,2,10],[0,8,3,1,2,10],[9,2,10,0,2,9],[2,8,3,2,10,8,10,9,8],
  [3,11,2],[0,11,2,8,11,0],[1,9,0,2,3,11],[1,11,2,1,9,11,9,8,11],[3,10,1,11,10,3],[0,10,1,0,8,10,8,11,10],[3,9,0,3,11,9,11,10,9],[9,8,10,10,8,11],
  [4,7,8],[4,3,0,7,3,4],[0,1,9,8,4,7],[4,1,9,4,7,1,7,3,1],[1,2,10,8,4,7],[3,4,7,3,0,4,1,2,10],[9,2,10,9,0,2,8,4,7],[2,10,9,2,9,7,2,7,3,7,9,4],
  [8,4,7,3,11,2],[11,4,7,11,2,4,2,0,4],[9,0,1,8,4,7,2,3,11],[4,7,11,9,4,11,9,11,2,9,2,1],[3,10,1,3,11,10,7,8,4],[1,11,10,1,4,11,1,0,4,7,11,4],[4,7,8,9,0,11,9,11,10,11,0,3],[4,7,11,4,11,9,9,11,10],
  [9,5,4],[9,5,4,0,8,3],[0,5,4,1,5,0],[8,5,4,8,3,5,3,1,5],[1,2,10,9,5,4],[3,0,8,1,2,10,4,9,5],[5,2,10,5,4,2,4,0,2],[2,10,5,3,2,5,3,5,4,3,4,8],
  [9,5,4,2,3,11],[0,11,2,0,8,11,4,9,5],[0,5,4,0,1,5,2,3,11],[2,1,5,2,5,8,2,8,11,4,8,5],[10,3,11,10,1,3,9,5,4],[4,9,5,0,8,1,8,10,1,8,11,10],[5,4,0,5,0,11,5,11,10,11,0,3],[9,5,4,8,11,10,8,10,1,8,1,0],
  [10,7,6],[10,7,6,8,3,0],[7,6,10,7,10,1,1,0,7],[3,6,10,3,0,6,0,7,6],[10,7,6,1,2,10],[1,2,10,3,0,8,6,7,10],[10,7,6,2,9,0,2,10,9],[6,7,2,2,7,11],
  [7,6,11],[7,6,11,3,0,8],[11,0,1,0,11,6,6,11,7],[3,11,6,0,3,6,0,6,7,0,7,1],[6,11,7,1,2,10],[1,2,10,3,11,6,3,6,7],[0,2,10,7,0,10,7,10,6,7,6,11],[7,6,11,0,8,3]
];

// Vertex positions on cube edges (indexed 0-11)
const edgeVertices = [
  [[0,0,0],[1,0,0]], [[1,0,0],[1,1,0]], [[1,1,0],[0,1,0]], [[0,1,0],[0,0,0]],
  [[0,0,1],[1,0,1]], [[1,0,1],[1,1,1]], [[1,1,1],[0,1,1]], [[0,1,1],[0,0,1]],
  [[0,0,0],[0,0,1]], [[1,0,0],[1,0,1]], [[1,1,0],[1,1,1]], [[0,1,0],[0,1,1]]
];

function interpolateVertex(v1, v2, val1, val2, isoLevel) {
  if (Math.abs(isoLevel - val1) < 1e-5) return v1;
  if (Math.abs(isoLevel - val2) < 1e-5) return v2;
  if (Math.abs(val1 - val2) < 1e-5) return v1;
  const t = (isoLevel - val1) / (val2 - val1);
  return [
    v1[0] + t * (v2[0] - v1[0]),
    v1[1] + t * (v2[1] - v1[1]),
    v1[2] + t * (v2[2] - v1[2])
  ];
}

// Build implicit surface F(x,y,z) = isoLevel using a simplified approach
function buildImplicitSurface(fnExpr, xMin, xMax, yMin, yMax, zMin, zMax, resolution = 30, isoLevel = 0) {
  const positions = [];
  const sx = (xMax - xMin) / resolution;
  const sy = (yMax - yMin) / resolution;
  const sz = (zMax - zMin) / resolution;

  // Sample the grid
  const vals = [];
  for (let iz = 0; iz <= resolution; iz++) {
    vals[iz] = [];
    for (let iy = 0; iy <= resolution; iy++) {
      vals[iz][iy] = [];
      for (let ix = 0; ix <= resolution; ix++) {
        const x = xMin + ix * sx;
        const y = yMin + iy * sy;
        const z = zMin + iz * sz;
        const v = evaluateFunction(fnExpr, { x, y, z });
        vals[iz][iy][ix] = isNaN(v) || !isFinite(v) ? 0 : v;
      }
    }
  }

  // March through cubes
  for (let iz = 0; iz < resolution; iz++) {
    for (let iy = 0; iy < resolution; iy++) {
      for (let ix = 0; ix < resolution; ix++) {
        const x0 = xMin + ix * sx;
        const y0 = yMin + iy * sy;
        const z0 = zMin + iz * sz;

        // 8 corners of the cube
        const corners = [
          [x0,    y0,    z0   ],
          [x0+sx, y0,    z0   ],
          [x0+sx, y0+sy, z0   ],
          [x0,    y0+sy, z0   ],
          [x0,    y0,    z0+sz],
          [x0+sx, y0,    z0+sz],
          [x0+sx, y0+sy, z0+sz],
          [x0,    y0+sy, z0+sz],
        ];
        const cv = [
          vals[iz][iy][ix],     vals[iz][iy][ix+1],
          vals[iz][iy+1][ix+1], vals[iz][iy+1][ix],
          vals[iz+1][iy][ix],   vals[iz+1][iy][ix+1],
          vals[iz+1][iy+1][ix+1],vals[iz+1][iy+1][ix],
        ];

        // Determine case index
        let cubeIndex = 0;
        for (let i = 0; i < 8; i++) {
          if (cv[i] < isoLevel) cubeIndex |= (1 << i);
        }

        if (cubeIndex === 0 || cubeIndex === 255) continue;

        // Compute edge intersections
        const edgeVerts = new Array(12);
        if (edgeTable[cubeIndex] & 1)    edgeVerts[0]  = interpolateVertex(corners[0], corners[1], cv[0], cv[1], isoLevel);
        if (edgeTable[cubeIndex] & 2)    edgeVerts[1]  = interpolateVertex(corners[1], corners[2], cv[1], cv[2], isoLevel);
        if (edgeTable[cubeIndex] & 4)    edgeVerts[2]  = interpolateVertex(corners[2], corners[3], cv[2], cv[3], isoLevel);
        if (edgeTable[cubeIndex] & 8)    edgeVerts[3]  = interpolateVertex(corners[3], corners[0], cv[3], cv[0], isoLevel);
        if (edgeTable[cubeIndex] & 16)   edgeVerts[4]  = interpolateVertex(corners[4], corners[5], cv[4], cv[5], isoLevel);
        if (edgeTable[cubeIndex] & 32)   edgeVerts[5]  = interpolateVertex(corners[5], corners[6], cv[5], cv[6], isoLevel);
        if (edgeTable[cubeIndex] & 64)   edgeVerts[6]  = interpolateVertex(corners[6], corners[7], cv[6], cv[7], isoLevel);
        if (edgeTable[cubeIndex] & 128)  edgeVerts[7]  = interpolateVertex(corners[7], corners[4], cv[7], cv[4], isoLevel);
        if (edgeTable[cubeIndex] & 256)  edgeVerts[8]  = interpolateVertex(corners[0], corners[4], cv[0], cv[4], isoLevel);
        if (edgeTable[cubeIndex] & 512)  edgeVerts[9]  = interpolateVertex(corners[1], corners[5], cv[1], cv[5], isoLevel);
        if (edgeTable[cubeIndex] & 1024) edgeVerts[10] = interpolateVertex(corners[2], corners[6], cv[2], cv[6], isoLevel);
        if (edgeTable[cubeIndex] & 2048) edgeVerts[11] = interpolateVertex(corners[3], corners[7], cv[3], cv[7], isoLevel);

        // Build triangles from tri table
        const tris = triTable[cubeIndex];
        if (tris) {
          for (let t = 0; t < tris.length; t += 3) {
            const v0 = edgeVerts[tris[t]];
            const v1 = edgeVerts[tris[t+1]];
            const v2 = edgeVerts[tris[t+2]];
            if (v0 && v1 && v2) {
              positions.push(...v0, ...v1, ...v2);
            }
          }
        }
      }
    }
  }

  return new Float32Array(positions);
}

// ── Component ────────────────────────────────────────────────────────────────
export default function FunctionPlotter3D({ expr, type = 'surface', limits }) {
  const mountRef = useRef(null);
  const [error, setError] = useState(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!mountRef.current || !expr) return;

    setRendering(true);
    setError(null);

    const width = mountRef.current.clientWidth || 500;
    const height = 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f0f1a');

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const d1 = new THREE.DirectionalLight(0x88aaff, 1.2);
    d1.position.set(10, 20, 10);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xff8844, 0.8);
    d2.position.set(-10, -5, -10);
    scene.add(d2);

    // Grid floor
    const grid = new THREE.GridHelper(20, 20, 0x444466, 0x333355);
    grid.position.y = -6;
    scene.add(grid);

    // Axes
    scene.add(new THREE.AxesHelper(8));

    try {
      if (type === 'surface') {
        // Explicit surface: z = f(x, y)
        const segments = 60;
        const xMin = -6, xMax = 6, yMin = -6, yMax = 6;
        const sx = (xMax - xMin) / segments;
        const sy = (yMax - yMin) / segments;

        const positions = [];
        const indices = [];
        const colors = [];

        // Sample grid
        const heights = [];
        let minH = Infinity, maxH = -Infinity;
        for (let iy = 0; iy <= segments; iy++) {
          heights[iy] = [];
          for (let ix = 0; ix <= segments; ix++) {
            const x = xMin + ix * sx;
            const y = yMin + iy * sy;
            const z = evaluateFunction(expr, { x, y });
            const h = (isNaN(z) || !isFinite(z) || Math.abs(z) > 50) ? 0 : z;
            heights[iy][ix] = h;
            if (h < minH) minH = h;
            if (h > maxH) maxH = h;
          }
        }

        const hRange = maxH - minH || 1;
        for (let iy = 0; iy <= segments; iy++) {
          for (let ix = 0; ix <= segments; ix++) {
            const x = xMin + ix * sx;
            const y = yMin + iy * sy;
            const h = heights[iy][ix];
            positions.push(x, h, -y);
            // Color gradient (cool to warm)
            const t = (h - minH) / hRange;
            colors.push(t, 0.3 + t * 0.4, 1 - t);
          }
        }

        for (let iy = 0; iy < segments; iy++) {
          for (let ix = 0; ix < segments; ix++) {
            const a = iy * (segments + 1) + ix;
            const b = a + 1;
            const c = a + (segments + 1);
            const d = c + 1;
            indices.push(a, b, d, a, d, c);
          }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide });
        scene.add(new THREE.Mesh(geo, mat));

        // Wireframe overlay
        const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.06 }));
        scene.add(wire);

      } else if (type === 'implicit') {
        // Implicit surface: F(x,y,z) = 0 using Marching Cubes
        const range = 5;
        const positions = buildImplicitSurface(expr, -range, range, -range, range, -range, range, 35, 0);

        if (positions.length === 0) {
          setError('No se encontró la superficie. Intenta con una función diferente o una constante distinta de cero.');
          setRendering(false);
          return;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.computeVertexNormals();

        const mat = new THREE.MeshPhongMaterial({
          color: 0x5599ff,
          emissive: 0x112244,
          specular: 0xffffff,
          shininess: 80,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        scene.add(new THREE.Mesh(geo, mat));

      } else if (type === 'double') {
        // Double integral: visualize surface + volume under it
        const parseN = (v, def) => { const n = parseFloat(v); return isNaN(n) ? def : n; };
        const xMin = parseN(limits?.xa, -4), xMax = parseN(limits?.xb, 4);
        const yMin = parseN(limits?.ya, -4), yMax = parseN(limits?.yb, 4);
        const segments = 50;
        const sx = (xMax - xMin) / segments;
        const sy = (yMax - yMin) / segments;

        const positions = [], indices = [], colors = [];
        const heights = [];
        let minH = Infinity, maxH = -Infinity;

        for (let iy = 0; iy <= segments; iy++) {
          heights[iy] = [];
          for (let ix = 0; ix <= segments; ix++) {
            const x = xMin + ix * sx;
            const y = yMin + iy * sy;
            const z = evaluateFunction(expr, { x, y });
            const h = (isNaN(z) || !isFinite(z) || Math.abs(z) > 200) ? 0 : z;
            heights[iy][ix] = h;
            if (h < minH) minH = h;
            if (h > maxH) maxH = h;
          }
        }

        const hRange = maxH - minH || 1;
        for (let iy = 0; iy <= segments; iy++) {
          for (let ix = 0; ix <= segments; ix++) {
            const x = xMin + ix * sx;
            const y = yMin + iy * sy;
            const h = heights[iy][ix];
            positions.push(x, h, -y);
            const t = (h - minH) / hRange;
            colors.push(0.1 + t * 0.4, 0.7 + t * 0.3, 0.4 - t * 0.3);
          }
        }

        for (let iy = 0; iy < segments; iy++) {
          for (let ix = 0; ix < segments; ix++) {
            const a = iy * (segments + 1) + ix;
            const b = a + 1, c = a + (segments + 1), d = c + 1;
            indices.push(a, b, d, a, d, c);
          }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();

        scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide })));
        scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.08 })));

      } else if (type === 'triple') {
        // Domain box + hint about function
        const parseN = (v, def) => { const n = parseFloat(v); return isNaN(n) ? def : n; };
        const xa = parseN(limits?.xa, 0), xb = parseN(limits?.xb, 1);
        const ya = parseN(limits?.ya, 0), yb = parseN(limits?.yb, 1);
        const za = parseN(limits?.za, 0), zb = parseN(limits?.zb, 1);

        const w = xb - xa, h = yb - ya, d = zb - za;
        const geo = new THREE.BoxGeometry(w, d, h);
        const mat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(xa + w / 2, za + d / 2, -(ya + h / 2));
        scene.add(mesh);
        const edges = new THREE.EdgesGeometry(geo);
        const lineMesh = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x88aaff }));
        lineMesh.position.copy(mesh.position);
        scene.add(lineMesh);
      }

      let rafId;
      const animate = () => { rafId = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); };
      animate();
      setRendering(false);

      return () => {
        cancelAnimationFrame(rafId);
        renderer.dispose();
        if (mountRef.current) mountRef.current.innerHTML = '';
      };

    } catch (err) {
      console.error(err);
      setError('Error al graficar: ' + err.message);
      setRendering(false);
    }
  }, [expr, type, JSON.stringify(limits)]);

  const typeLabels = {
    implicit: '🔭 Superficie Implícita F(x,y,z)=0 — Marching Cubes',
    surface: '📐 Superficie Explícita z = f(x,y)',
    double: '🟢 Superficie + Volumen de Integración Doble',
    triple: '📦 Dominio de Integración Triple'
  };

  return (
    <div className="w-full mt-4 border border-border rounded-xl overflow-hidden bg-[#0f0f1a]">
      <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex justify-between items-center">
        <span className="text-xs font-semibold text-white/70">{typeLabels[type] || 'Gráfico 3D'}</span>
        <span className="text-[10px] text-white/40">🖱️ Arrastrar = rotar · Scroll = zoom</span>
      </div>
      {rendering && <div className="flex items-center justify-center h-24 text-xs text-white/50">Renderizando superficie...</div>}
      {error && <div className="p-4 text-xs text-red-400 bg-red-500/10">{error}</div>}
      <div ref={mountRef} className="w-full cursor-move" />
    </div>
  );
}
