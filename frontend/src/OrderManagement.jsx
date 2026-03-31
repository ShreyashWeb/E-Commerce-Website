import { useEffect, useState } from 'react'
import {
  getOrders,
  updateOrderStatus,
  cancelOrder,
  placeOrder,
  getCategories,
} from './api'
import './OrderManagement.css'

function OrderManagement({ onNavigate }) {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [orderItems, setOrderItems] = useState([])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchOrderData = async (filter = 'all') => {
    try {
      setLoading(true)
      const params = filter === 'all' ? {} : { order_status: filter }
      const response = await getOrders(params)
      setOrders(response.data)
      setStats(response.stats)
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderData()
  }, [])

  const handleStatusUpdate = async (orderId, newStatus) => {
    clearMessages()

    try {
      await updateOrderStatus(orderId, { order_status: newStatus })
      setSuccess(`Order status updated to "${newStatus}" successfully.`)
      fetchOrderData(statusFilter)
      setShowDetailModal(false)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to update order status.')
    }
  }

  const handleCancelOrder = async (orderId) => {
    clearMessages()

    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return
    }

    try {
      await cancelOrder(orderId)
      setSuccess('Order cancelled successfully.')
      fetchOrderData(statusFilter)
      setShowDetailModal(false)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to cancel order.')
    }
  }

  const openOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedOrder(null)
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    }
    return statusMap[status] || 'status-default'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project - Module 2</p>
        <nav>
          <button
            className="nav-item active"
            onClick={() => onNavigate?.('orders')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 2: Orders
          </button>
          <button
            className="nav-item"
            onClick={() => onNavigate?.('categories')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 1: Categories
          </button>
          <button
            className="nav-item"
            onClick={() => onNavigate?.('customers')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 3: Customers
          </button>
          <button
            className="nav-item"
            onClick={() => onNavigate?.('payments')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 4: Payments
          </button>
          <button
            className="nav-item"
            onClick={() => onNavigate?.('carts')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 5: Cart
          </button>
          <button
            className="nav-item"
            onClick={() => onNavigate?.('wishlists')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 6: Wishlist
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header-card">
          <div>
            <p className="eyebrow">Module 2</p>
            <h2>Order Management Dashboard</h2>
            <p className="subtitle">
              View, manage, and track customer orders with real-time status updates and cancellation support.
            </p>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Total Orders</span>
              <strong>{stats.total}</strong>
            </article>
            <article className="stat-card">
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </article>
            <article className="stat-card">
              <span>Shipped</span>
              <strong>{stats.shipped}</strong>
            </article>
            <article className="stat-card">
              <span>Delivered</span>
              <strong>{stats.delivered}</strong>
            </article>
          </div>
        </header>

        <section className="content-grid">
          <article className="card table-card full-width">
            <div className="table-toolbar">
              <h3>Order Dashboard</h3>
              <div className="filter-group">
                <label htmlFor="status-filter">Filter by Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => {
                    const nextFilter = event.target.value
                    setStatusFilter(nextFilter)
                    fetchOrderData(nextFilter)
                  }}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            {error ? <p className="message error">{error}</p> : null}
            {success ? <p className="message success">{success}</p> : null}

            {loading ? (
              <p className="message">Loading orders...</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Total Amount</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center">
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.order_id}>
                          <td>#{order.order_id}</td>
                          <td>{order.full_name}</td>
                          <td>{order.email}</td>
                          <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                          <td>{order.item_count}</td>
                          <td>
                            <span className={`status-pill ${getStatusBadgeClass(order.order_status)}`}>
                              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                            </span>
                          </td>
                          <td className="date-cell">{formatDate(order.created_at)}</td>
                          <td className="action-cell">
                            <button
                              className="btn btn-inline"
                              onClick={() => openOrderDetails(order)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>

        {showDetailModal && selectedOrder ? (
          <div className="modal-overlay" onClick={closeDetailModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Order Details - #{selectedOrder.order_id}</h3>
                <button className="close-btn" onClick={closeDetailModal}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <section className="detail-section">
                  <h4>Order Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Order ID:</span>
                      <span className="value">#{selectedOrder.order_id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Customer:</span>
                      <span className="value">{selectedOrder.full_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedOrder.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className={`status-pill ${getStatusBadgeClass(selectedOrder.order_status)}`}>
                        {selectedOrder.order_status.charAt(0).toUpperCase() + selectedOrder.order_status.slice(1)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Amount:</span>
                      <span className="value">${parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Placed:</span>
                      <span className="value">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                  </div>
                </section>

                <section className="detail-section">
                  <h4>Order Items</h4>
                  <div className="items-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.item_count > 0 ? (
                          Array.from({ length: selectedOrder.item_count }).map((_, index) => (
                            <tr key={index}>
                              <td>Product Item {index + 1}</td>
                              <td>1</td>
                              <td>-</td>
                              <td>-</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4}>No items in this order</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="detail-section">
                  <h4>Status Management</h4>
                  <div className="status-actions">
                    {selectedOrder.order_status === 'pending' && (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleStatusUpdate(selectedOrder.order_id, 'shipped')}
                        >
                          Mark as Shipped
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancelOrder(selectedOrder.order_id)}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {selectedOrder.order_status === 'shipped' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusUpdate(selectedOrder.order_id, 'delivered')}
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {selectedOrder.order_status === 'delivered' && (
                      <p className="info-text">This order has been delivered.</p>
                    )}
                    {selectedOrder.order_status === 'cancelled' && (
                      <p className="info-text">This order has been cancelled.</p>
                    )}
                  </div>
                </section>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeDetailModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default OrderManagement
