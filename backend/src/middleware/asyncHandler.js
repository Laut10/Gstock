// Wrapper para que los handlers async puedan lanzar errores
// y que se capturen en el errorHandler sin try/catch en cada ruta.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
