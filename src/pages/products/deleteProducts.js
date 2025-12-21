import React, { useEffect, useState } from "react";
import { deleteProductById, fetchProducts } from "../../service/addProduct";

const DeleteProducts = () => {
  const [productData, setProductData] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [loading, setLoading] = useState(false); // loading state
  const [currentPage, setCurrentPage] = useState(1); // pagination state
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products whenever searchField or currentPage changes
  useEffect(() => {
    displayFilteredProducts();
  }, [searchField, currentPage]);

  const displayFilteredProducts = async () => {
    setLoading(true); // start loading
    const filters = {
      searchField: searchField || "", // dynamic search
      color: "",
      subcategory_name: "",
      category_name: "",
      festival_tags: "",
      occasion_tags: "",
      type: "",
      page: currentPage,
      limit: 10, // items per page
    };

    try {
      const response = await fetchProducts(filters);
      setProductData(response.products);
      setTotalPages(response.totalPages || 1); // update total pages
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProductById(productId);
      setProductData(productData.filter((p) => p._id !== productId));
      console.log("Deleted product:", productId);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      displayFilteredProducts();
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Delete Products</h1>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search product..."
          value={searchField}
          onChange={(e) => {
            setCurrentPage(1); // reset to first page on search
            setSearchField(e.target.value);
          }}
          className="border p-2 rounded w-full md:w-1/2"
        />
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productData.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg p-4 shadow hover:shadow-lg transition relative"
              >
                {/* Delete Icon */}
                <button
                  onClick={() => handleDelete(product.product_id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Delete Product"
                >
                  🗑️
                </button>

                {/* Product Images */}
                <img
                  src={product.media.primary_image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <div className="flex space-x-2 mb-2">
                  {product.media.gallery_images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>

                {/* Product Details */}
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-500">{product.short_summary}</p>
                <p className="text-sm mt-1">{product.description}</p>

                <div className="mt-2 flex justify-between items-center">
                  <span className="text-gray-600">SKU: {product.sku}</span>
                  <span className="text-green-600 font-bold">
                    Rs{product.selling_price}{" "}
                    <span className="line-through text-gray-400">
                      Rs{product.original_price}
                    </span>
                  </span>
                </div>

                <div className="mt-2 text-gray-600">Quantity: {product.quantity}</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DeleteProducts;
