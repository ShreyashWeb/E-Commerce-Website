import { useEffect, useState } from 'react'
import {
  addToWishlist,
  getCustomerWishlist,
  getWishlistProducts,
  moveWishlistToCart,
  removeFromWishlist,
} from './api'
import './WishlistManagement.css'

function WishlistManagement({ onNavigate }) {
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('1')
  const [wishlistItems, setWishlistItems] = useState([])
  const [customerInfo, setCustomerInfo] = useState(null)
  const [summary, setSummary] = useState({ total_items: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    customer_id: 1,
    product_id: '',
  })

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchWishlistProducts = async () => {
    const response = await getWishlistProducts()
    setProducts(response.data)
  }

  const fetchCustomerWishlist = async (targetCustomerId) => {
    const response = await getCustomerWishlist(Number(targetCustomerId))
    setCustomerInfo(response.data.customer)
    setWishlistItems(response.data.items)
    setSummary(response.data.summary)
  }

  const fetchAllData = async (targetCustomerId = customerId) => {
    try {
      setLoading(true)
      await Promise.all([
        fetchWishlistProducts(),
        fetchCustomerWishlist(targetCustomerId),
      ])
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load wishlist data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData('1')
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleAddToWishlist = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!form.product_id) {
      setError('Please select a product.')
      return
    }

    try {
      await addToWishlist({
        customer_id: Number(form.customer_id),
        product_id: Number(form.product_id),
      })
      setSuccess('Product added to wishlist.')
      await fetchAllData(String(form.customer_id))
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to add to wishlist.')
    }
  }

  const handleRemoveFromWishlist = async (wishlistId) => {
    clearMessages()

    if (!window.confirm('Remove this product from wishlist?')) {
      return
    }

    try {
      await removeFromWishlist(wishlistId)
      setSuccess('Wishlist item removed successfully.')
      await fetchAllData(customerId)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to remove wishlist item.')
    }
  }

  const handleMoveToCart = async (wishlistId) => {
    clearMessages()

    try {
      await moveWishlistToCart(wishlistId)
      setSuccess('Item moved from wishlist to cart successfully.')
      await fetchAllData(customerId)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to move item to cart.')
    }
  }

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project - Module 6</p>
        <nav>
          <button className="nav-item active" onClick={() => onNavigate?.('wishlists')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            Module 6: Wishlist
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('categories')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            Module 1: Categories
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            Module 2: Orders
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('customers')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            Module 3: Customers
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('payments')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            Module 4: Payments
          </button>
          <button className="nav-item" onClick={() => onNavigate?.('carts')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            Module 5: Cart
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header-card">
          <div>
            <p className="eyebrow">Module 6</p>
            <h2>Wishlist Management Dashboard</h2>
            <p className="subtitle">
              Save favorite products for later purchase, track availability, remove items, and move products from wishlist to cart.
            </p>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Total Wishlist Items</span>
              <strong>{summary.total_items}</strong>
            </article>
            <article className="stat-card">
              <span>Customer</span>
              <strong>{customerInfo?.full_name || 'N/A'}</strong>
            </article>
          </div>
        </header>

        <section className="content-grid">
          <article className="card form-card">
            <h3>Add to Wishlist</h3>
            <form onSubmit={handleAddToWishlist}>
              <label htmlFor="customer_id">Customer ID</label>
              <input
                id="customer_id"
                name="customer_id"
                type="number"
                min="1"
                value={form.customer_id}
                onChange={(event) => {
                  handleInputChange(event)
                  setCustomerId(event.target.value)
                }}
              />

              <label htmlFor="product_id">Product</label>
              <select
                id="product_id"
                name="product_id"
                value={form.product_id}
                onChange={handleInputChange}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name} - {formatCurrency(product.price)} ({Number(product.stock_quantity) > 0 ? 'In Stock' : 'Out of Stock'})
                  </option>
                ))}
              </select>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add to Wishlist</button>
                <button type="button" className="btn btn-secondary" onClick={() => fetchAllData(customerId)}>
                  Refresh
                </button>
              </div>
            </form>
          </article>

          <article className="card table-card full-width">
            <div className="table-toolbar">
              <h3>Customer Wishlist {customerInfo ? `- ${customerInfo.full_name} (#${customerInfo.user_id})` : ''}</h3>
            </div>

            {error ? <p className="message error">{error}</p> : null}
            {success ? <p className="message success">{success}</p> : null}

            {loading ? (
              <p className="message">Loading wishlist...</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Wishlist ID</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Availability</th>
                      <th>Added On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlistItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">No wishlist items found.</td>
                      </tr>
                    ) : (
                      wishlistItems.map((item) => (
                        <tr key={item.wishlist_id}>
                          <td>#{item.wishlist_id}</td>
                          <td>{item.product_name}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>
                            <span className={`status-pill ${Number(item.stock_quantity) > 0 ? 'active' : 'inactive'}`}>
                              {Number(item.stock_quantity) > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td>{new Date(item.created_at).toLocaleString()}</td>
                          <td className="action-cell">
                            <button className="btn btn-inline" onClick={() => handleMoveToCart(item.wishlist_id)}>
                              Move to Cart
                            </button>
                            <button className="btn btn-inline danger" onClick={() => handleRemoveFromWishlist(item.wishlist_id)}>
                              Remove
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
      </main>
    </div>
  )
}

export default WishlistManagement
