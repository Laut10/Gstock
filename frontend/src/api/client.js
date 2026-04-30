// Cliente HTTP minimalista — wrapper de fetch.
// Centralizado para que todas las llamadas pasen por el mismo lugar
// (manejo de errores uniforme, fácil de cambiar a axios/swr si quisiéramos).

const handle = async (res) => {
  if (res.ok) {
    if (res.status === 204) return null;
    return res.json();
  }
  let body;
  try { body = await res.json(); } catch { body = { message: res.statusText }; }
  const err = new Error(body.message || 'Error en la API');
  err.status = res.status;
  err.body   = body;
  throw err;
};

const json = (method) => async (path, data) =>
  handle(await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  }));

export const api = {
  get:    (path) => fetch(path).then(handle),
  post:   json('POST'),
  patch:  json('PATCH'),
  delete: (path) => fetch(path, { method: 'DELETE' }).then(handle),
};
