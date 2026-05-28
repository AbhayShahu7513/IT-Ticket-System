// src/App.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
const API_BASE_URL = 'https://paradise-selling-tier-observation.trycloudflare.com';

// Icon components (inline SVG – same as original)
const Icon = ({ path, size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={path} />
  </svg>
);

const Icons = {
  Building: () => <Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
  User: () => <Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />,
  Tag: () => <Icon path="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01" />,
  FileText: () => <Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />,
  AlertTriangle: () => <Icon path="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01" />,
  Upload: () => <Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />,
  Check: () => <Icon path="M20 6L9 17l-5-5" />,
  AlertCircle: () => <Icon path="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01" />,
  Copy: () => <Icon path="M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />,
  CheckSquare: () => <Icon path="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  Image: () => <Icon path="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21" />,
  Send: () => <Icon path="M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z" />,
};

function App() {
  // Dynamic dropdown states
  const [companyOptions, setCompanyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    your_name: '',
    department: '',
    issue_category: '',
    issue_description: '',
    priority: 'Medium',
    company: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch dropdown options from backend on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [companiesRes, departmentsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/companies/`),
          axios.get(`${API_BASE_URL}/api/departments/`),
          axios.get(`${API_BASE_URL}/api/categories/`),
        ]);

        const companies = companiesRes.data.map(c => c.name);
        const departments = departmentsRes.data.map(d => d.name);
        const categories = categoriesRes.data.map(cat => cat.name);

        setCompanyOptions(companies);
        setDepartmentOptions(departments);
        setCategoryOptions(categories);

        // Set default selections (first active option if available)
        if (companies.length) setFormData(prev => ({ ...prev, company: companies[0] }));
        if (departments.length) setFormData(prev => ({ ...prev, department: departments[0] }));
        if (categories.length) setFormData(prev => ({ ...prev, issue_category: categories[0] }));

        setOptionsLoaded(true);
      } catch (err) {
        console.error('Failed to load dropdown options:', err);
        setErrorMsg('Could not load form options. Please refresh the page.');
        setOptionsLoaded(true); // still show form but with empty selects
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setErrorMsg('');
    }
  };

  const resetForm = () => {
    setFormData({
      your_name: '',
      department: departmentOptions[0] || '',
      issue_category: categoryOptions[0] || '',
      issue_description: '',
      priority: 'Medium',
      company: companyOptions[0] || '',
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyTicketNumber = () => {
    if (ticketNumber) {
      navigator.clipboard.writeText(ticketNumber);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setTicketNumber('');
    setCopySuccess(false);

    const data = new FormData();
    data.append('your_name', formData.your_name);
    data.append('department', formData.department);
    data.append('issue_category', formData.issue_category);
    data.append('issue_description', formData.issue_description);
    data.append('priority', formData.priority);
    data.append('company', formData.company);
    if (imageFile) data.append('issue_image', imageFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/tickets/create/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Ticket created successfully! Our support team will reach out shortly.');
      setTicketNumber(response.data.ticket_no);
      resetForm();
    } catch (err) {
      console.error(err);
      let errorDetail = 'Submission failed. Please check your connection and try again.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object') {
          errorDetail = JSON.stringify(err.response.data);
        } else {
          errorDetail = err.response.data;
        }
      }
      setErrorMsg(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while fetching options
  if (!optionsLoaded) {
    return (
      <div className="loading-screen">
        <div className="glass-loader">
          <div className="spinner"></div>
          <p>Loading secure portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Animated Background Elements */}
      <div className="gradient-bg">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-3"></div>
      </div>
      
      <div className="content-wrapper">
        <div className="page-container">
          {/* Page Header with inline SVG logo – no external file needed */}
          <div className="page-header">
            <div className="logo-area">
              <div className="custom-logo">
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" rx="24" fill="url(#grad)" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <text x="50" y="68" textAnchor="middle" fill="white" fontSize="48" fontFamily="Arial, sans-serif" fontWeight="bold">C</text>
                </svg>
              </div>
              <div className="logo-text">
                <h1 className="font-display">Comptech Support</h1>
                
              </div>
            </div>
            <p className="page-sub">
              <span>⚡ Fast & Reliable IT Help Desk</span>
              <span className="dot-divider"></span>
              <span>📱 Enterprise-grade security</span>
            </p>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="alert alert-success">
              <div className="alert-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a8c5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <div className="alert-title">Ticket submitted!</div>
                <div className="alert-body">{successMsg}</div>
                {ticketNumber && (
                  <div className="ticket-number-row">
                    <span className="ticket-label">Your ticket:</span>
                    <span className="ticket-number">{ticketNumber}</span>
                    <button className="copy-btn" onClick={copyTicketNumber}>
                      {copySuccess
                        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
                      }
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-error">
              <div className="alert-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <div className="alert-title">Submission error</div>
                <div className="alert-body">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Main Glass Card */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="header-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h2>New Support Ticket</h2>
              </div>
              <span className="urgent-badge">⚡ Priority tracking</span>
            </div>

            <form onSubmit={handleSubmit} className="form-body">
              {/* Section: Contact Info */}
              <div className="form-section-label">Contact information</div>
              <div className="form-grid">
                <div className="input-group">
                  <label className="field-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="your_name"
                    required
                    value={formData.your_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. John Carter"
                  />
                </div>

                <div className="input-group">
                  <label className="field-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    Company <span className="req">*</span>
                  </label>
                  <select name="company" required value={formData.company} onChange={handleChange} className="form-select">
                    {companyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label className="field-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Department <span className="req">*</span>
                  </label>
                  <select name="department" required value={formData.department} onChange={handleChange} className="form-select">
                    {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label className="field-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    Issue Category <span className="req">*</span>
                  </label>
                  <select name="issue_category" required value={formData.issue_category} onChange={handleChange} className="form-select">
                    {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {/* Section: Issue Details */}
              <div className="form-section-label">Issue details</div>

              <div className="input-group">
                <label className="field-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Priority Level <span className="req">*</span>
                </label>
                <div className="priority-group">
                  {[
                    { label: 'High', dotClass: 'dot-high', activeClass: 'active-high' },
                    { label: 'Medium', dotClass: 'dot-medium', activeClass: 'active-medium' },
                    { label: 'Low', dotClass: 'dot-low', activeClass: 'active-low' },
                  ].map(({ label, dotClass, activeClass }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, priority: label }))}
                      className={`priority-btn ${formData.priority === label ? activeClass : ''}`}
                    >
                      <span className={`priority-dot ${dotClass}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Issue Description <span className="req">*</span>
                </label>
                <textarea
                  name="issue_description"
                  rows="4"
                  required
                  value={formData.issue_description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Describe your technical issue in as much detail as possible — what happened, when, and any error messages you saw..."
                />
              </div>

              <div className="input-group">
                <label className="field-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Screenshot / Image
                  <span className="optional-badge">Optional</span>
                </label>

                <label className="upload-zone" style={{ display: imagePreview ? 'none' : 'flex' }}>
                  <div className="upload-icon-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16"/>
                      <line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                  </div>
                  <div>
                    <div className="upload-text-primary">Click to upload an image</div>
                    <div className="upload-text-secondary">PNG, JPG, GIF up to 5MB</div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {imagePreview && (
                  <div className="preview-container">
                    <div className="preview-wrap">
                      <img src={imagePreview} alt="Preview" className="preview-img" />
                      <button
                        type="button"
                        className="preview-remove"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >×</button>
                    </div>
                    <div className="preview-info">
                      <span className="preview-name">{imageFile?.name}</span>
                      <span className="preview-size">{imageFile ? (imageFile.size / 1024).toFixed(0) + ' KB' : ''}</span>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? (
                  <><div className="spinner" /> Processing…</>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="page-footer">
            <p>© {new Date().getFullYear()} Comptech — Empowering your workflow with next-gen IT support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;