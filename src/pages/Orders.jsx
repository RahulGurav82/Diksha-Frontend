import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await axios.get(`${apiUrl}/api/order/orders`);
        
        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError('Error fetching orders: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'CASH ON DELIVERY':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Print Invoice function
  const handlePrintInvoice = (order) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate invoice content with HTML
    const invoiceContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${order.orderId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
          }
          .invoice-title {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 18px;
            margin-bottom: 5px;
          }
          .invoice-details, .customer-details {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f8f8f8;
          }
          .total-row {
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #777;
            font-size: 14px;
          }
          @media print {
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="invoice-title">INVOICE</div>
          <div class="company-name">Your Company Name</div>
          <div>123 Business Street, City, Country</div>
        </div>
        
        <div class="invoice-details">
          <strong>Invoice #:</strong> ${order.orderId}<br>
          <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
          <strong>Payment Status:</strong> ${order.payment_status}<br>
          ${order.paymentId ? `<strong>Payment ID:</strong> ${order.paymentId}<br>` : ''}
        </div>
        
        <div class="customer-details">
          <strong>Customer Information:</strong><br>
          ${order.delivery_address ? `
            ${order.delivery_address.address_line}<br>
            ${order.delivery_address.city}, ${order.delivery_address.state} ${order.delivery_address.pincode}<br>
            ${order.delivery_address.country}<br>
            Phone: ${order.delivery_address.mobile}
          ` : 'No delivery address provided'}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.product_details.name}</td>
              <td>₹${order.subTotalAmt}</td>
              <td>1</td>
              <td>₹${order.subTotalAmt}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Subtotal</strong></td>
              <td>₹${order.subTotalAmt}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Tax/Shipping</strong></td>
              <td>₹${(order.totalAmt - order.subTotalAmt).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;"><strong>Total</strong></td>
              <td>₹${order.totalAmt}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          Thank you for your business!
        </div>
        
        <div class="print-button" style="text-align: center; margin-top: 40px;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #4F46E5; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Invoice
          </button>
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the new window and print
    printWindow.document.open();
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.onload = function() {
      // Auto print once content is loaded
      printWindow.setTimeout(function() {
        printWindow.focus();
        printWindow.print();
      }, 500);
    };
  };

  // Cancel Order function
  const handleCancelOrder = async (orderId) => {
    setCancellingOrder(orderId);
    setShowConfirmModal(true);
  };

  const confirmCancelOrder = async () => {
    try {
      setShowConfirmModal(false);
      
      // Show loading indicator on the button
      const updatedOrders = orders.map(order => {
        if (order._id === cancellingOrder) {
          return { ...order, isProcessing: true };
        }
        return order;
      });
      setOrders(updatedOrders);
      
      // Make API call to cancel the order
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.put(`${apiUrl}/api/order/orders/cancel/${cancellingOrder}`);
      
      if (response.data.success) {
        // Update the local state with the cancelled order
        const newOrders = orders.map(order => {
          if (order._id === cancellingOrder) {
            return { 
              ...order, 
              payment_status: 'CANCELLED',
              isProcessing: false 
            };
          }
          return order;
        });
        setOrders(newOrders);
      } else {
        throw new Error(response.data.message || 'Failed to cancel order');
      }
    } catch (err) {
      // Show error and reset processing state
      setError('Error cancelling order: ' + err.message);
      const updatedOrders = orders.map(order => {
        if (order._id === cancellingOrder) {
          return { ...order, isProcessing: false };
        }
        return order;
      });
      setOrders(updatedOrders);
    } finally {
      setCancellingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Export Orders
          </button>
          <select className="px-4 py-2 border rounded bg-white">
            <option value="">Filter by Status</option>
            <option value="PAID">Paid</option>
            <option value="CASH ON DELIVERY">Cash on Delivery</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                      <div className="text-sm text-gray-500">User ID: {order.userId.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {order.product_details.image && order.product_details.image[0] && (
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={order.product_details.image[0]} 
                              alt={order.product_details.name} 
                            />
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {order.product_details.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{order.totalAmt}</div>
                      <div className="text-xs text-gray-500">Subtotal: ₹{order.subTotalAmt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => toggleOrderDetails(order._id)} 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Update Status
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-gray-700 mb-2">Order Information</h3>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-sm"><span className="font-medium">Order ID:</span> {order.orderId}</p>
                              <p className="text-sm"><span className="font-medium">Product ID:</span> {order.productId}</p>
                              <p className="text-sm"><span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleString()}</p>
                              <p className="text-sm"><span className="font-medium">Updated:</span> {new Date(order.updatedAt).toLocaleString()}</p>
                              {order.paymentId && (
                                <p className="text-sm"><span className="font-medium">Payment ID:</span> {order.paymentId}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-700 mb-2">Delivery Address</h3>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              {order.delivery_address ? (
                                <div>
                                  <p className="text-sm"><span className="font-medium">Address:</span> {order.delivery_address.address_line}</p>
                                  <p className="text-sm"><span className="font-medium">City:</span> {order.delivery_address.city}</p>
                                  <p className="text-sm"><span className="font-medium">State:</span> {order.delivery_address.state}</p>
                                  <p className="text-sm"><span className="font-medium">Pincode:</span> {order.delivery_address.pincode}</p>
                                  <p className="text-sm"><span className="font-medium">Country:</span> {order.delivery_address.country}</p>
                                  <p className="text-sm"><span className="font-medium">Phone:</span> {order.delivery_address.mobile}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No delivery address provided</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => handlePrintInvoice(order)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition mr-2"
                          >
                            Print Invoice
                          </button>
                          <button 
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={order.payment_status === 'CANCELLED' || order.isProcessing}
                            className={`px-4 py-2 rounded transition ${
                              order.payment_status === 'CANCELLED' 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : order.isProcessing
                                  ? 'bg-gray-500 text-white cursor-wait'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            {order.isProcessing ? 'Processing...' : 'Cancel Order'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{orders.length}</span> orders
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    &laquo; Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    1
                  </button>
                  <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                    Next &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancel Order */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Cancellation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                No, Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;