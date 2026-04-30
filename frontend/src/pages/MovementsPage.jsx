import { useEffect, useState } from 'react';
import { movementsApi, productsApi } from '../api/endpoints.js';
import { Badge, Card, PageHeader, EmptyState, Button, Input, Select, Modal } from '../components/ui.jsx';

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ productId: '', type: 'IN', quantity: 1 });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [movs, prods] = await Promise.all([
        movementsApi.list({ type: filterType || undefined }),
        productsApi.list(),
      ]);
      setMovements(movs);
      setProducts(prods);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await movementsApi.create({
        productId: Number(form.productId),
        type: form.type,
        quantity: Number(form.quantity),
      });
      setModalOpen(false);
      setForm({ productId: '', type: 'IN', quantity: 1 });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Movimientos"
        subtitle="Entradas y salidas de stock con auditoría completa"
        action={<Button onClick={() => setModalOpen(true)}>+ Registrar movimiento</Button>}
      />

      <div className="mb-4 max-w-xs">
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Todos los movimientos</option>
          <option value="IN">Solo entradas</option>
          <option value="OUT">Solo salidas</option>
        </Select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <EmptyState message="Cargando movimientos…" />
        ) : movements.length === 0 ? (
          <EmptyState message="No se registraron movimientos todavía." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(m.date).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{m.product.name}</td>
                  <td className="px-4 py-3">
                    {m.type === 'IN'
                      ? <Badge tone="green">↑ Entrada</Badge>
                      : <Badge tone="yellow">↓ Salida</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {m.type === 'IN' ? '+' : '−'}{m.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar movimiento">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Producto">
            <Select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">— Seleccionar —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.brand} (stock: {p.stock?.quantity ?? 0})
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="IN">Entrada (IN)</option>
                <option value="OUT">Salida (OUT)</option>
              </Select>
            </Field>
            <Field label="Cantidad">
              <Input type="number" min="1" required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Registrando…' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
