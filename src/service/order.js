import { Get, Patch } from "./axiosService";

/**
 * Utility to build query string from filters
 */
const buildQueryString = (params) => {
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  }
  return query.toString();
};

/**
 * --------------------
 * Admin Order APIs
 * --------------------
 */

/**
 * Fetch all orders (admin only)
 * @param {Object} filters - optional filters like status, userId, date range
 */
export const fetchAllOrdersAdmin = async (filters = {}) => {
  try {
    const queryString = buildQueryString(filters);
    const response = await Get(`/orders${queryString ? `?${queryString}` : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders (admin):", error);
    return [];
  }
};

/**
 * Update order status (admin only)
 * @param {string} orderId - ID of the order
 * @param {string} status - new status (e.g., "pending", "shipped", "delivered")
 */
export const updateOrderStatusAdmin = async (orderId, status) => {
  try {
    const response = await Patch(`/orders/admin/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating order status (admin):", error);
    return null;
  }
};
