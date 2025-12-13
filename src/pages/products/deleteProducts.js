import React, { useEffect, useState } from "react";
import { deleteProductById, fetchProducts } from "../../service/addProduct";

const DeleteProducts = () => {
  const [productData, setProductData] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [loading, setLoading] = useState(false); // loading state

  // Fetch products whenever searchField changes
  useEffect(() => {
  

    displayFilteredProducts();
  }, [searchField]);
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
      };

      try {
        const products = await fetchProducts(filters);
        setProductData(products); // update state with fetched products
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false); // stop loading
      }
    };
  const handleDelete = async (productId) => {
    try {
      // Replace this with your actual delete API call
      // await Post(`/products/delete/${productId}`);
      await deleteProductById(productId);
      setProductData(productData.filter((p) => p._id !== productId));
      console.log("Deleted product:", productId);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
    finally{
        displayFilteredProducts()

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
          onChange={(e) => setSearchField(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default DeleteProducts;
