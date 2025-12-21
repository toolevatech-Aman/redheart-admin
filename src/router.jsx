import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./comman/app-layout/app-layout";import EditProduct from "./pages/products/editProducts";
;
// import logoImage from "./assets/yobhaLogo.png"
// Lazy load pages
const Home = lazy(() => import("./pages/home/home"));
const Login = lazy(() => import("./pages/login/login"));
const AddProduct = lazy(() => import("./pages/products/addProducts"));
const DeleteProducts = lazy(() => import("./pages/products/deleteProducts"));
// const ImageUpload = lazy(() => import("./pages/image-upload/image-upload"));
const ImageUpload = lazy(()=>import("./pages/image-upload/image-upload"))

const logoImage ="../../assets/redHeartLogoo.png"
const Router = () => {
  const routes = [
    // { path: "/", element: <Navigate to="/home" replace /> },
    { path: "/", element: <Home /> ,protected: true},
    {path: "/login", element: <Login /> ,protected: false},
    { path: "/home", element: <Home /> ,protected: true},
    {path:"/addProduct", element: <AddProduct /> ,protected: true},
    {path:"/deleteProduct",element:<DeleteProducts/>, protected:true},
    {path:"/imageUpload", element:<ImageUpload/>, protected:true},
    {path:'/editProduct',element:<EditProduct/>, protected:true}
    
  ];
  const authToken = localStorage.getItem("authToken");
  return (
    <Suspense fallback={ <div className="flex items-center justify-center h-screen">
      <img
        src={logoImage}
        alt="YOBHA Logo"
        className="h-8 md:h-10"
      />
    </div>}>
     <Routes>
        {routes.map(({ path, element, protected: isProtected }, index) => {
          if (isProtected) {
            // Redirect to login if no authToken
            if (!authToken) return <Route key={index} path={path} element={<Navigate to="/login" replace />} />;
            // Wrap protected routes in AppLayout
            return <Route key={index} path={path} element={<AppLayout>{element}</AppLayout>} />;
          }
          // Public routes (like login)
          return <Route key={index} path={path} element={element} />;
        })}
      </Routes>
    </Suspense>
  );
};

export default Router;