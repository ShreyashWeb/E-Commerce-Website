import { useEffect, useMemo, useState } from 'react'
import {
  createCategory,
  getCategories,
  updateCategory,
  updateCategoryStatus,
} from './api'
import './App.css'
import OrderManagement from './OrderManagement'
import CustomerManagement from './CustomerManagement'
import PaymentManagement from './PaymentManagement'
import CartManagement from './CartManagement'
import WishlistManagement from './WishlistManagement'
import ShippingManagement from './ShippingManagement'
import ReviewManagement from './ReviewManagement'
import CouponManagement from './CouponManagement'

function App() {
  const [currentModule, setCurrentModule] = useState('categories')
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    category_name: '',
    description: '',
  })

  const activeCategories = useMemo(
    () => categories.filter((category) => Number(category.status) === 1),
    [categories],
  )

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchCategoryData = async (filter = statusFilter) => {
    try {
      setLoading(true)
      const response = await getCategories(filter)
      setCategories(response.data)
      setStats(response.stats)
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentModule === 'categories') {
      fetchCategoryData()
    }
  }, [currentModule])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const resetForm = () => {
    setForm({ category_name: '', description: '' })
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!form.category_name.trim()) {
      setError('Category name is required.')
      return
    }

    try {
      if (editingId) {
        await updateCategory(editingId, form)
        setSuccess('Category updated successfully.')
      } else {
        await createCategory(form)
        setSuccess('Category created successfully.')
      }

      resetForm()
      fetchCategoryData()
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to save category.')
    }
  }

  const handleEdit = (category) => {
    clearMessages()
    setEditingId(category.category_id)
    setForm({
      category_name: category.category_name,
      description: category.description || '',
    })
  }

  const handleStatusUpdate = async (category, nextStatus) => {
    clearMessages()

    try {
      if (!nextStatus && Number(category.product_count) > 0) {
        const replacementOptions = activeCategories.filter(
          (item) => item.category_id !== category.category_id,
        )

        if (replacementOptions.length === 0) {
          setError('Create another active category before deactivating this one.')
          return
        }

        const userChoice = window.prompt(
          `Category has ${category.product_count} active products. Enter replacement category ID from [${replacementOptions
            .map((item) => item.category_id)
            .join(', ')}].`,
        )

        if (!userChoice) {
          return
        }

        await updateCategoryStatus(category.category_id, {
          status: nextStatus,
          replacementCategoryId: Number(userChoice),
        })
      } else {
        await updateCategoryStatus(category.category_id, { status: nextStatus })
      }

      setSuccess(
        nextStatus
          ? 'Category activated successfully.'
          : 'Category deactivated successfully.',
      )
      fetchCategoryData()
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message ||
          'Unable to update category status right now.',
      )
    }
  }

  if (currentModule === 'orders') {
    return <OrderManagement onNavigate={setCurrentModule} />
  }

  if (currentModule === 'customers') {
    return <CustomerManagement onNavigate={setCurrentModule} />
  }

  if (currentModule === 'payments') {
    return <PaymentManagement onNavigate={setCurrentModule} />
  }

  if (currentModule === 'carts') {
    return <CartManagement onNavigate={setCurrentModule} />
  }

  if (currentModule === 'wishlists') {
    return <WishlistManagement onNavigate={setCurrentModule} />
  }

  if (currentModule === 'shippings') {
    return <ShippingManagement onNavigate={setCurrentModule} />
  }

  if (currentModule === 'reviews') {
    return <ReviewManagement onNavigate={setCurrentModule} />
  }

  if (currentModule === 'coupons') {
    return <CouponManagement onNavigate={setCurrentModule} />
  }

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project</p>
        <nav>
          <button
            className={`nav-item ${currentModule === 'categories' ? 'active' : ''}`}
            onClick={() => setCurrentModule('categories')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 1: Categories
          </button>
          <button
            className={`nav-item ${currentModule === 'orders' ? 'active' : ''}`}
            onClick={() => setCurrentModule('orders')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 2: Orders
          </button>
          <button
            className={`nav-item ${currentModule === 'customers' ? 'active' : ''}`}
            onClick={() => setCurrentModule('customers')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 3: Customers
          </button>
          <button
            className={`nav-item ${currentModule === 'payments' ? 'active' : ''}`}
            onClick={() => setCurrentModule('payments')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 4: Payments
          </button>
          <button
            className={`nav-item ${currentModule === 'carts' ? 'active' : ''}`}
            onClick={() => setCurrentModule('carts')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 5: Cart
          </button>
          <button
            className={`nav-item ${currentModule === 'wishlists' ? 'active' : ''}`}
            onClick={() => setCurrentModule('wishlists')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 6: Wishlist
          </button>
          <button
            className={`nav-item ${currentModule === 'shippings' ? 'active' : ''}`}
            onClick={() => setCurrentModule('shippings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 7: Shipping
          </button>
          <button
            className={`nav-item ${currentModule === 'reviews' ? 'active' : ''}`}
            onClick={() => setCurrentModule('reviews')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 8: Reviews
          </button>
          <button
            className={`nav-item ${currentModule === 'coupons' ? 'active' : ''}`}
            onClick={() => setCurrentModule('coupons')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 9: Coupons
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header-card">
          <div>
            <p className="eyebrow">Module 1</p>
            <h2>Category Management Dashboard</h2>
            <p className="subtitle">
              Create, update, and soft delete categories with product reassignment validation.
            </p>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Total Categories</span>
              <strong>{stats.total}</strong>
            </article>
            <article className="stat-card">
              <span>Active</span>
              <strong>{stats.active}</strong>
            </article>
            <article className="stat-card">
              <span>Inactive</span>
              <strong>{stats.inactive}</strong>
            </article>
          </div>
        </header>

        <section className="content-grid">
          <article className="card form-card">
            <h3>{editingId ? 'Update Category' : 'Create New Category'}</h3>
            <form onSubmit={handleSubmit}>
              <label htmlFor="category_name">Category Name</label>
              <input
                id="category_name"
                name="category_name"
                value={form.category_name}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="Example: Kitchenware"
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                maxLength={300}
                rows={4}
                placeholder="Short description to help admins identify this category"
              />

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Clear
                </button>
              </div>
            </form>
          </article>

          <article className="card table-card">
            <div className="table-toolbar">
              <h3>Category Dashboard</h3>
              <div className="filter-group">
                <label htmlFor="status-filter">Filter</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => {
                    const nextFilter = event.target.value
                    setStatusFilter(nextFilter)
                    fetchCategoryData(nextFilter)
                  }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {error ? <p className="message error">{error}</p> : null}
            {success ? <p className="message success">{success}</p> : null}

            {loading ? (
              <p className="message">Loading categories...</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5}>No categories found.</td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category.category_id}>
                          <td>{category.category_name}</td>
                          <td>{category.description || 'No description'}</td>
                          <td>{category.product_count}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                Number(category.status) === 1 ? 'active' : 'inactive'
                              }`}
                            >
                              {Number(category.status) === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="action-cell">
                            <button className="btn btn-inline" onClick={() => handleEdit(category)}>
                              Edit
                            </button>
                            {Number(category.status) === 1 ? (
                              <button
                                className="btn btn-inline danger"
                                onClick={() => handleStatusUpdate(category, false)}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                className="btn btn-inline"
                                onClick={() => handleStatusUpdate(category, true)}
                              >
                                Activate
                              </button>
                            )}
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

export default App
