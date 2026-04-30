import { useEffect, useState } from 'react';
import { stockApi } from '../api/endpoints.js';
import { Badge, Card, PageHeader, EmptyState, Button, Input, Modal } from '../components/ui.jsx';

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [error, setError] = useState(null);

  const [editingMin, setEditingMin] = useState(null);
  const [minValue, setMinValue]     = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      const data = showLowOnly ? await stockApi.low() : await stockApi.list();
      setStocks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [showLowOnly]);

  const lowCount = stocks.filter((s) => s.isLowStock).length;

  const saveMin = async (e) => {
    e.preventDefault();
    try {
      await stockApi.setMin(editingMin.productId, Number(minValue));
      setEditingMin(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Stock"
        subtitle="Cantidades disponibles y alertas de stock bajo"
        action={
          <Button
            variant={showLowOnly ? 'primary' : 'secondary'}
            onClick={() => setShowLowOnly((v) => !v)}
          >
            {showLowOnly ? 'Ver todo' : `Solo stock bajo${!loading && lowCount ? ` (${lowCount})` : ''}`}
          </Button>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <EmptyState message="Cargando stock…" />
        ) : stocks.length === 0 ? (
          <EmptyState message={showLowOnly ? '✨ No hay productos con stock bajo.' : 'Sin productos cargados.'} />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-right">Mínimo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stocks.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.product.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.product.brand}</td>
                  <td className="px-4 py-3 text-right font-medium">{s.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{s.minQuantity}</td>
                  <td className="px-4 py-3">
                    {s.isLowStock
                      ? <Badge tone="red">⚠ Stock bajo</Badge>
                      : <Badge tone="green">OK</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" onClick={() => { setEditingMin(s); setMinValue(s.minQuantity); }}>
                      Cambiar mínimo
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={!!editingMin}
        onClose={() => setEditingMin(null)}
        title={`Stock mínimo · ${editingMin?.product.name ?? ''}`}
      >
        <form onSubmit={saveMin} className="space-y-3">
          <p className="text-sm text-slate-600">
            Cuando la cantidad disponible cae por debajo de este valor, el producto se marca como
            <strong> stock bajo</strong>.
          </p>
          <Input
            type="number"
            min="0"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingMin(null)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
