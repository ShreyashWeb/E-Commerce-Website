import { useEffect, useState } from 'react'
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deactivateCustomer,
  reactivateCustomer,
} from './api'
import './CustomerManagement.css'

function CustomerManagement() {
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  })

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchCustomerData = async (filter = 'all') => {
    try {
      setLoading(true)
      const params = filter === 'all' ? {} : { status: filter }
      const response = await getCustomers(params)
      setCustomers(response.data)
      setStats(response.stats)
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomerData()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const resetForm = () => {
    setForm({ full_name: '', email: '', phone: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!form.full_name.trim()) {
      setError('Customer name is required.')
      return
    }

    if (!form.email.trim()) {
      setError('Email is required.')
      return
    }

    try {
      if (editingId) {
        await updateCustomer(editingId, form)
        setSuccess('Customer updated successfully.')
      } else {
        await createCustomer(form)
        setSuccess('Customer created successfully.')
      }

      resetForm()
      fetchCustomerData(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to save customer.')
    }
  }

  const handleEdit = (customer) => {
    clearMessages()
    setEditingId(customer.user_id)
    setForm({
      full_name: customer.full_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
    })
    setShowForm(true)
  }

  const handleDeactivate = async (customerId) => {
    clearMessages()

    if (!window.confirm('Are you sure you want to deactivate this customer account?')) {
      return
    }

    try {
      await deactivateCustomer(customerId)
      setSuccess('Customer deactivated successfully.')
      fetchCustomerData(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to deactivate customer.')
    }
  }

  const handleReactivate = async (customerId) => {
    clearMessages()

    try {
      await reactivateCustomer(customerId)
      setSuccess('Customer reactivated successfully.')
      fetchCustomerData(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to reactivate customer.')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project</p>
        <nav>
          <a href="#module-1" className="nav-item">
            Module 1: Categories
          </a>
          <a href="#module-2" className="nav-item">
            Module 2: Orders
          </a>
          <a href="#module-3" className="nav-item active">
            Module 3: Customers
          </a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header-card">
          <div>
            <p className="eyebrow">Module 3</p>
            <h2>Customer Management Dashboard</h2>
            <p className="subtitle">
              Add, update, and manage customer accounts with real-time status tracking and account deactivation support.
            </p>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Total Customers</span>
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
          {!showForm ? (
            <article className="card form-card">
              <h3>Add Customer</h3>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
              >
                + Add New Customer
              </button>
            </article>
          ) : (
            <article className="card form-card">
              <h3>{editingId ? 'Update Customer' : 'Add New Customer'}</h3>
              <form onSubmit={handleSubmit}>
                <label htmlFor="full_name">Customer Name</label>
                <input
                  id="full_name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="John Doe"
                />

                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="customer@example.com"
                />

                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleInputChange}
                  maxLength={15}
                  placeholder="+1 (555) 123-4567"
                />

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Save Changes' : 'Add Customer'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </article>
          )}

          <article className="card table-card full-width">
            <div className="table-toolbar">
              <h3>Customer Dashboard</h3>
              <div className="filter-group">
                <label htmlFor="status-filter">Filter by Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => {
                    const nextFilter = event.target.value
                    setStatusFilter(nextFilter)
                    fetchCustomerData(nextFilter)
                  }}
                >
                  <option value="all">All Customers</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {error ? <p className="message error">{error}</p> : null}
            {success ? <p className="message success">{success}</p> : null}

            {loading ? (
              <p className="message">Loading customers...</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No customers found.
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr key={customer.user_id}>
                          <td>#{customer.user_id}</td>
                          <td>{customer.full_name}</td>
                          <td>{customer.email}</td>
                          <td>{customer.phone || '-'}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                Number(customer.status) === 1 ? 'active' : 'inactive'
                              }`}
                            >
                              {Number(customer.status) === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="date-cell">{formatDate(customer.created_at)}</td>
                          <td className="action-cell">
                            <button 
                              className="btn btn-inline"
                              onClick={() => handleEdit(customer)}
                            >
                              Edit
                            </button>
                            {Number(customer.status) === 1 ? (
                              <button
                                className="btn btn-inline danger"
                                onClick={() => handleDeactivate(customer.user_id)}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                className="btn btn-inline"
                                onClick={() => handleReactivate(customer.user_id)}
                              >
                                Reactivate
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

export default CustomerManagement
