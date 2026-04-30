import { useEffect, useState } from 'react';
import { productsApi } from '../api/endpoints.js';
import { Button, Input, Badge, Card, PageHeader, EmptyState, Modal } from '../components/ui.jsx';

const emptyForm = {
  name: '', brand: '', category: '', barcode: '', price: '', minQuantity: 5,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [error, setError]       = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async (q = '') => {
    try {
      setLoading(true);
      setProducts(await productsApi.list(q));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Búsqueda con debounce.
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, brand: p.brand, category: p.category,
      barcode: p.barcode, price: p.price,
      minQuantity: p.stock?.minQuantity ?? 5,
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
        barcode: form.barcode.trim(),
        price: Number(form.price),
      };
      if (editing) {
        await productsApi.update(editing.id, payload);
      } else {
        await productsApi.create({ ...payload, minQuantity: Number(form.minQuantity) });
      }
      setModalOpen(false);
      await load(search);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción borrará también su stock y movimientos.`)) return;
    try {
      await productsApi.remove(p.id);
      await load(search);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="ABM de medicamentos y artículos de farmacia"
        action={<Button onClick={openCreate}>+ Nuevo producto</Button>}
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Buscar por nombre, marca o código de barras…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <EmptyState message="Cargando productos…" />
        ) : products.length === 0 ? (
          <EmptyState message="No hay productos cargados todavía." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.brand}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.barcode}</td>
                  <td className="px-4 py-3 text-right">${p.price.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right">
                    {p.stock?.quantity ?? 0}
                    {p.isLowStock && <span className="ml-2"><Badge tone="red">Bajo</Badge></span>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button variant="ghost" onClick={() => openEdit(p)}>Editar</Button>
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => remove(p)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Editar producto #${editing.id}` : 'Nuevo producto'}
      >
        <form onSubmit={submit} className="space-y-3">
          <Field label="Nombre">
            <Input required value={form.name}     onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca">
              <Input required value={form.brand}    onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
            <Field label="Categoría">
              <Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
          </div>
          <Field label="Código de barras">
            <Input required value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio">
              <Input type="number" step="0.01" min="0" required
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            {!editing && (
              <Field label="Stock mínimo">
                <Input type="number" min="0" required
                  value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} />
              </Field>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear producto'}
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
