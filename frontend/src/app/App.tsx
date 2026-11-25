import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import Layout from "../components/layout/Layout";
import HomePage from "../pages/HomePage";
import CataloguePage from "../pages/CataloguePage";
import ProductPage from "../pages/ProductPage";
import LoginPage from "../pages/LoginPage";
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="catalogue" element={<CataloguePage />} />
            <Route path="products/:id" element={<ProductPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
