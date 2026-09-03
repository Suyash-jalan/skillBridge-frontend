import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './index.css'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const STEPS = [
  { icon: '📄', label: 'Reading Document', sub: 'Parsing resume file content…' },
  { icon: '🔍', label: 'Extracting Profile', sub: 'Identifying skills, experience & credentials…' },
  { icon: '🎯', label: 'Analyzing Role Fits', sub: 'Evaluating market fit and skill gaps…' },
  { icon: '🚀', label: 'Building Career Roadmap', sub: 'Crafting high-ROI upskilling strategy…' },
]

/* ─────────────────────────────────────────────────────────────
   EXTRACTED PROFILE TAB COMPONENT
───────────────────────────────────────────────────────────── */
function ExtractedProfileView({ rawJson }) {
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)

  let data = null
  try {
    const cleaned = rawJson.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    data = JSON.parse(cleaned)
  } catch (_) {
    data = null
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!data || showRaw) {
    return (
      <div className="json-container">
        <div className="json-toolbar">
          <span className="json-label">Raw JSON Schema</span>
          <div className="json-actions">
            {data && (
              <button className="btn-glass-sm" onClick={() => setShowRaw(false)}>
                Visual Cards View
              </button>
            )}
            <button className="btn-glass-sm" onClick={handleCopy}>
              {copied ? '✓ Copied' : '📋 Copy JSON'}
            </button>
          </div>
        </div>
        <div className="code-box">
          <pre>{data ? JSON.stringify(data, null, 2) : rawJson}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-view">
      <div className="profile-top-bar">
        <span className="section-eyebrow">Structured Candidate Profile</span>
        <div className="profile-actions">
          <button className="btn-glass-sm" onClick={() => setShowRaw(true)}>
            &lt;/&gt; View Raw JSON
          </button>
          <button className="btn-glass-sm" onClick={handleCopy}>
            {copied ? '✓ Copied' : '📋 Copy JSON'}
          </button>
        </div>
      </div>

      {/* Candidate Header Card */}
      <div className="candidate-card">
        <div className="candidate-avatar">
          {data.full_name ? data.full_name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div className="candidate-info">
          <div className="candidate-name-row">
            <h3 className="candidate-name">{data.full_name || 'Candidate Profile'}</h3>
            {data.years_of_experience != null && (
              <span className="exp-badge">
                💼 {data.years_of_experience} {data.years_of_experience === 1 ? 'Year' : 'Years'} Exp
              </span>
            )}
          </div>
          {data.contact && (
            <div className="contact-tags">
              {data.contact.email && <span className="c-tag">✉ {data.contact.email}</span>}
              {data.contact.phone && <span className="c-tag">📞 {data.contact.phone}</span>}
              {data.contact.location && <span className="c-tag">📍 {data.contact.location}</span>}
              {data.contact.linkedin && <span className="c-tag">🔗 LinkedIn</span>}
              {data.contact.github && <span className="c-tag">💻 GitHub</span>}
            </div>
          )}
          {data.summary && <p className="candidate-summary">{data.summary}</p>}
        </div>
      </div>

      {/* Skills Section */}
      {Array.isArray(data.skills) && data.skills.length > 0 && (
        <div className="profile-section">
          <h4 className="section-title">
            <span className="section-icon">⚡</span> Extracted Skills ({data.skills.length})
          </h4>
          <div className="skill-pills-grid">
            {data.skills.map((skill, i) => (
              <span key={i} className="skill-pill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience Timeline */}
      {Array.isArray(data.experience) && data.experience.length > 0 && (
        <div className="profile-section">
          <h4 className="section-title">
            <span className="section-icon">💼</span> Work Experience
          </h4>
          <div className="timeline-list">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-bullet" />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h5 className="timeline-role">{exp.role || 'Position'}</h5>
                    {exp.duration && <span className="timeline-duration">{exp.duration}</span>}
                  </div>
                  {exp.company && <div className="timeline-company">{exp.company}</div>}
                  {Array.isArray(exp.highlights) && exp.highlights.length > 0 && (
                    <ul className="timeline-highlights">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Projects Grid */}
      <div className="profile-grid-cols">
        {/* Education */}
        {Array.isArray(data.education) && data.education.length > 0 && (
          <div className="profile-section">
            <h4 className="section-title">
              <span className="section-icon">🎓</span> Education
            </h4>
            <div className="mini-cards-list">
              {data.education.map((edu, idx) => (
                <div key={idx} className="mini-card">
                  <div className="mini-card-title">{edu.degree}</div>
                  <div className="mini-card-sub">{edu.institution}</div>
                  {edu.year && <span className="mini-card-badge">{edu.year}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {Array.isArray(data.projects) && data.projects.length > 0 && (
          <div className="profile-section">
            <h4 className="section-title">
              <span className="section-icon">🛠</span> Key Projects
            </h4>
            <div className="mini-cards-list">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="mini-card">
                  <div className="mini-card-title">{proj.name}</div>
                  {proj.description && <p className="mini-card-desc">{proj.description}</p>}
                  {Array.isArray(proj.tech_stack) && proj.tech_stack.length > 0 && (
                    <div className="mini-card-tags">
                      {proj.tech_stack.map((t, tIdx) => (
                        <span key={tIdx} className="mini-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {data.parse_warning && (
        <div className="parse-warning-box">
          ⚠️ <strong>Notice:</strong> {data.parse_warning}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HOME / UPLOAD VIEW (FRAMER-STYLE FROSTED CARD)
───────────────────────────────────────────────────────────── */
function HomeView({ onAnalyze }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

  const onDrop = useCallback((accepted) => {
    if (accepted && accepted[0]) {
      setFile(accepted[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    noClick: !!file,
  })

  const handleStart = () => {
    if (!file || busy) return
    setBusy(true)
    onAnalyze(file)
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setFile(null)
  }

  return (
    <div className="home-container">
      {/* Top Floating Badge */}
      <div className="top-pill-badge">
        <span className="badge-sparkle">✦</span>
        <span>Role Intelligence AI</span>
      </div>

      {/* Big Hero Heading */}
      <h1 className="hero-headline">Role Gap Analysis!</h1>

      {/* Central Frosted Glass Card */}
      <div className="frosted-glass-card">
        <h2 className="card-heading">Analyze your resume!</h2>
        <p className="card-subtext">
          Upload your .docx resume to extract core competencies, match targeted industry roles,
          and generate a 12-week upskilling roadmap.
        </p>

        {/* Dropzone / Input inside Card */}
        <div
          {...getRootProps()}
          className={`glass-input-wrapper ${isDragActive ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        >
          <input {...getInputProps()} id="resume-input-field" />

          {!file ? (
            <div className="pill-input-box" onClick={open}>
              <span className="pill-input-placeholder">
                {isDragActive ? 'Drop your resume file here…' : 'Click to select or drop resume (.docx)'}
              </span>
              <button type="button" className="btn-pill-white">
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="pill-file-ready">
              <div className="pill-file-info">
                <span className="file-icon">📄</span>
                <span className="file-name" title={file.name}>{file.name}</span>
                <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="pill-file-actions">
                <button type="button" className="btn-change-file" onClick={handleRemoveFile}>
                  Change
                </button>
                <button
                  id="analyze-submit-btn"
                  type="button"
                  className="btn-pill-white glowing"
                  onClick={handleStart}
                  disabled={busy}
                >
                  {busy ? 'Analyzing…' : 'Analyze Now ✦'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Social / Feature Icons Footer */}
      <div className="bottom-icon-strip">
        <div className="icon-pill" title="Groq AI Engine Active">
          <span>⚡ Groq Llama3 Engine</span>
        </div>
        <div className="icon-pill" title="Instant Extraction">
          <span>🔍 Deep Extraction</span>
        </div>
        <div className="icon-pill" title="12-Week Roadmap">
          <span>🚀 Career Roadmap</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   LOADING PIPELINE VIEW
───────────────────────────────────────────────────────────── */
function LoadingView({ currentStep, message, isRateLimited }) {
  return (
    <div className="loading-container">
      <div className="frosted-glass-card loading-card">
        <div className="loading-orb-wrap">
          <div className="loading-pulse-orb" />
          <span className="orb-center-icon">✦</span>
        </div>

        <h2 className="card-heading">Analyzing Resume Pipeline</h2>
        <p className="card-subtext">Multi-agent intelligence system executing sequential analysis.</p>

        <div className="stepper-list">
          {STEPS.map((step, i) => {
            const status = i < currentStep ? 'completed' : i === currentStep ? 'active' : 'queued'
            return (
              <div key={step.label} className={`stepper-item ${status}`}>
                <div className="stepper-badge">
                  {status === 'completed' ? '✓' : status === 'active' ? '⚡' : i + 1}
                </div>
                <div className="stepper-text">
                  <div className="stepper-label">{step.label}</div>
                  <div className="stepper-sub">
                    {status === 'active' ? (message || step.sub) : step.sub}
                  </div>
                </div>
                <span className={`stepper-pill ${status}`}>
                  {status === 'completed' ? 'Done' : status === 'active' ? 'Running' : 'Waiting'}
                </span>
              </div>
            )
          })}
        </div>

        {isRateLimited && (
          <div className="rate-limit-card">
            <span className="rl-icon">⏳</span>
            <div>
              <strong>API Rate Limit Buffer</strong>
              <p>Replenishing API tokens — auto-retrying in ~40 seconds…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   RESULTS VIEW
───────────────────────────────────────────────────────────── */
function ResultsView({ results, fileName, onReset }) {
  const [activeTab, setActiveTab] = useState('advice')
  const [copied, setCopied] = useState(false)

  const tabs = [
    { id: 'advice',   label: '🚀 Career Roadmap' },
    { id: 'analysis', label: '🎯 Skills Gap & Fit' },
    { id: 'extract',  label: '📋 Extracted Profile' },
  ]

  const getActiveContent = () => {
    if (activeTab === 'advice') return results.advice
    if (activeTab === 'analysis') return results.analysis
    return results.extract
  }

  const handleCopyActive = () => {
    navigator.clipboard.writeText(getActiveContent() || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="results-container">
      {/* Top Header Bar */}
      <div className="results-header-bar">
        <div className="results-title-group">
          <div className="top-pill-badge sm">
            <span>✦ Analysis Dossier</span>
          </div>
          <h2 className="results-main-title">Career Intelligence Results</h2>
          {fileName && <span className="results-filename">Source: {fileName}</span>}
        </div>

        <div className="results-actions-group">
          <button className="btn-glass-sm" onClick={handleCopyActive}>
            {copied ? '✓ Copied' : '📋 Copy Text'}
          </button>
          <button id="reset-analysis-btn" className="btn-pill-white sm" onClick={onReset}>
            ↩ New Analysis
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="framer-tabs-strip">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-btn-${t.id}`}
            className={`framer-tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Display Panel */}
      <div className="frosted-glass-card results-card">
        {activeTab === 'extract' ? (
          <ExtractedProfileView rawJson={results.extract} />
        ) : (
          <div className="markdown-prose-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activeTab === 'advice' ? results.advice : results.analysis}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ROOT APPLICATION
───────────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState('home') // 'home' | 'loading' | 'results' | 'error'
  const [step, setStep] = useState(0)
  const [msg, setMsg] = useState('')
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [results, setResults] = useState(null)
  const [activeFileName, setActiveFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)

  const handleAnalyze = async (file) => {
    setActiveFileName(file.name)
    setView('loading')
    setStep(0)
    setMsg('')
    setIsRateLimited(false)
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }))
        throw new Error(errorData.detail || 'Server encountered an error while processing.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)
            if (event.type === 'progress') {
              setStep(event.step)
              setMsg(event.message)
              setIsRateLimited(event.message?.toLowerCase().includes('retry') ?? false)
            } else if (event.type === 'result') {
              setResults({
                extract: event.extract,
                analysis: event.analysis,
                advice: event.advice,
              })
              setView('results')
            } else if (event.type === 'error') {
              throw new Error(event.message)
            }
          } catch (_) {
            // ignore partial json chunk parse errors
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message)
      setView('error')
    }
  }

  const handleReset = () => {
    setView('home')
    setResults(null)
    setErrorMsg(null)
    setStep(0)
    setMsg('')
    setActiveFileName('')
  }

  return (
    <div className="app-shell">
      {/* Minimal Top-Fade Gradient Overlay */}
      <div className="ambient-canvas">
        <div className="top-fade-gradient" />
      </div>

      {/* Minimal Top Brand Bar */}
      <header className="minimal-topbar">
        <div className="brand-pill" onClick={handleReset}>
          <span className="brand-icon">✦</span>
          <span className="brand-title">CareerLens</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main-viewport">
        {view === 'home' && <HomeView onAnalyze={handleAnalyze} />}

        {view === 'loading' && (
          <LoadingView
            currentStep={step}
            message={msg}
            isRateLimited={isRateLimited}
          />
        )}

        {view === 'results' && (
          <ResultsView
            results={results}
            fileName={activeFileName}
            onReset={handleReset}
          />
        )}

        {view === 'error' && (
          <div className="error-screen-container">
            <div className="frosted-glass-card error-card">
              <span className="error-icon">⚠️</span>
              <div className="error-text-content">
                <h3 className="error-title">Analysis Error</h3>
                <p className="error-description">{errorMsg}</p>
              </div>
              <button className="btn-pill-white" onClick={handleReset}>
                ↩ Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Huge Outline Text Watermark at the Bottom */}
      <div className="bg-watermark">
        <span>CAREER LENS</span>
      </div>

      {/* Footer */}
      <footer className="minimal-footer">
        <span>© 2026 CareerLens AI Engine · Role Analysis Template</span>
      </footer>
    </div>
  )
}
