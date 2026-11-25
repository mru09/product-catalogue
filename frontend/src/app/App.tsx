import { Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import CataloguePage from "../pages/CataloguePage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ProductDetailPage from "../pages/ProductDetailPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
