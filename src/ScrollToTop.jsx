import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ children }) => {
    const location = useLocation();
    
    useEffect(() => {
     
      const scrollToTop = () => {
        
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.scrollTop = 0;
        }
      };

      scrollToTop();

      setTimeout(scrollToTop, 0);
      setTimeout(scrollToTop, 10);
      setTimeout(scrollToTop, 50);
    }, [location.pathname]);

    return children;
  };

export default ScrollToTop;