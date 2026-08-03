import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./comman/app-layout/app-layout";
import AdminPageContentEditor from "./pages/pageContent/pageContent";
import OrderPage from "./pages/orders/order";
import UsersPage from "./pages/users/UsersPage";
import SurpriseOrdersPage from "./pages/surpriseOrders/SurpriseOrdersPage";
import ShayariReviewPage from "./pages/shayariReview/ShayariReviewPage";
import SubscribersPage from "./pages/subscribers/SubscribersPage";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import VendorsPage from "./pages/vendors/VendorsPage";
import VendorProfilePage from "./pages/vendors/VendorProfilePage";
import CouponsPage from "./pages/coupons/CouponsPage";

// ── Existing pages ────────────────────────────────────────────────────────────
const Home            = lazy(() => import("./pages/home/home"));
const Login           = lazy(() => import("./pages/login/login"));
const AddProduct      = lazy(() => import("./pages/products/addProducts"));
const EditProduct     = lazy(() => import("./pages/products/editProducts"));
const DeleteProducts  = lazy(() => import("./pages/products/deleteProducts"));
const ImageUpload     = lazy(() => import("./pages/image-upload/image-upload"));
const AddonUpload     = lazy(() => import("./pages/products/addonUpload"));
const QuestionsPage   = lazy(() => import("./pages/questions/QuestionsPage"));
const CityPageManager          = lazy(() => import("./pages/cityPage/CityPageManager"));
const CategorySeoManager       = lazy(() => import("./pages/categoryPage/CategorySeoManager"));
const CategoryConfigManager    = lazy(() => import("./pages/categoryConfig/CategoryConfigManager"));

// ── Bulk Upload ───────────────────────────────────────────────────────────────
const FlowersUpload   = lazy(() => import("./pages/products/upload/FlowersUpload"));
const CakesUpload     = lazy(() => import("./pages/products/upload/CakesUpload"));
const PlantsUpload    = lazy(() => import("./pages/products/upload/PlantsUpload"));

// ── Bulk Edit ─────────────────────────────────────────────────────────────────
const FlowersEdit     = lazy(() => import("./pages/products/edit/FlowersEdit"));
const CakesEdit       = lazy(() => import("./pages/products/edit/CakesEdit"));
const PlantsEdit      = lazy(() => import("./pages/products/edit/PlantsEdit"));

// ── Bulk Export ───────────────────────────────────────────────────────────────
const FlowersExport   = lazy(() => import("./pages/products/export/FlowersExport"));
const CakesExport     = lazy(() => import("./pages/products/export/CakesExport"));
const PlantsExport    = lazy(() => import("./pages/products/export/PlantsExport"));

const fallback = (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center space-y-2">
      <div className="text-red-600 text-2xl font-bold">RedHeart Admin</div>
      <div className="text-gray-400 text-sm">Loading…</div>
    </div>
  </div>
);

const Router = () => {
  const authToken = localStorage.getItem("authToken");

  const routes = [
    // ── Public ──
    { path: "/login",  element: <Login />,                      protected: false },
    // ── Existing ──
    { path: "/",              element: <Home />,                protected: true },
    { path: "/home",          element: <Home />,                protected: true },
    { path: "/addProduct",    element: <AddProduct />,          protected: true },
    { path: "/deleteProduct", element: <DeleteProducts />,      protected: true },
    { path: "/imageUpload",   element: <ImageUpload />,         protected: true },
    { path: "/editProduct",   element: <EditProduct />,         protected: true },
    { path: "/addonUpload",   element: <AddonUpload />,         protected: true },
    { path: "/pageContent",   element: <AdminPageContentEditor />, protected: true },
    { path: "/questions",     element: <QuestionsPage />,       protected: true },
    { path: "/city-pages",      element: <CityPageManager />,    protected: true },
    { path: "/category-pages",   element: <CategorySeoManager />,    protected: true },
    { path: "/category-config",  element: <CategoryConfigManager />, protected: true },
    { path: "/orders",        element: <OrderPage />,           protected: true },
    { path: "/users",         element: <UsersPage />,           protected: true },
    { path: "/surprise-orders", element: <SurpriseOrdersPage />, protected: true },
    { path: "/shayari-review",  element: <ShayariReviewPage />,  protected: true },
    { path: "/subscribers",     element: <SubscribersPage />,    protected: true },
    { path: "/analytics",       element: <AnalyticsDashboard />, protected: true },
    { path: "/vendors",         element: <VendorsPage />,        protected: true },
    { path: "/vendors/:id",     element: <VendorProfilePage />,  protected: true },
    { path: "/coupons",         element: <CouponsPage />,        protected: true },
    // ── Bulk Upload ──
    { path: "/upload/flowers", element: <FlowersUpload />, protected: true },
    { path: "/upload/cakes",   element: <CakesUpload />,   protected: true },
    { path: "/upload/plants",  element: <PlantsUpload />,  protected: true },
    // ── Bulk Edit ──
    { path: "/edit/flowers",   element: <FlowersEdit />,   protected: true },
    { path: "/edit/cakes",     element: <CakesEdit />,     protected: true },
    { path: "/edit/plants",    element: <PlantsEdit />,    protected: true },
    // ── Bulk Export ──
    { path: "/export/flowers", element: <FlowersExport />, protected: true },
    { path: "/export/cakes",   element: <CakesExport />,   protected: true },
    { path: "/export/plants",  element: <PlantsExport />,  protected: true },
  ];

  return (
    <Suspense fallback={fallback}>
      <Routes>
        {routes.map(({ path, element, protected: isProtected }, index) => {
          if (isProtected) {
            if (!authToken) return <Route key={index} path={path} element={<Navigate to="/login" replace />} />;
            return <Route key={index} path={path} element={<AppLayout>{element}</AppLayout>} />;
          }
          return <Route key={index} path={path} element={element} />;
        })}
      </Routes>
    </Suspense>
  );
};

export default Router;
