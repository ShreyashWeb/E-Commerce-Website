import { useEffect, useState } from 'react'
import {
  getReviewsDashboard,
  getProductReviews,
  getCustomerReviews,
  addReview,
  updateReview,
  deleteReview,
  moderateReview,
} from './api'
import './ReviewManagement.css'

function ReviewManagement({ onNavigate }) {
  const [dashboardRows, setDashboardRows] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    average_rating: 0,
  })
  const [productReviews, setProductReviews] = useState([])
  const [customerReviews, setCustomerReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [statusFilter, setStatusFilter] = useState('all')

  const [addReviewForm, setAddReviewForm] = useState({
    product_id: '',
    customer_id: '',
    rating: 5,
    review_text: '',
  })

  const [productSearchForm, setProductSearchForm] = useState({
    product_id: '',
    status: 'approved',
  })

  const [customerSearchForm, setCustomerSearchForm] = useState({
    customer_id: '',
  })

  const [editForm, setEditForm] = useState({
    review_id: '',
    rating: 5,
    review_text: '',
    customer_id: '',
  })

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchDashboard = async (filter = statusFilter) => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await getReviewsDashboard(params)
      setDashboardRows(response.data)
      setDashboardStats(response.stats)
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load reviews dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard(statusFilter)
    }
  }, [activeTab, statusFilter])

  const handleAddReviewChange = (event) => {
    const { name, value } = event.target
    setAddReviewForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleAddReview = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!addReviewForm.product_id || !addReviewForm.customer_id) {
      setError('Product ID and Customer ID are required.')
      return
    }

    try {
      const payload = {
        product_id: Number(addReviewForm.product_id),
        customer_id: Number(addReviewForm.customer_id),
        rating: Number(addReviewForm.rating),
        review_text: addReviewForm.review_text || null,
      }

      await addReview(payload)
      setSuccess('Review added successfully!')
      setAddReviewForm({
        product_id: '',
        customer_id: '',
        rating: 5,
        review_text: '',
      })
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to add review.')
    }
  }

  const handleProductSearchChange = (event) => {
    const { name, value } = event.target
    setProductSearchForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSearchProductReviews = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!productSearchForm.product_id) {
      setError('Product ID is required.')
      return
    }

    try {
      const response = await getProductReviews(
        Number(productSearchForm.product_id),
        productSearchForm.status,
      )
      setProductReviews(response.data)
      setSuccess('Product reviews loaded.')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to load reviews.')
    }
  }

  const handleCustomerSearchChange = (event) => {
    const { name, value } = event.target
    setCustomerSearchForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSearchCustomerReviews = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!customerSearchForm.customer_id) {
      setError('Customer ID is required.')
      return
    }

    try {
      const response = await getCustomerReviews(Number(customerSearchForm.customer_id))
      setCustomerReviews(response.data)
      setSuccess('Customer reviews loaded.')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to load reviews.')
    }
  }

  const handleModerateReview = async (reviewId, action) => {
    clearMessages()

    try {
      await moderateReview(reviewId, action)
      setSuccess(`Review ${action}ed successfully.`)
      await fetchDashboard(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || `Unable to ${action} review.`)
    }
  }

  const handleEditReview = (review) => {
    clearMessages()
    setEditForm({
      review_id: review.review_id,
      rating: review.rating,
      review_text: review.review_text || '',
      customer_id: review.customer_id,
    })
  }

  const handleEditFormChange = (event) => {
    const { name, value } = event.target
    setEditForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmitEdit = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!editForm.review_id) {
      setError('Review ID is required.')
      return
    }

    try {
      const payload = {
        rating: Number(editForm.rating),
        review_text: editForm.review_text || null,
        customer_id: Number(editForm.customer_id),
      }

      await updateReview(editForm.review_id, payload)
      setSuccess('Review updated and sent for moderation.')
      setEditForm({ review_id: '', rating: 5, review_text: '', customer_id: '' })
      if (activeTab === 'dashboard') {
        await fetchDashboard(statusFilter)
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to update review.')
    }
  }

  const handleDeleteReview = async (reviewId, customerId, isAdmin = false) => {
    clearMessages()

    if (!window.confirm('Delete this review?')) {
      return
    }

    try {
      const payload = { customer_id: customerId, is_admin: isAdmin }
      await deleteReview(reviewId, payload)
      setSuccess('Review deleted successfully.')
      if (activeTab === 'dashboard') {
        await fetchDashboard(statusFilter)
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to delete review.')
    }
  }

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project - Module 8</p>
        <nav>
          <button
            className="nav-item active"
            onClick={() => onNavigate?.('reviews')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 8: Reviews
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
          <button
            className="nav-item"
            onClick={() => onNavigate?.('shippings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 7: Shipping
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <section className="content-header">
          <h2>Review & Rating Management Module</h2>
          <p>Manage customer reviews, moderate content, and track product ratings</p>
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
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Review
          </button>
          <button
            className={`tab-button ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => setActiveTab('product')}
          >
            Product Reviews
          </button>
          <button
            className={`tab-button ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer')}
          >
            Customer Reviews
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <section className="section">
            <h3>Reviews Moderation Dashboard</h3>

            <div className="filter-container">
              <label htmlFor="statusFilter">Filter by Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Reviews</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Moderation</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Reviews</h4>
                <p className="stat-value">{dashboardStats.total}</p>
              </div>
              <div className="stat-card">
                <h4>Approved</h4>
                <p className="stat-value">{dashboardStats.approved}</p>
              </div>
              <div className="stat-card">
                <h4>Pending</h4>
                <p className="stat-value">{dashboardStats.pending}</p>
              </div>
              <div className="stat-card">
                <h4>Rejected</h4>
                <p className="stat-value">{dashboardStats.rejected}</p>
              </div>
              <div className="stat-card">
                <h4>Average Rating</h4>
                <p className="stat-value">{dashboardStats.average_rating}</p>
              </div>
            </div>

            {loading ? (
              <p>Loading reviews...</p>
            ) : dashboardRows.length === 0 ? (
              <p>No reviews found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Review ID</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardRows.map((row) => (
                    <tr key={row.review_id}>
                      <td>{row.review_id}</td>
                      <td>{row.product_name}</td>
                      <td>{row.full_name}</td>
                      <td>
                        <span className="rating-stars">{renderStars(row.rating)}</span>
                      </td>
                      <td>
                        <div className="review-preview">{row.review_text || '(No text)'}</div>
                      </td>
                      <td>
                        <span className={`status-badge status-${row.status === 1 ? 'approved' : row.status === 0 ? 'pending' : 'rejected'}`}>
                          {row.status === 1 ? 'Approved' : row.status === 0 ? 'Pending' : 'Rejected'}
                        </span>
                      </td>
                      <td>{formatDate(row.created_at)}</td>
                      <td className="action-cell">
                        <button
                          className="btn btn-primary-sm"
                          onClick={() => handleEditReview(row)}
                        >
                          Edit
                        </button>
                        {row.status === 0 && (
                          <>
                            <button
                              className="btn btn-success-sm"
                              onClick={() => handleModerateReview(row.review_id, 'approve')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger-sm"
                              onClick={() => handleModerateReview(row.review_id, 'reject')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-delete-sm"
                          onClick={() => handleDeleteReview(row.review_id, row.customer_id, true)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {editForm.review_id && (
              <div className="edit-section">
                <h4>Edit Review</h4>
                <form onSubmit={handleSubmitEdit} className="form">
                  <div className="form-group">
                    <label>Review ID:</label>
                    <input type="text" value={editForm.review_id} disabled />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit_rating">Rating (1-5):</label>
                    <input
                      type="number"
                      id="edit_rating"
                      name="rating"
                      value={editForm.rating}
                      onChange={handleEditFormChange}
                      min="1"
                      max="5"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit_text">Review Text:</label>
                    <textarea
                      id="edit_text"
                      name="review_text"
                      value={editForm.review_text}
                      onChange={handleEditFormChange}
                      rows="4"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditForm({ review_id: '', rating: 5, review_text: '', customer_id: '' })}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </section>
        )}

        {activeTab === 'add' && (
          <section className="section">
            <h3>Add New Review</h3>
            <form onSubmit={handleAddReview} className="form">
              <div className="form-group">
                <label htmlFor="product_id">Product ID: *</label>
                <input
                  type="number"
                  id="product_id"
                  name="product_id"
                  value={addReviewForm.product_id}
                  onChange={handleAddReviewChange}
                  placeholder="Enter product ID"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customer_id">Customer ID: *</label>
                <input
                  type="number"
                  id="customer_id"
                  name="customer_id"
                  value={addReviewForm.customer_id}
                  onChange={handleAddReviewChange}
                  placeholder="Enter customer ID"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="rating">Rating (1-5): *</label>
                <select
                  id="rating"
                  name="rating"
                  value={addReviewForm.rating}
                  onChange={handleAddReviewChange}
                >
                  <option value="5">5 Stars ★★★★★</option>
                  <option value="4">4 Stars ★★★★☆</option>
                  <option value="3">3 Stars ★★★☆☆</option>
                  <option value="2">2 Stars ★★☆☆☆</option>
                  <option value="1">1 Star ★☆☆☆☆</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="review_text">Review Text:</label>
                <textarea
                  id="review_text"
                  name="review_text"
                  value={addReviewForm.review_text}
                  onChange={handleAddReviewChange}
                  placeholder="Enter your review (optional)"
                  rows="5"
                  maxLength="1000"
                />
                <small>{addReviewForm.review_text.length}/1000</small>
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          </section>
        )}

        {activeTab === 'product' && (
          <section className="section">
            <h3>View Product Reviews</h3>
            <form onSubmit={handleSearchProductReviews} className="form">
              <div className="form-group">
                <label htmlFor="prod_id">Product ID: *</label>
                <input
                  type="number"
                  id="prod_id"
                  name="product_id"
                  value={productSearchForm.product_id}
                  onChange={handleProductSearchChange}
                  placeholder="Enter product ID"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prod_status">Status:</label>
                <select
                  id="prod_status"
                  name="status"
                  value={productSearchForm.status}
                  onChange={handleProductSearchChange}
                >
                  <option value="approved">Approved Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="all">All Reviews</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Load Reviews
              </button>
            </form>

            {productReviews.length > 0 && (
              <div className="reviews-display">
                <h4>Product Reviews</h4>
                {productReviews.map((review) => (
                  <div key={review.review_id} className="review-card">
                    <div className="review-header">
                      <strong>{review.full_name}</strong>
                      <span className="rating-stars">{renderStars(review.rating)}</span>
                      <small className="review-date">{formatDate(review.created_at)}</small>
                    </div>
                    <p className="review-text">{review.review_text}</p>
                    <button
                      className="btn btn-delete-sm"
                      onClick={() => handleDeleteReview(review.review_id, review.customer_id, false)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'customer' && (
          <section className="section">
            <h3>Customer's Reviews</h3>
            <form onSubmit={handleSearchCustomerReviews} className="form">
              <div className="form-group">
                <label htmlFor="cust_id">Customer ID: *</label>
                <input
                  type="number"
                  id="cust_id"
                  name="customer_id"
                  value={customerSearchForm.customer_id}
                  onChange={handleCustomerSearchChange}
                  placeholder="Enter customer ID"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Load Reviews
              </button>
            </form>

            {customerReviews.length > 0 && (
              <div className="reviews-display">
                <h4>Customer Reviews</h4>
                {customerReviews.map((review) => (
                  <div key={review.review_id} className="review-card">
                    <div className="review-header">
                      <strong>{review.product_name}</strong>
                      <span className="rating-stars">{renderStars(review.rating)}</span>
                      <small className="review-date">{formatDate(review.created_at)}</small>
                    </div>
                    <p className="review-text">{review.review_text}</p>
                    <div className="review-actions">
                      <button
                        className="btn btn-primary-sm"
                        onClick={() => handleEditReview(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete-sm"
                        onClick={() => handleDeleteReview(review.review_id, review.customer_id, false)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default ReviewManagement
