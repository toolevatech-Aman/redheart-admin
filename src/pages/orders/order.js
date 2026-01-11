import React, { useEffect, useState } from "react";
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from "../../service/order";

const STATUS_OPTIONS = [
  "Pending",
  "Accepted",
  "InTransit",
  "Out Of Delivery",
  "Delivered",
  "Cancelled"
];

const AdminOrdersFull = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState([]); // for accordion

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllOrdersAdmin();
      if (response.success) {
        setOrders(response.data);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await updateOrderStatusAdmin(orderId, newStatus);
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating status");
    }
    setUpdatingId(null);
    fetchOrders();
  };

  const toggleAccordion = (orderId) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Admin Orders</h2>
      {orders.length === 0 ? (
        <p style={{ textAlign: "center" }}>No orders found</p>
      ) : (
        orders.map((order) => {
          const isExpanded = expandedOrders.includes(order._id);
          return (
            <div
              key={order._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                overflowX: "auto",
                transition: "all 0.3s ease"
              }}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleAccordion(order._id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer"
                }}
              >
                <h3 style={{ margin: 0 }}>Order ID: {order.orderId}</h3>
                <span style={{ fontSize: "18px" }}>{isExpanded ? "▲" : "▼"}</span>
              </div>

              <p style={{ marginTop: "10px" }}>
                <strong>Order Status: </strong>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                  disabled={updatingId === order._id}
                  style={{ padding: "5px 10px", borderRadius: "5px" }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {updatingId === order._id && (
                  <span style={{ marginLeft: "10px" }}>Updating...</span>
                )}
              </p>

              {/* Product Table */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "15px",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <thead>
                  <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Image</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Product Name</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Variant</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Quantity</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Price</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Add-ons</th>
                  </tr>
                </thead>
                <tbody>
                  {order.cartItems.map((item) => (
                    <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>
                        <a href={item.image_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            width={60}
                            height={60}
                            style={{ objectFit: "cover", borderRadius: "5px" }}
                          />
                        </a>
                      </td>
                      <td style={{ padding: "10px" }}>{item.name}</td>
                      <td style={{ padding: "10px" }}>{item.variant_name || "-"}</td>
                      <td style={{ padding: "10px" }}>{item.quantity}</td>
                      <td style={{ padding: "10px" }}>₹{item.selling_price}</td>
                      <td style={{ padding: "10px" }}>
                        {item.add_ons && item.add_ons.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            {item.add_ons.map((add) => (
                              <div key={add._id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <a href={add.image_url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={add.image_url}
                                    alt={add.name}
                                    width={40}
                                    height={40}
                                    style={{ objectFit: "cover", borderRadius: "5px" }}
                                  />
                                </a>
                                <span>
                                  {add.name} x {add.quantity} (₹{add.selling_price})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Accordion Content */}
              {isExpanded && (
                <div style={{ marginTop: "20px", lineHeight: "1.6" }}>
                  <h4>Billing Address:</h4>
                  <p>
                    {order.billingAddress.firstName} {order.billingAddress.lastName},<br />
                    {order.billingAddress.street}, {order.billingAddress.city}, {order.billingAddress.state}, {order.billingAddress.country}<br />
                    Phone: {order.billingAddress.phone}
                  </p>

                  <h4>Shipping Address:</h4>
                  <p>
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName},<br />
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}<br />
                    Phone: {order.shippingAddress.phone}
                  </p>

                  <h4>Order Details:</h4>
                  <p>
                    <strong>Payment Mode:</strong> {order.paymentMode.toUpperCase()} <br />
                    <strong>Coupon Applied:</strong> {order.coupanApplied || "-"} <br />
                    <strong>Coupon Discount:</strong> ₹{order.coupanDiscount} <br />
                    <strong>Shipping Charges:</strong> ₹{order.shippingCharges} <br />
                    <strong>Total Product Price:</strong> ₹{order.totalProductPrice} <br />
                    <strong>Total Shipment Price:</strong> ₹{order.totalShipmentPrice} <br />
                    <strong>Total Price:</strong> ₹{order.totalPrice} <br />
                    <strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleString()} <br />
                    <strong>Delivery Slot:</strong> {order.deliverySlot} <br />
                    <strong>Order Note:</strong> {order.orderNote || "-"} <br />
                    <strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()} <br />
                    <strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminOrdersFull;
