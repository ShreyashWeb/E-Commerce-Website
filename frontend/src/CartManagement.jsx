import { useEffect, useState } from 'react'
import {
  addToCart,
  getCartDashboard,
  getCartProducts,
  getCustomerCart,
  removeCartItem,
  updateCartItem,
} from './api'
import './CartManagement.css'

function CartManagement({ onNavigate }) {
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('1')
  const [cartItems, setCartItems] = useState([])
  const [summary, setSummary] = useState({ item_count: 0, grand_total: 0 })
  const [customerInfo, setCustomerInfo] = useState(null)
  const [dashboardRows, setDashboardRows] = useState([])
  const [dashboardStats, setDashboardStats] = useState({ active_carts: 0, abandoned_carts: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    customer_id: 1,
    product_id: '',
    quantity: 1,
  })

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchProducts = async () => {
    const response = await getCartProducts()
    setProducts(response.data)
  }

  const fetchCartForCustomer = async (targetCustomerId) => {
    const response = await getCustomerCart(Number(targetCustomerId))
    setCustomerInfo(response.data.customer)
    setCartItems(response.data.items)
    setSummary(response.data.summary)
  }

  const fetchDashboard = async () => {
    const response = await getCartDashboard()
    setDashboardRows(response.data)
    setDashboardStats(response.stats)
  }

  const fetchAllData = async (targetCustomerId = customerId) => {
    try {
      setLoading(true)
      await Promise.all([
        fetchProducts(),
        fetchCartForCustomer(targetCustomerId),
        fetchDashboard(),
      ])
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load cart data.')
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

  const handleAddToCart = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!form.product_id) {
      setError('Please select a product.')
      return
    }

    try {
      await addToCart({
        customer_id: Number(form.customer_id),
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
      })
      setSuccess('Product added to cart successfully.')
      await fetchAllData(String(form.customer_id))
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to add item to cart.')
    }
  }

  const handleUpdateItem = async (item) => {
    clearMessages()

    const userInput = window.prompt('Enter new quantity', String(item.quantity))
    if (!userInput) {
      return
    }

    const nextQuantity = Number(userInput)
    if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) {
      setError('Quantity must be a positive integer.')
      return
    }

    try {
      await updateCartItem(item.cart_id, { quantity: nextQuantity })
      setSuccess('Cart quantity updated successfully.')
      await fetchAllData(customerId)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to update cart item.')
    }
  }

  const handleRemoveItem = async (cartId) => {
    clearMessages()

    if (!window.confirm('Remove this item from cart?')) {
      return
    }

    try {
      await removeCartItem(cartId)
      setSuccess('Item removed from cart.')
      await fetchAllData(customerId)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to remove item.')
    }
  }

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project - Module 5</p>
        <nav>
          <button className="nav-item active" onClick={() => onNavigate?.('carts')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            Module 5: Cart
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
        </nav>
      </aside>

      <main className="main-content">
        <header className="header-card">
          <div>
            <p className="eyebrow">Module 5</p>
            <h2>Cart Management Dashboard</h2>
            <p className="subtitle">
              Add products to cart, update quantity in real-time, remove items, and monitor cart abandonment trends.
            </p>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Active Carts</span>
              <strong>{dashboardStats.active_carts}</strong>
            </article>
            <article className="stat-card">
              <span>Abandoned Carts</span>
              <strong>{dashboardStats.abandoned_carts}</strong>
            </article>
            <article className="stat-card">
              <span>Items in Current Cart</span>
              <strong>{summary.item_count}</strong>
            </article>
            <article className="stat-card">
              <span>Current Cart Total</span>
              <strong>{formatCurrency(summary.grand_total)}</strong>
            </article>
          </div>
        </header>

        <section className="content-grid">
          <article className="card form-card">
            <h3>Add to Cart</h3>
            <form onSubmit={handleAddToCart}>
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
                    {product.product_name} - {formatCurrency(product.price)} (Stock: {product.stock_quantity})
                  </option>
                ))}
              </select>

              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleInputChange}
              />

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add to Cart</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fetchAllData(customerId)}
                >
                  Refresh
                </button>
              </div>
            </form>
          </article>

          <article className="card table-card full-width">
            <div className="table-toolbar">
              <h3>Customer Cart {customerInfo ? `- ${customerInfo.full_name} (#${customerInfo.user_id})` : ''}</h3>
            </div>

            {error ? <p className="message error">{error}</p> : null}
            {success ? <p className="message success">{success}</p> : null}

            {loading ? (
              <p className="message">Loading cart items...</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Cart ID</th>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">No cart items found.</td>
                      </tr>
                    ) : (
                      cartItems.map((item) => (
                        <tr key={item.cart_id}>
                          <td>#{item.cart_id}</td>
                          <td>{item.product_name}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.total_price)}</td>
                          <td className="action-cell">
                            <button className="btn btn-inline" onClick={() => handleUpdateItem(item)}>
                              Update Qty
                            </button>
                            <button className="btn btn-inline danger" onClick={() => handleRemoveItem(item.cart_id)}>
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

          <article className="card table-card full-width">
            <div className="table-toolbar">
              <h3>Admin Cart Dashboard</h3>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Items</th>
                    <th>Cart Total</th>
                    <th>Last Updated</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center">No active carts found.</td>
                    </tr>
                  ) : (
                    dashboardRows.map((row) => (
                      <tr key={row.customer_id}>
                        <td>#{row.customer_id}</td>
                        <td>{row.full_name}</td>
                        <td>{row.email}</td>
                        <td>{row.item_count}</td>
                        <td>{formatCurrency(row.cart_total)}</td>
                        <td>{new Date(row.last_updated).toLocaleString()}</td>
                        <td>
                          <span className={`status-pill ${Number(row.abandoned) === 1 ? 'abandoned' : 'active'}`}>
                            {Number(row.abandoned) === 1 ? 'Abandoned' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default CartManagement
