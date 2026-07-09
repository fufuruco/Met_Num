export function gaussElimination(A, b) {
  const n = A.length;
  const aug = A.map((row, i) => [...row.map(v => v), b[i]]);
  const steps = [`Sistema de ${n}×${n}. Método: Eliminación de Gauss.`];
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Partial pivoting
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k;
    }
    if (maxRow !== i) {
      [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
      steps.push(`Pivoteo: F${i+1} ↔ F${maxRow+1}`);
    }
    if (Math.abs(aug[i][i]) < 1e-10) return { error: 'El sistema no tiene solución única (pivote cero).', steps };
    
    for (let k = i + 1; k < n; k++) {
      const factor = aug[k][i] / aug[i][i];
      steps.push(`F${k+1} = F${k+1} - (${factor.toFixed(4)})·F${i+1}`);
      for (let j = i; j <= n; j++) aug[k][j] -= factor * aug[i][j];
    }
  }
  
  // Back substitution
  const x = Array(n).fill(0);
  steps.push(`\n**Sustitución regresiva:**`);
  for (let i = n - 1; i >= 0; i--) {
    let sum = aug[i][n];
    const terms = [];
    for (let j = i + 1; j < n; j++) {
      sum -= aug[i][j] * x[j];
      terms.push(`(${aug[i][j].toFixed(4)})(${x[j].toFixed(4)})`);
    }
    x[i] = sum / aug[i][i];
    steps.push(`x${i+1} = (${aug[i][n].toFixed(4)}${terms.length ? ' - ' + terms.join(' - ') : ''}) / ${aug[i][i].toFixed(4)} = ${x[i].toFixed(6)}`);
  }
  return { result: x, steps };
}

export function gaussJordan(A, b) {
  const n = A.length;
  const aug = A.map((row, i) => [...row.map(v => v), b[i]]);
  const steps = [`Sistema de ${n}×${n}. Método: Gauss-Jordan.`];
  
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k;
    }
    if (maxRow !== i) {
      [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
      steps.push(`Pivoteo: F${i+1} ↔ F${maxRow+1}`);
    }
    if (Math.abs(aug[i][i]) < 1e-10) return { error: 'El sistema no tiene solución única.', steps };
    
    const pivot = aug[i][i];
    steps.push(`F${i+1} = F${i+1} / ${pivot.toFixed(4)}`);
    for (let j = 0; j <= n; j++) aug[i][j] /= pivot;
    
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = aug[k][i];
        if (Math.abs(factor) > 1e-10) {
          steps.push(`F${k+1} = F${k+1} - (${factor.toFixed(4)})·F${i+1}`);
          for (let j = 0; j <= n; j++) aug[k][j] -= factor * aug[i][j];
        }
      }
    }
  }
  
  const x = aug.map(row => parseFloat(row[n].toFixed(6)));
  steps.push(`\n**Solución:** ${x.map((v, i) => `x${i+1} = ${v}`).join(', ')}`);
  return { result: x, steps };
}

export function luDecomposition(A, b) {
  const n = A.length;
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
  const U = A.map(row => [...row]);
  const steps = [`Descomposición LU: A = L·U`];
  
  for (let i = 0; i < n; i++) {
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(U[i][i]) < 1e-10) return { error: 'Pivote cero encontrado. Se requiere pivoteo.', steps };
      const factor = U[k][i] / U[i][i];
      L[k][i] = factor;
      steps.push(`L[${k+1}][${i+1}] = ${factor.toFixed(4)}`);
      for (let j = i; j < n; j++) U[k][j] -= factor * U[i][j];
    }
  }
  
  // Solve Ly = b
  const y = Array(n).fill(0);
  steps.push(`\n**Sustitución progresiva (Ly = b):**`);
  for (let i = 0; i < n; i++) {
    let sum = b[i];
    for (let j = 0; j < i; j++) sum -= L[i][j] * y[j];
    y[i] = sum / L[i][i];
    steps.push(`y${i+1} = ${y[i].toFixed(6)}`);
  }
  
  // Solve Ux = y
  const x = Array(n).fill(0);
  steps.push(`\n**Sustitución regresiva (Ux = y):**`);
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i];
    for (let j = i + 1; j < n; j++) sum -= U[i][j] * x[j];
    x[i] = sum / U[i][i];
    steps.push(`x${i+1} = ${x[i].toFixed(6)}`);
  }
  
  return { result: x, L: L.map(r => r.map(v => parseFloat(v.toFixed(4)))), U: U.map(r => r.map(v => parseFloat(v.toFixed(4)))), steps };
}

export function jacobi(A, b, x0, tol, maxIter) {
  const n = A.length;
  let x = [...x0];
  const steps = [];
  
  for (let iter = 1; iter <= maxIter; iter++) {
    const xNew = Array(n).fill(0);
    const procedure = [`**Iteración ${iter}**`];
    
    for (let i = 0; i < n; i++) {
      let sum = b[i];
      const terms = [];
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          sum -= A[i][j] * x[j];
          terms.push(`(${A[i][j]})(${x[j].toFixed(6)})`);
        }
      }
      xNew[i] = sum / A[i][i];
      procedure.push(`x${i+1} = (${b[i]} - ${terms.join(' - ')}) / ${A[i][i]} = ${xNew[i].toFixed(6)}`);
    }
    
    const error = Math.max(...xNew.map((v, i) => Math.abs(v - x[i])));
    procedure.push(`Error máximo = ${error.toFixed(8)}`);
    steps.push({ i: iter, x: xNew.map(v => parseFloat(v.toFixed(6))), error, procedure });
    
    if (error < tol) return { result: xNew, steps, iterations: iter };
    x = [...xNew];
  }
  return { result: x, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}

export function gaussSeidel(A, b, x0, tol, maxIter) {
  const n = A.length;
  let x = [...x0];
  const steps = [];
  
  for (let iter = 1; iter <= maxIter; iter++) {
    const xOld = [...x];
    const procedure = [`**Iteración ${iter}**`];
    
    for (let i = 0; i < n; i++) {
      let sum = b[i];
      for (let j = 0; j < n; j++) {
        if (j !== i) sum -= A[i][j] * x[j];
      }
      x[i] = sum / A[i][i];
      procedure.push(`x${i+1} = ${x[i].toFixed(6)}`);
    }
    
    const error = Math.max(...x.map((v, i) => Math.abs(v - xOld[i])));
    procedure.push(`Error máximo = ${error.toFixed(8)}`);
    steps.push({ i: iter, x: x.map(v => parseFloat(v.toFixed(6))), error, procedure });
    
    if (error < tol) return { result: [...x], steps, iterations: iter };
  }
  return { result: x, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}