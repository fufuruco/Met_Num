export function addMatrices(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) return { error: 'Las matrices deben tener las mismas dimensiones.' };
  const result = A.map((row, i) => row.map((val, j) => val + B[i][j]));
  const steps = [`A + B: Se suma elemento a elemento.`, ...A.map((row, i) => row.map((val, j) => `C[${i+1}][${j+1}] = ${val} + ${B[i][j]} = ${result[i][j]}`).join(', '))];
  return { result, steps };
}

export function subtractMatrices(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) return { error: 'Las matrices deben tener las mismas dimensiones.' };
  const result = A.map((row, i) => row.map((val, j) => val - B[i][j]));
  const steps = [`A - B: Se resta elemento a elemento.`, ...A.map((row, i) => row.map((val, j) => `C[${i+1}][${j+1}] = ${val} - ${B[i][j]} = ${result[i][j]}`).join(', '))];
  return { result, steps };
}

export function multiplyMatrices(A, B) {
  if (A[0].length !== B.length) return { error: `No se pueden multiplicar: columnas de A (${A[0].length}) ≠ filas de B (${B.length}).` };
  const rows = A.length, cols = B[0].length, n = A[0].length;
  const result = Array.from({ length: rows }, () => Array(cols).fill(0));
  const steps = [`A(${rows}×${n}) × B(${n}×${cols}) = C(${rows}×${cols})`];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const terms = [];
      for (let k = 0; k < n; k++) {
        result[i][j] += A[i][k] * B[k][j];
        terms.push(`(${A[i][k]})(${B[k][j]})`);
      }
      steps.push(`C[${i+1}][${j+1}] = ${terms.join(' + ')} = ${result[i][j]}`);
    }
  }
  return { result, steps };
}

export function determinant(matrix) {
  const n = matrix.length;
  if (n !== matrix[0].length) return { error: 'La matriz debe ser cuadrada.' };
  const steps = [];
  
  if (n === 1) return { result: matrix[0][0], steps: [`det = ${matrix[0][0]}`] };
  if (n === 2) {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    steps.push(`det = (${matrix[0][0]})(${matrix[1][1]}) - (${matrix[0][1]})(${matrix[1][0]}) = ${det}`);
    return { result: det, steps };
  }
  
  // Cofactor expansion along first row
  let det = 0;
  steps.push(`Expansión por cofactores (fila 1):`);
  for (let j = 0; j < n; j++) {
    const minor = matrix.slice(1).map(row => [...row.slice(0, j), ...row.slice(j + 1)]);
    const cofactor = Math.pow(-1, j) * matrix[0][j] * determinant(minor).result;
    det += cofactor;
    steps.push(`C[1][${j+1}] = (${Math.pow(-1, j) > 0 ? '+' : '-'})(${matrix[0][j]}) × M[1][${j+1}] = ${cofactor.toFixed(4)}`);
  }
  steps.push(`det(A) = ${det.toFixed(4)}`);
  return { result: det, steps };
}

export function transpose(matrix) {
  const result = matrix[0].map((_, j) => matrix.map(row => row[j]));
  const steps = [`Transpuesta: Se intercambian filas por columnas.`, `A^T[i][j] = A[j][i]`];
  return { result, steps };
}

export function inverse(matrix) {
  const n = matrix.length;
  if (n !== matrix[0].length) return { error: 'La matriz debe ser cuadrada.' };
  
  const det = determinant(matrix).result;
  if (Math.abs(det) < 1e-10) return { error: 'La matriz es singular (determinante = 0). No tiene inversa.' };
  
  // Gauss-Jordan method
  const aug = matrix.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);
  const steps = [`det(A) = ${det.toFixed(4)} ≠ 0 → La inversa existe.`, `Método: Gauss-Jordan con matriz aumentada [A | I]`];
  
  for (let i = 0; i < n; i++) {
    // Pivot
    if (Math.abs(aug[i][i]) < 1e-10) {
      let swapped = false;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > 1e-10) {
          [aug[i], aug[k]] = [aug[k], aug[i]];
          steps.push(`Intercambio F${i+1} ↔ F${k+1}`);
          swapped = true;
          break;
        }
      }
      if (!swapped) return { error: 'No se puede encontrar la inversa.' };
    }
    
    const pivot = aug[i][i];
    steps.push(`F${i+1} = F${i+1} / ${pivot.toFixed(4)}`);
    for (let j = 0; j < 2 * n; j++) aug[i][j] /= pivot;
    
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = aug[k][i];
        if (Math.abs(factor) > 1e-10) {
          steps.push(`F${k+1} = F${k+1} - (${factor.toFixed(4)})·F${i+1}`);
          for (let j = 0; j < 2 * n; j++) aug[k][j] -= factor * aug[i][j];
        }
      }
    }
  }
  
  const result = aug.map(row => row.slice(n).map(v => parseFloat(v.toFixed(6))));
  return { result, steps };
}