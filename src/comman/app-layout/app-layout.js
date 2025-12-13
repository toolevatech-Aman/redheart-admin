import React from "react";
import Header from "../app-header/app-header";
// import Footer from "../footer/footer";

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout min-h-screen flex flex-col">
      <Header /> 
      <main className="flex-1 w-full">{children}</main>
      {/* <Footer /> */}
    </div>
  );
};

export default AppLayout;