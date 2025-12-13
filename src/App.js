
import './App.css';
import { BrowserRouter, useNavigate } from "react-router-dom";
import AxiosInterceptorProvider from './interceptors/axiosInterceptorProvider';
import Router from './router';
import ScrollToTop from "./ScrollToTop";

function AppContent() {

  return (
   <ScrollToTop>
   
        <Router />
      
    </ScrollToTop>
  );
}
function App() {
  return (

      <BrowserRouter>
        <AxiosInterceptorProvider>

          <AppContent />
   
        </AxiosInterceptorProvider>
      </BrowserRouter>

  );
}

export default App;