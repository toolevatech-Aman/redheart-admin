import React, { useState } from "react";
import logo from "../../assets/redHeartLogoo.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("products");
    const [showDropdown, setShowDropdown] = useState(false);
    let hoverTimeout;

    const handleMouseEnter = () => {
        hoverTimeout = setTimeout(() => {
            setShowDropdown(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeout);
        setShowDropdown(false);
    };

    // Logout function
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");

    };

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        {/* <img className="h-10 w-10 object-contain" src={logo} alt="Logo" /> */}
                        <span className="text-xl font-bold text-red-600">Red Heart Admin</span>
                    </div>


                    {/* Desktop Menu */}
                    <nav className="hidden md:flex space-x-4 items-center">
                        {/* Products Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "products" ? "text-red-600" : "text-gray-700"
                                    }`}
                                onClick={() => navigate("/home")}
                            >
                                Home
                            </button>
                               <button
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "products" ? "text-red-600" : "text-gray-700"
                                    }`}
                                onClick={() => navigate("/imageUpload")}
                            >
                                Image Upload
                            </button>
                            <button
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "products" ? "text-red-600" : "text-gray-700"
                                    }`}
                                onClick={() => navigate("/addProduct")}
                            >
                                Add Products
                            </button>
                              <button
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "products" ? "text-red-600" : "text-gray-700"
                                    }`}
                                onClick={() => navigate("/editProduct")}
                            >
                                Edit Products
                            </button>
                            <button
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "products" ? "text-red-600" : "text-gray-700"
                                    }`}
                                onClick={() => setActiveTab("products")}
                            >
                                Edit Products
                            </button>
                            <button
                                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "products" ? "text-red-600" : "text-gray-700"
                                    }`}
                                onClick={() => navigate("/deleteProduct")}
                            >
                                Delete Products
                            </button>

                        </div>

                        {/* Orders Tab */}
                        <button
                            className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "orders" ? "text-red-600" : "text-gray-700"
                                }`}
                            onClick={() => setActiveTab("orders")}
                        >
                            Orders
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-100"
                        >
                            Logout
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-gray-700 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                        >
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                {menuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {/* Products with sub-menu */}
                        <div>
                            <button
                                onClick={() => {
                                    setActiveTab(activeTab === "products" ? "" : "products");
                                    navigate("/addProduct")
                                }
                                }
                                className="w-full text-left px-3 py-2 rounded-md text-gray-700 font-medium hover:bg-red-100"
                            >
                                Products
                            </button>
                            {activeTab === "products" && (
                                <div className="pl-4">
                                    <button className="block w-full text-left px-3 py-1 text-gray-600 hover:bg-red-100 rounded-md" onClick={() => navigate("/addProduct")}>
                                        Add Product
                                    </button>
                                    <button className="block w-full text-left px-3 py-1 text-gray-600 hover:bg-red-100 rounded-md"  onClick={() => navigate("/editProduct")}>
                                        Edit Product
                                    </button>
                                    <button className="block w-full text-left px-3 py-1 text-gray-600 hover:bg-red-100 rounded-md"     onClick={() => navigate("/deleteProduct")}>
                                        Delete Product
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Orders Tab */}
                        <button className="w-full text-left px-3 py-2 rounded-md text-gray-700 font-medium hover:bg-red-100" >
                            Orders
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 rounded-md text-gray-700 font-medium hover:text-red-600 hover:bg-red-100"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
