import { useEffect, useState } from 'react'
import {
  createCoupon,
  getCouponsDashboard,
  applyCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
} from './api'
import './CouponManagement.css'

function CouponManagement({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, expired: 0 })

  const [couponForm, setCouponForm] = useState({
    coupon_code: '',
    discount_type: 'percentage',
    discount_value: '',
    valid_from: '',
    valid_to: '',
    usage_limit: 0,
  })

  const [applyForm, setApplyForm] = useState({
    coupon_code: '',
    order_total: '',
  })

  const [applyResult, setApplyResult] = useState(null)

  const [editForm, setEditForm] = useState({
    coupon_id: '',
    coupon_code: '',
    discount_type: 'percentage',
    discount_value: '',
    valid_from: '',
    valid_to: '',
    usage_limit: 0,
  })

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchDashboard = async (filter = statusFilter) => {
    try {
      setLoading(true)
      const params = filter === 'all' ? {} : { status: filter }
      const response = await getCouponsDashboard(params)
      setRows(response.data)
      setStats(response.stats)
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load coupons dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard(statusFilter)
    }
  }, [activeTab, statusFilter])

  const handleCouponFormChange = (event) => {
    const { name, value } = event.target
    setCouponForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateCoupon = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!couponForm.coupon_code || !couponForm.discount_value || !couponForm.valid_from || !couponForm.valid_to) {
      setError('Please fill all required fields.')
      return
    }

    try {
      const payload = {
        coupon_code: couponForm.coupon_code,
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.discount_value),
        valid_from: couponForm.valid_from,
        valid_to: couponForm.valid_to,
        usage_limit: Number(couponForm.usage_limit || 0),
      }

      await createCoupon(payload)
      setSuccess('Coupon created successfully.')
      setCouponForm({
        coupon_code: '',
        discount_type: 'percentage',
        discount_value: '',
        valid_from: '',
        valid_to: '',
        usage_limit: 0,
      })
      await fetchDashboard(statusFilter)
      setActiveTab('dashboard')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to create coupon.')
    }
  }

  const handleApplyFormChange = (event) => {
    const { name, value } = event.target
    setApplyForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyCoupon = async (event) => {
    event.preventDefault()
    clearMessages()
    setApplyResult(null)

    if (!applyForm.coupon_code || !applyForm.order_total) {
      setError('Coupon code and order total are required.')
      return
    }

    try {
      const response = await applyCoupon({
        coupon_code: applyForm.coupon_code,
        order_total: Number(applyForm.order_total),
      })
      setApplyResult(response.data)
      setSuccess('Coupon applied successfully.')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to apply coupon.')
    }
  }

  const startEdit = (row) => {
    clearMessages()
    setEditForm({
      coupon_id: row.coupon_id,
      coupon_code: row.coupon_code,
      discount_type: row.discount_type,
      discount_value: row.discount_value,
      valid_from: row.valid_from?.slice(0, 16) || '',
      valid_to: row.valid_to?.slice(0, 16) || '',
      usage_limit: row.usage_limit,
    })
  }

  const handleEditFormChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateCoupon = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!editForm.coupon_id) {
      setError('Select a coupon to edit first.')
      return
    }

    try {
      await updateCoupon(editForm.coupon_id, {
        coupon_code: editForm.coupon_code,
        discount_type: editForm.discount_type,
        discount_value: Number(editForm.discount_value),
        valid_from: editForm.valid_from,
        valid_to: editForm.valid_to,
        usage_limit: Number(editForm.usage_limit),
      })

      setSuccess('Coupon updated successfully.')
      setEditForm({
        coupon_id: '',
        coupon_code: '',
        discount_type: 'percentage',
        discount_value: '',
        valid_from: '',
        valid_to: '',
        usage_limit: 0,
      })
      await fetchDashboard(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to update coupon.')
    }
  }

  const handleToggleStatus = async (row) => {
    clearMessages()
    try {
      await updateCouponStatus(row.coupon_id, { status: Number(row.status) !== 1 })
      setSuccess('Coupon status updated successfully.')
      await fetchDashboard(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to update coupon status.')
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    clearMessages()
    if (!window.confirm('Delete this coupon? (soft delete)')) {
      return
    }

    try {
      await deleteCoupon(couponId)
      setSuccess('Coupon deleted successfully.')
      await fetchDashboard(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to delete coupon.')
    }
  }

  const formatDateTime = (value) => {
    if (!value) return '-'
    return new Date(value).toLocaleString()
  }

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project - Module 9</p>
        <nav>
          <button className="nav-item active" onClick={() => onNavigate?.('coupons')}>
            Module 9: Coupons
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('categories')}>
            Module 1: Categories
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('orders')}>
            Module 2: Orders
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('customers')}>
            Module 3: Customers
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('payments')}>
            Module 4: Payments
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('carts')}>
            Module 5: Cart
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('wishlists')}>
            Module 6: Wishlist
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('shippings')}>
            Module 7: Shipping
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('reviews')}>
            Module 8: Reviews
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <section className="content-header">
          <h2>Coupon and Discount Management Module</h2>
          <p>Create, manage, and apply coupons with expiration and status controls.</p>
        </section>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="tabs-container">
          <button className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            Coupon Dashboard
          </button>
          <button className={`tab-button ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
            Create Coupon
          </button>
          <button className={`tab-button ${activeTab === 'apply' ? 'active' : ''}`} onClick={() => setActiveTab('apply')}>
            Apply at Checkout
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <section className="section">
            <h3>Coupons Dashboard</h3>

            <div className="filter-container">
              <label htmlFor="coupon-status-filter">Filter:</label>
              <select id="coupon-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><h4>Total</h4><p className="stat-value">{stats.total}</p></div>
              <div className="stat-card"><h4>Active</h4><p className="stat-value">{stats.active}</p></div>
              <div className="stat-card"><h4>Inactive</h4><p className="stat-value">{stats.inactive}</p></div>
              <div className="stat-card"><h4>Expired</h4><p className="stat-value">{stats.expired}</p></div>
            </div>

            {loading ? (
              <p>Loading coupons...</p>
            ) : rows.length === 0 ? (
              <p>No coupons found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Valid From</th>
                    <th>Valid To</th>
                    <th>Usage Limit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.coupon_id}>
                      <td>{row.coupon_id}</td>
                      <td>{row.coupon_code}</td>
                      <td>{row.discount_type}</td>
                      <td>{row.discount_type === 'percentage' ? `${row.discount_value}%` : formatCurrency(row.discount_value)}</td>
                      <td>{formatDateTime(row.valid_from)}</td>
                      <td>{formatDateTime(row.valid_to)}</td>
                      <td>{row.usage_limit}</td>
                      <td>
                        <span className={`status-badge ${Number(row.status) === 1 ? 'status-active' : 'status-inactive'}`}>
                          {Number(row.status) === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button className="btn btn-primary-sm" onClick={() => startEdit(row)}>Edit</button>
                        <button className="btn btn-secondary-sm" onClick={() => handleToggleStatus(row)}>
                          {Number(row.status) === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="btn btn-delete-sm" onClick={() => handleDeleteCoupon(row.coupon_id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {editForm.coupon_id && (
              <div className="edit-panel">
                <h4>Edit Coupon</h4>
                <form className="form" onSubmit={handleUpdateCoupon}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="edit_coupon_code">Coupon Code</label>
                      <input id="edit_coupon_code" name="coupon_code" value={editForm.coupon_code} onChange={handleEditFormChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit_discount_type">Discount Type</label>
                      <select id="edit_discount_type" name="discount_type" value={editForm.discount_type} onChange={handleEditFormChange}>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit_discount_value">Discount Value</label>
                      <input id="edit_discount_value" type="number" step="0.01" name="discount_value" value={editForm.discount_value} onChange={handleEditFormChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit_valid_from">Valid From</label>
                      <input id="edit_valid_from" type="datetime-local" name="valid_from" value={editForm.valid_from} onChange={handleEditFormChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit_valid_to">Valid To</label>
                      <input id="edit_valid_to" type="datetime-local" name="valid_to" value={editForm.valid_to} onChange={handleEditFormChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit_usage_limit">Usage Limit</label>
                      <input id="edit_usage_limit" type="number" min="0" name="usage_limit" value={editForm.usage_limit} onChange={handleEditFormChange} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditForm({ coupon_id: '', coupon_code: '', discount_type: 'percentage', discount_value: '', valid_from: '', valid_to: '', usage_limit: 0 })}>Cancel</button>
                </form>
              </div>
            )}
          </section>
        )}

        {activeTab === 'create' && (
          <section className="section">
            <h3>Create Coupon</h3>
            <form className="form" onSubmit={handleCreateCoupon}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="coupon_code">Coupon Code</label>
                  <input id="coupon_code" name="coupon_code" value={couponForm.coupon_code} onChange={handleCouponFormChange} placeholder="SAVE20" required />
                </div>
                <div className="form-group">
                  <label htmlFor="discount_type">Discount Type</label>
                  <select id="discount_type" name="discount_type" value={couponForm.discount_type} onChange={handleCouponFormChange}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="discount_value">Discount Value</label>
                  <input id="discount_value" type="number" name="discount_value" step="0.01" value={couponForm.discount_value} onChange={handleCouponFormChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="valid_from">Valid From</label>
                  <input id="valid_from" type="datetime-local" name="valid_from" value={couponForm.valid_from} onChange={handleCouponFormChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="valid_to">Valid To</label>
                  <input id="valid_to" type="datetime-local" name="valid_to" value={couponForm.valid_to} onChange={handleCouponFormChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="usage_limit">Usage Limit</label>
                  <input id="usage_limit" type="number" min="0" name="usage_limit" value={couponForm.usage_limit} onChange={handleCouponFormChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Create Coupon</button>
            </form>
          </section>
        )}

        {activeTab === 'apply' && (
          <section className="section">
            <h3>Apply Coupon at Checkout</h3>
            <form className="form" onSubmit={handleApplyCoupon}>
              <div className="form-group">
                <label htmlFor="apply_coupon_code">Coupon Code</label>
                <input id="apply_coupon_code" name="coupon_code" value={applyForm.coupon_code} onChange={handleApplyFormChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="order_total">Order Total</label>
                <input id="order_total" name="order_total" type="number" step="0.01" value={applyForm.order_total} onChange={handleApplyFormChange} required />
              </div>
              <button className="btn btn-primary" type="submit">Apply Coupon</button>
            </form>

            {applyResult && (
              <div className="result-card">
                <h4>Checkout Summary</h4>
                <p><strong>Coupon:</strong> {applyResult.coupon_code}</p>
                <p><strong>Order Total:</strong> {formatCurrency(applyResult.order_total)}</p>
                <p><strong>Discount:</strong> {formatCurrency(applyResult.discount_amount)}</p>
                <p><strong>Final Total:</strong> {formatCurrency(applyResult.final_total)}</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default CouponManagement
