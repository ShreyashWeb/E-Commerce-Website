import { useEffect, useState } from 'react'
import {
  getShippingDashboard,
  getShippingByTrackingNumber,
  getShippingByOrderId,
  createShipping,
  updateShipping,
  calculateShippingCost,
} from './api'
import './ShippingManagement.css'

function ShippingManagement({ onNavigate }) {
  const [dashboardRows, setDashboardRows] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    shipped: 0,
    in_transit: 0,
    delivered: 0,
    total_cost: 0,
    total_shipments: 0,
  })
  const [trackingResult, setTrackingResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [statusFilter, setStatusFilter] = useState('all')

  const [trackingForm, setTrackingForm] = useState({
    tracking_number: '',
  })

  const [shippingForm, setShippingForm] = useState({
    order_id: '',
    courier_service: '',
    tracking_number: '',
    shipping_cost: '',
  })

  const [updateForm, setUpdateForm] = useState({
    shipping_id: '',
    courier_service: '',
    tracking_number: '',
    shipping_status: '',
  })

  const [costCalculator, setCostCalculator] = useState({
    order_amount: '',
    weight: 1,
    result: null,
  })

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchDashboard = async (filter = statusFilter) => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { shipping_status: filter } : {}
      const response = await getShippingDashboard(params)
      setDashboardRows(response.data)
      setDashboardStats(response.stats)
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load shipping dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard(statusFilter)
    }
  }, [activeTab, statusFilter])

  const handleTrackingChange = (event) => {
    const { name, value } = event.target
    setTrackingForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleTrackShipment = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!trackingForm.tracking_number.trim()) {
      setError('Please enter a tracking number.')
      return
    }

    try {
      const response = await getShippingByTrackingNumber(trackingForm.tracking_number)
      setTrackingResult(response.data)
      setSuccess('Shipment found!')
    } catch (apiError) {
      setTrackingResult(null)
      setError(apiError?.response?.data?.message || 'Shipment not found.')
    }
  }

  const handleShippingFormChange = (event) => {
    const { name, value } = event.target
    setShippingForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleCreateShipping = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!shippingForm.order_id) {
      setError('Order ID is required.')
      return
    }

    try {
      const payload = {
        order_id: Number(shippingForm.order_id),
      }

      if (shippingForm.courier_service) payload.courier_service = shippingForm.courier_service
      if (shippingForm.tracking_number) payload.tracking_number = shippingForm.tracking_number
      if (shippingForm.shipping_cost) payload.shipping_cost = parseFloat(shippingForm.shipping_cost)

      await createShipping(payload)
      setSuccess('Shipping record created successfully.')
      setShippingForm({ order_id: '', courier_service: '', tracking_number: '', shipping_cost: '' })
      await fetchDashboard(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to create shipping record.')
    }
  }

  const handleUpdateFormChange = (event) => {
    const { name, value } = event.target
    setUpdateForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleUpdateShipping = async (row) => {
    clearMessages()
    setUpdateForm({
      shipping_id: row.shipping_id,
      courier_service: row.courier_service,
      tracking_number: row.tracking_number,
      shipping_status: row.shipping_status,
    })
  }

  const handleSubmitUpdate = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!updateForm.shipping_id) {
      setError('Shipping ID is required.')
      return
    }

    try {
      const payload = {}
      if (updateForm.courier_service) payload.courier_service = updateForm.courier_service
      if (updateForm.tracking_number) payload.tracking_number = updateForm.tracking_number
      if (updateForm.shipping_status) payload.shipping_status = updateForm.shipping_status

      await updateShipping(updateForm.shipping_id, payload)
      setSuccess('Shipping information updated successfully.')
      setUpdateForm({ shipping_id: '', courier_service: '', tracking_number: '', shipping_status: '' })
      await fetchDashboard(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to update shipping.')
    }
  }

  const handleCostCalculatorChange = (event) => {
    const { name, value } = event.target
    setCostCalculator((previous) => ({ ...previous, [name]: value }))
  }

  const handleCalculateCost = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!costCalculator.order_amount || parseFloat(costCalculator.order_amount) <= 0) {
      setError('Please enter a valid order amount.')
      return
    }

    try {
      const response = await calculateShippingCost(
        parseFloat(costCalculator.order_amount),
        parseFloat(costCalculator.weight),
      )
      setCostCalculator((previous) => ({ ...previous, result: response.data }))
      setSuccess('Shipping cost calculated successfully.')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to calculate shipping cost.')
    }
  }

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project - Module 7</p>
        <nav>
          <button
            className="nav-item active"
            onClick={() => onNavigate?.('shippings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 7: Shipping
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
            onClick={() => onNavigate?.('orders')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 2: Orders
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
        <section className="content-header">
          <h2>Shipping Management Module</h2>
          <p>Manage shipping operations, track shipments, and calculate shipping costs</p>
        </section>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Admin Dashboard
          </button>
          <button
            className={`tab-button ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            Track Shipment
          </button>
          <button
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Shipping
          </button>
          <button
            className={`tab-button ${activeTab === 'update' ? 'active' : ''}`}
            onClick={() => setActiveTab('update')}
          >
            Update Shipping
          </button>
          <button
            className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            Calculate Cost
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <section className="section">
            <h3>Shipping Dashboard</h3>

            <div className="filter-container">
              <label htmlFor="statusFilter">Filter by Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Shipments</option>
                <option value="Shipped">Shipped</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Shipments</h4>
                <p className="stat-value">{dashboardStats.total_shipments}</p>
              </div>
              <div className="stat-card">
                <h4>Shipped</h4>
                <p className="stat-value">{dashboardStats.shipped}</p>
              </div>
              <div className="stat-card">
                <h4>In Transit</h4>
                <p className="stat-value">{dashboardStats.in_transit}</p>
              </div>
              <div className="stat-card">
                <h4>Delivered</h4>
                <p className="stat-value">{dashboardStats.delivered}</p>
              </div>
              <div className="stat-card">
                <h4>Total Shipping Cost</h4>
                <p className="stat-value">{formatCurrency(dashboardStats.total_cost)}</p>
              </div>
            </div>

            {loading ? (
              <p>Loading shipping data...</p>
            ) : dashboardRows.length === 0 ? (
              <p>No shipping records found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shipping ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Courier</th>
                    <th>Tracking Number</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardRows.map((row) => (
                    <tr key={row.shipping_id}>
                      <td>{row.shipping_id}</td>
                      <td>{row.order_id}</td>
                      <td>{row.full_name}</td>
                      <td>{row.courier_service}</td>
                      <td>{row.tracking_number}</td>
                      <td>
                        <span className={`status-badge status-${row.shipping_status.toLowerCase().replace(' ', '-')}`}>
                          {row.shipping_status}
                        </span>
                      </td>
                      <td>{formatCurrency(row.shipping_cost)}</td>
                      <td>{formatDate(row.created_at)}</td>
                      <td>
                        <button
                          className="btn btn-primary-sm"
                          onClick={() => handleUpdateShipping(row)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'track' && (
          <section className="section">
            <h3>Track Your Shipment</h3>
            <form onSubmit={handleTrackShipment} className="form">
              <div className="form-group">
                <label htmlFor="tracking_number">Tracking Number:</label>
                <input
                  type="text"
                  id="tracking_number"
                  name="tracking_number"
                  value={trackingForm.tracking_number}
                  onChange={handleTrackingChange}
                  placeholder="Enter tracking number"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Track Shipment
              </button>
            </form>

            {trackingResult && (
              <div className="result-container">
                <h4>Shipment Details</h4>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td>Tracking Number</td>
                      <td>{trackingResult.tracking_number}</td>
                    </tr>
                    <tr>
                      <td>Courier Service</td>
                      <td>{trackingResult.courier_service}</td>
                    </tr>
                    <tr>
                      <td>Status</td>
                      <td>
                        <span className={`status-badge status-${trackingResult.shipping_status.toLowerCase().replace(' ', '-')}`}>
                          {trackingResult.shipping_status}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Shipping Cost</td>
                      <td>{formatCurrency(trackingResult.shipping_cost)}</td>
                    </tr>
                    <tr>
                      <td>Order Status</td>
                      <td>{trackingResult.order_status}</td>
                    </tr>
                    <tr>
                      <td>Created Date</td>
                      <td>{formatDate(trackingResult.created_at)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'create' && (
          <section className="section">
            <h3>Create Shipping Record</h3>
            <form onSubmit={handleCreateShipping} className="form">
              <div className="form-group">
                <label htmlFor="order_id">Order ID: *</label>
                <input
                  type="number"
                  id="order_id"
                  name="order_id"
                  value={shippingForm.order_id}
                  onChange={handleShippingFormChange}
                  placeholder="Enter order ID"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="courier_service">Courier Service:</label>
                <input
                  type="text"
                  id="courier_service"
                  name="courier_service"
                  value={shippingForm.courier_service}
                  onChange={handleShippingFormChange}
                  placeholder="e.g., FedEx, UPS, DHL"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tracking_number">Tracking Number:</label>
                <input
                  type="text"
                  id="tracking_number"
                  name="tracking_number"
                  value={shippingForm.tracking_number}
                  onChange={handleShippingFormChange}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="shipping_cost">Shipping Cost:</label>
                <input
                  type="number"
                  id="shipping_cost"
                  name="shipping_cost"
                  value={shippingForm.shipping_cost}
                  onChange={handleShippingFormChange}
                  placeholder="Enter shipping cost"
                  step="0.01"
                  min="0"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Shipping
              </button>
            </form>
          </section>
        )}

        {activeTab === 'update' && (
          <section className="section">
            <h3>Update Shipping Information</h3>
            {updateForm.shipping_id ? (
              <form onSubmit={handleSubmitUpdate} className="form">
                <div className="form-group">
                  <label>Shipping ID:</label>
                  <input type="text" value={updateForm.shipping_id} disabled />
                </div>
                <div className="form-group">
                  <label htmlFor="update_courier">Courier Service:</label>
                  <input
                    type="text"
                    id="update_courier"
                    name="courier_service"
                    value={updateForm.courier_service}
                    onChange={handleUpdateFormChange}
                    placeholder="Enter courier service"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="update_tracking">Tracking Number:</label>
                  <input
                    type="text"
                    id="update_tracking"
                    name="tracking_number"
                    value={updateForm.tracking_number}
                    onChange={handleUpdateFormChange}
                    placeholder="Enter tracking number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="update_status">Shipping Status:</label>
                  <select
                    id="update_status"
                    name="shipping_status"
                    value={updateForm.shipping_status}
                    onChange={handleUpdateFormChange}
                  >
                    <option value="">Select status</option>
                    <option value="Shipped">Shipped</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">
                  Update Shipping
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUpdateForm({ shipping_id: '', courier_service: '', tracking_number: '', shipping_status: '' })}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <p>Select a shipping record from the dashboard to edit it.</p>
            )}
          </section>
        )}

        {activeTab === 'calculator' && (
          <section className="section">
            <h3>Shipping Cost Calculator</h3>
            <form onSubmit={handleCalculateCost} className="form">
              <div className="form-group">
                <label htmlFor="order_amount">Order Amount ($): *</label>
                <input
                  type="number"
                  id="order_amount"
                  name="order_amount"
                  value={costCalculator.order_amount}
                  onChange={handleCostCalculatorChange}
                  placeholder="Enter order amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="weight">Weight (kg):</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={costCalculator.weight}
                  onChange={handleCostCalculatorChange}
                  step="0.1"
                  min="0.1"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Calculate Cost
              </button>
            </form>

            {costCalculator.result && (
              <div className="result-container">
                <h4>Calculated Shipping Cost</h4>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td>Order Amount</td>
                      <td>{formatCurrency(costCalculator.result.order_amount)}</td>
                    </tr>
                    <tr>
                      <td>Weight</td>
                      <td>{costCalculator.result.weight} kg</td>
                    </tr>
                    <tr>
                      <td>Shipping Cost</td>
                      <td className="highlight">{formatCurrency(costCalculator.result.shipping_cost)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default ShippingManagement
