import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProductsPage  from './pages/ProductsPage.jsx';
import StockPage     from './pages/StockPage.jsx';
import MovementsPage from './pages/MovementsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index             element={<ProductsPage />} />
        <Route path="stock"      element={<StockPage />} />
        <Route path="movements"  element={<MovementsPage />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
