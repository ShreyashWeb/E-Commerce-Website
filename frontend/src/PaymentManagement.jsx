import { useEffect, useState } from 'react'
import { getPayments, processPayment, refundPayment } from './api'
import './PaymentManagement.css'

function PaymentManagement({ onNavigate }) {
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    failed: 0,
    refunded: 0,
    collected_amount: 0,
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    order_id: '',
    payment_method: 'credit_card',
    amount: '',
    payment_gateway: 'simulated_gateway',
  })

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const fetchPayments = async (filter = 'all') => {
    try {
      setLoading(true)
      const params = filter === 'all' ? {} : { payment_status: filter }
      const response = await getPayments(params)
      setPayments(response.data)
      setStats(response.stats)
      setError('')
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load payments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleProcessPayment = async (event) => {
    event.preventDefault()
    clearMessages()

    if (!form.order_id.trim()) {
      setError('Order ID is required.')
      return
    }

    try {
      await processPayment({
        order_id: Number(form.order_id),
        payment_method: form.payment_method,
        amount: form.amount ? Number(form.amount) : undefined,
        payment_gateway: form.payment_gateway,
      })
      setSuccess('Payment processed successfully.')
      setForm({
        order_id: '',
        payment_method: 'credit_card',
        amount: '',
        payment_gateway: 'simulated_gateway',
      })
      fetchPayments(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to process payment.')
    }
  }

  const handleRefund = async (paymentId) => {
    clearMessages()

    if (!window.confirm('Issue refund for this payment?')) {
      return
    }

    try {
      await refundPayment(paymentId)
      setSuccess('Refund processed successfully.')
      fetchPayments(statusFilter)
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to refund payment.')
    }
  }

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const toLabel = (value) => String(value).replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <div className="page-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <h1 className="brand-title">Ecommerce Admin Panel</h1>
        <p className="brand-subtitle">Internship Project - Module 4</p>
        <nav>
          <button
            className="nav-item active"
            onClick={() => onNavigate?.('payments')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 4: Payments
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
            onClick={() => onNavigate?.('categories')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 1: Categories
          </button>
          <button
            className="nav-item"
            onClick={() => onNavigate?.('carts')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            Module 5: Cart
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header-card">
          <div>
            <p className="eyebrow">Module 4</p>
            <h2>Payment Management Dashboard</h2>
            <p className="subtitle">
              Process order payments, monitor transaction history, and issue refunds for cancelled orders.
            </p>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Total Transactions</span>
              <strong>{stats.total}</strong>
            </article>
            <article className="stat-card">
              <span>Paid</span>
              <strong>{stats.paid}</strong>
            </article>
            <article className="stat-card">
              <span>Refunded</span>
              <strong>{stats.refunded}</strong>
            </article>
            <article className="stat-card">
              <span>Collected</span>
              <strong>{formatCurrency(stats.collected_amount)}</strong>
            </article>
          </div>
        </header>

        <section className="content-grid">
          <article className="card form-card">
            <h3>Process Payment</h3>
            <form onSubmit={handleProcessPayment}>
              <label htmlFor="order_id">Order ID</label>
              <input
                id="order_id"
                name="order_id"
                value={form.order_id}
                onChange={handleInputChange}
                placeholder="Example: 1"
              />

              <label htmlFor="payment_method">Payment Method</label>
              <select
                id="payment_method"
                name="payment_method"
                value={form.payment_method}
                onChange={handleInputChange}
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>

              <label htmlFor="amount">Amount (optional)</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={handleInputChange}
                placeholder="Leave blank to use order total"
              />

              <label htmlFor="payment_gateway">Gateway</label>
              <input
                id="payment_gateway"
                name="payment_gateway"
                value={form.payment_gateway}
                onChange={handleInputChange}
              />

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Process Payment</button>
              </div>
            </form>
          </article>

          <article className="card table-card full-width">
            <div className="table-toolbar">
              <h3>Payment Dashboard</h3>
              <div className="filter-group">
                <label htmlFor="status-filter">Filter by Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => {
                    const nextFilter = event.target.value
                    setStatusFilter(nextFilter)
                    fetchPayments(nextFilter)
                  }}
                >
                  <option value="all">All Transactions</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {error ? <p className="message error">{error}</p> : null}
            {success ? <p className="message success">{success}</p> : null}

            {loading ? (
              <p className="message">Loading payments...</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Gateway</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center">No transactions found.</td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.payment_id}>
                          <td>#{payment.payment_id}</td>
                          <td>#{payment.order_id}</td>
                          <td>{payment.full_name}</td>
                          <td>{toLabel(payment.payment_method)}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>
                            <span className={`status-pill ${payment.payment_status}`}>
                              {toLabel(payment.payment_status)}
                            </span>
                          </td>
                          <td>{payment.payment_gateway}</td>
                          <td className="date-cell">{formatDate(payment.created_at)}</td>
                          <td className="action-cell">
                            {payment.payment_status === 'paid' ? (
                              <button
                                className="btn btn-inline danger"
                                onClick={() => handleRefund(payment.payment_id)}
                              >
                                Refund
                              </button>
                            ) : (
                              <span className="muted-text">No action</span>
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

export default PaymentManagement
