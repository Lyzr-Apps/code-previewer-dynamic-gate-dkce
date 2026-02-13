'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { VscCode, VscDesktopDownload, VscTrash, VscSend, VscCopy, VscCheck } from 'react-icons/vsc'
import { FiMonitor, FiTablet, FiSmartphone, FiPlus, FiEye, FiTerminal } from 'react-icons/fi'

// --- Constants ---
const AGENT_ID = '698f00f24fde97bfe1d6bc32'

// --- Types ---
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  code?: string
  timestamp: number
}

// --- Sample Data ---
const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: 'sample-1',
    role: 'user',
    content: 'Create a modern landing page for a SaaS product called "CloudSync" with a hero section, features grid, and pricing cards.',
    timestamp: Date.now() - 60000,
  },
  {
    id: 'sample-2',
    role: 'assistant',
    content: 'I have created a modern landing page for CloudSync with a gradient hero section featuring a headline and CTA buttons, a 3-column features grid with icons, and a pricing section with three tiered cards (Free, Pro, Enterprise). The design uses a clean blue-to-purple color scheme with responsive layout.',
    code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>CloudSync - Modern SaaS Landing Page</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { font-family: system-ui, -apple-system, sans-serif; color: #1a1a2e; }\n    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center; }\n    .hero h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 20px; }\n    .hero p { font-size: 1.25rem; opacity: 0.9; max-width: 600px; margin: 0 auto 40px; }\n    .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }\n    .btn:hover { transform: translateY(-2px); }\n    .btn-primary { background: white; color: #667eea; }\n    .btn-secondary { background: transparent; color: white; border: 2px solid white; margin-left: 16px; }\n    .features { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }\n    .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 60px; }\n    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }\n    .feature-card { padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; }\n    .feature-card .icon { font-size: 2.5rem; margin-bottom: 16px; }\n    .feature-card h3 { font-size: 1.25rem; margin-bottom: 12px; }\n    .feature-card p { color: #64748b; line-height: 1.6; }\n    .pricing { padding: 80px 20px; background: #f8fafc; }\n    .pricing h2 { text-align: center; font-size: 2.5rem; margin-bottom: 60px; }\n    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; max-width: 1000px; margin: 0 auto; }\n    .price-card { background: white; padding: 40px 32px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }\n    .price-card.featured { border: 2px solid #667eea; position: relative; }\n    .price-card .price { font-size: 3rem; font-weight: 800; color: #667eea; }\n    .price-card .period { color: #94a3b8; }\n    .price-card ul { list-style: none; margin: 24px 0; text-align: left; }\n    .price-card li { padding: 8px 0; color: #475569; }\n    .price-card li::before { content: "\\2713"; color: #667eea; margin-right: 10px; }\n    .price-card .btn-price { display: block; padding: 14px; background: #667eea; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; }\n  </style>\n</head>\n<body>\n  <section class="hero">\n    <h1>CloudSync</h1>\n    <p>Seamlessly sync your data across all devices with enterprise-grade security and lightning-fast performance.</p>\n    <a href="#" class="btn btn-primary">Get Started Free</a>\n    <a href="#" class="btn btn-secondary">Watch Demo</a>\n  </section>\n  <section class="features">\n    <h2>Why CloudSync?</h2>\n    <div class="features-grid">\n      <div class="feature-card">\n        <div class="icon">&#9889;</div>\n        <h3>Lightning Fast</h3>\n        <p>Sub-millisecond sync times powered by our global edge network.</p>\n      </div>\n      <div class="feature-card">\n        <div class="icon">&#128274;</div>\n        <h3>Enterprise Security</h3>\n        <p>End-to-end encryption with SOC 2 Type II compliance.</p>\n      </div>\n      <div class="feature-card">\n        <div class="icon">&#128640;</div>\n        <h3>Scale Infinitely</h3>\n        <p>From startup to enterprise, grow without limits.</p>\n      </div>\n    </div>\n  </section>\n  <section class="pricing">\n    <h2>Simple Pricing</h2>\n    <div class="pricing-grid">\n      <div class="price-card">\n        <h3>Free</h3>\n        <div class="price">$0<span class="period">/mo</span></div>\n        <ul>\n          <li>5 GB Storage</li>\n          <li>2 Devices</li>\n          <li>Basic Support</li>\n        </ul>\n        <a href="#" class="btn-price">Start Free</a>\n      </div>\n      <div class="price-card featured">\n        <h3>Pro</h3>\n        <div class="price">$12<span class="period">/mo</span></div>\n        <ul>\n          <li>100 GB Storage</li>\n          <li>Unlimited Devices</li>\n          <li>Priority Support</li>\n          <li>Advanced Analytics</li>\n        </ul>\n        <a href="#" class="btn-price">Start Pro Trial</a>\n      </div>\n      <div class="price-card">\n        <h3>Enterprise</h3>\n        <div class="price">$49<span class="period">/mo</span></div>\n        <ul>\n          <li>Unlimited Storage</li>\n          <li>Unlimited Devices</li>\n          <li>24/7 Support</li>\n          <li>Custom Integrations</li>\n          <li>SLA Guarantee</li>\n        </ul>\n        <a href="#" class="btn-price">Contact Sales</a>\n      </div>\n    </div>\n  </section>\n</body>\n</html>',
    timestamp: Date.now() - 30000,
  },
  {
    id: 'sample-3',
    role: 'user',
    content: 'Add a testimonials section between features and pricing with 3 customer quotes.',
    timestamp: Date.now() - 20000,
  },
  {
    id: 'sample-4',
    role: 'assistant',
    content: 'I have added a testimonials section with 3 customer quotes, each displayed in a card with the customer\'s avatar, name, role, and a star rating. The section sits between the features and pricing sections with a subtle background contrast.',
    code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>CloudSync</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { font-family: system-ui, sans-serif; color: #1a1a2e; }\n    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center; }\n    .hero h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 20px; }\n    .hero p { font-size: 1.25rem; opacity: 0.9; max-width: 600px; margin: 0 auto 40px; }\n    .testimonials { padding: 80px 20px; background: #f0f4ff; }\n    .testimonials h2 { text-align: center; font-size: 2.5rem; margin-bottom: 60px; }\n    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; max-width: 1100px; margin: 0 auto; }\n    .testimonial-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }\n    .testimonial-card p { font-style: italic; color: #475569; line-height: 1.7; margin-bottom: 20px; }\n    .testimonial-card .author { font-weight: 700; }\n    .testimonial-card .role { color: #94a3b8; font-size: 0.9rem; }\n    .stars { color: #f59e0b; margin-bottom: 12px; }\n  </style>\n</head>\n<body>\n  <section class="hero"><h1>CloudSync</h1><p>Seamlessly sync your data everywhere.</p></section>\n  <section class="testimonials">\n    <h2>What Our Customers Say</h2>\n    <div class="testimonials-grid">\n      <div class="testimonial-card">\n        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>\n        <p>"CloudSync transformed how our team collaborates. We went from hours of manual syncing to real-time updates across all devices."</p>\n        <div class="author">Sarah Chen</div>\n        <div class="role">CTO, TechFlow Inc.</div>\n      </div>\n      <div class="testimonial-card">\n        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>\n        <p>"The security features give us peace of mind. SOC 2 compliance was a must for our enterprise clients, and CloudSync delivers."</p>\n        <div class="author">Marcus Johnson</div>\n        <div class="role">VP Engineering, DataScale</div>\n      </div>\n      <div class="testimonial-card">\n        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>\n        <p>"We scaled from 100 to 10,000 users without a hiccup. The performance is incredible even under heavy load."</p>\n        <div class="author">Priya Patel</div>\n        <div class="role">Head of IT, GlobalRetail</div>\n      </div>\n    </div>\n  </section>\n</body>\n</html>',
    timestamp: Date.now() - 10000,
  },
]

// --- Markdown Renderer ---
function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h4 key={i} className="font-semibold text-sm mt-2 mb-1">
              {line.slice(4)}
            </h4>
          )
        if (line.startsWith('## '))
          return (
            <h3 key={i} className="font-semibold text-base mt-2 mb-1">
              {line.slice(3)}
            </h3>
          )
        if (line.startsWith('# '))
          return (
            <h2 key={i} className="font-bold text-lg mt-3 mb-1">
              {line.slice(2)}
            </h2>
          )
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <li key={i} className="ml-4 list-disc text-sm">
              {formatInline(line.slice(2))}
            </li>
          )
        if (/^\d+\.\s/.test(line))
          return (
            <li key={i} className="ml-4 list-decimal text-sm">
              {formatInline(line.replace(/^\d+\.\s/, ''))}
            </li>
          )
        if (!line.trim()) return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-sm leading-relaxed">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

// --- Typing Indicator ---
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-7 h-7 bg-accent flex items-center justify-center flex-shrink-0">
        <FiTerminal className="w-3.5 h-3.5 text-accent-foreground" />
      </div>
      <div className="bg-card border border-border px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="ml-2 text-xs text-muted-foreground font-mono">generating...</span>
        </div>
      </div>
    </div>
  )
}

// --- Chat Message Component ---
function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 py-2`}>
      {!isUser && (
        <div className="w-7 h-7 bg-accent flex items-center justify-center flex-shrink-0 mr-3 mt-1">
          <FiTerminal className="w-3.5 h-3.5 text-accent-foreground" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-card-foreground'} px-4 py-3`}>
        {isUser ? (
          <p className="text-sm leading-relaxed font-mono">{message.content}</p>
        ) : (
          renderMarkdown(message.content)
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 bg-secondary flex items-center justify-center flex-shrink-0 ml-3 mt-1">
          <span className="text-xs font-mono text-secondary-foreground">U</span>
        </div>
      )}
    </div>
  )
}

// --- Empty Preview State ---
function EmptyPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 border-2 border-border flex items-center justify-center mb-6">
        <VscCode className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 font-mono">No Preview Yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">Describe a website in the chat to generate live HTML/CSS. Your creation will appear here.</p>
    </div>
  )
}

// --- Code Viewer ---
function CodeViewer({ code, onCopy, copied }: { code: string; onCopy: () => void; copied: boolean }) {
  const lines = code.split('\n')

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <span className="text-xs text-muted-foreground font-mono">index.html</span>
        <Button variant="ghost" size="sm" onClick={onCopy} className="h-7 gap-1.5 text-xs font-mono">
          {copied ? <VscCheck className="w-3.5 h-3.5 text-accent" /> : <VscCopy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <pre className="text-xs leading-5 font-mono">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-10 inline-block text-right pr-4 text-muted-foreground select-none flex-shrink-0">{i + 1}</span>
                <span className="text-foreground whitespace-pre-wrap break-all">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </ScrollArea>
    </div>
  )
}

// --- Main Page ---
export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentCode, setCurrentCode] = useState('')
  const [activeTab, setActiveTab] = useState('preview')
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  const [showSampleData, setShowSampleData] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(crypto.randomUUID())
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  // Determine which messages to display
  const displayMessages = showSampleData && messages.length === 0 ? SAMPLE_MESSAGES : messages
  const displayCode = showSampleData && messages.length === 0 ? (SAMPLE_MESSAGES[SAMPLE_MESSAGES.length - 1]?.code ?? '') : currentCode

  const handleSubmit = useCallback(async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isGenerating) return

    setError(null)

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsGenerating(true)
    setActiveAgentId(AGENT_ID)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const result = await callAIAgent(trimmed, AGENT_ID, { session_id: sessionId })

      if (result.success) {
        const agentResult = result?.response?.result

        let parsed = agentResult
        if (typeof agentResult === 'string') {
          try {
            parsed = JSON.parse(agentResult)
          } catch {
            parsed = { description: 'Generated website', code: agentResult }
          }
        }

        const description = parsed?.description ?? ''
        const code = parsed?.code ?? ''

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: description || 'Website generated successfully.',
          code: code,
          timestamp: Date.now(),
        }

        setMessages(prev => [...prev, assistantMessage])

        if (code) {
          setCurrentCode(code)
          setActiveTab('preview')
        }
      } else {
        const errMsg = result?.error ?? result?.response?.message ?? 'Failed to generate website. Please try again.'
        setError(errMsg)
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${errMsg}`,
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (err) {
      const errText = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(errText)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${errText}`,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
      setActiveAgentId(null)
    }
  }, [inputValue, isGenerating, sessionId])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  const handleCopyCode = useCallback(async () => {
    if (!displayCode) return
    const success = await copyToClipboard(displayCode)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [displayCode])

  const handleDownload = useCallback(() => {
    if (!displayCode) return
    const blob = new Blob([displayCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'website.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [displayCode])

  const handleNewProject = useCallback(() => {
    setMessages([])
    setCurrentCode('')
    setInputValue('')
    setError(null)
    setActiveTab('preview')
    setViewport('desktop')
    setSessionId(crypto.randomUUID())
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [])

  const viewportWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px'

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <VscCode className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-bold font-mono tracking-wide text-foreground">WebCraft</h1>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-accent text-accent px-1.5 py-0">AI</Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="sample-toggle" className="text-xs text-muted-foreground font-mono cursor-pointer">Sample Data</label>
            <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} className="scale-75" />
          </div>
          <Button variant="outline" size="sm" onClick={handleNewProject} className="h-7 gap-1.5 text-xs font-mono border-border">
            <FiPlus className="w-3 h-3" />
            New Project
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Chat */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="flex flex-col h-full bg-background">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Chat</span>
                {messages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleNewProject} className="h-6 gap-1 text-[10px] font-mono text-muted-foreground hover:text-destructive">
                    <VscTrash className="w-3 h-3" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="py-4">
                  {displayMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
                      <div className="w-12 h-12 border-2 border-border flex items-center justify-center mb-4">
                        <FiTerminal className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-semibold font-mono text-foreground mb-2">Start Building</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">Describe the website you want to create. The AI will generate complete HTML/CSS code with a live preview.</p>
                      <div className="mt-4 space-y-1.5">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Try something like:</p>
                        <p className="text-xs text-accent font-mono">&quot;A portfolio page with dark theme&quot;</p>
                        <p className="text-xs text-accent font-mono">&quot;A restaurant menu with photos&quot;</p>
                        <p className="text-xs text-accent font-mono">&quot;A pricing page with 3 tiers&quot;</p>
                      </div>
                    </div>
                  ) : (
                    displayMessages.map(msg => (
                      <ChatMessageBubble key={msg.id} message={msg} />
                    ))
                  )}
                  {isGenerating && <TypingIndicator />}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Error Display */}
              {error && (
                <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/30">
                  <p className="text-xs text-destructive font-mono">{error}</p>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-border bg-card p-3">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your website..."
                    disabled={isGenerating}
                    className="flex-1 bg-input text-foreground text-sm font-mono placeholder:text-muted-foreground px-3 py-2.5 border border-border resize-none focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    style={{ minHeight: '44px', maxHeight: '200px' }}
                    rows={1}
                  />
                  <Button onClick={handleSubmit} disabled={isGenerating || !inputValue.trim()} className="h-[44px] w-[44px] p-0 bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0">
                    {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" style={{ borderRadius: '50%' }} />
                    ) : (
                      <VscSend className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground font-mono">Ctrl+Enter to send</span>
                  {isGenerating && <span className="text-[10px] text-accent font-mono animate-pulse">Generating...</span>}
                </div>
              </div>
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle withHandle />

          {/* Right Panel - Preview & Code */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="flex flex-col h-full bg-background">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
                  <TabsList className="h-8 bg-secondary p-0.5">
                    <TabsTrigger value="preview" className="h-7 px-3 text-xs font-mono gap-1.5 data-[state=active]:bg-background">
                      <FiEye className="w-3 h-3" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="h-7 px-3 text-xs font-mono gap-1.5 data-[state=active]:bg-background">
                      <VscCode className="w-3 h-3" />
                      Code
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-1">
                    {/* Viewport Toggles */}
                    <div className="flex items-center border border-border mr-2">
                      <button onClick={() => setViewport('desktop')} className={`p-1.5 transition-colors ${viewport === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`} title="Desktop">
                        <FiMonitor className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setViewport('tablet')} className={`p-1.5 transition-colors border-l border-r border-border ${viewport === 'tablet' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`} title="Tablet">
                        <FiTablet className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setViewport('mobile')} className={`p-1.5 transition-colors ${viewport === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`} title="Mobile">
                        <FiSmartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Actions */}
                    <Button variant="ghost" size="sm" onClick={handleCopyCode} disabled={!displayCode} className="h-7 gap-1 text-xs font-mono">
                      {copied ? <VscCheck className="w-3.5 h-3.5 text-accent" /> : <VscCopy className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!displayCode} className="h-7 gap-1 text-xs font-mono">
                      <VscDesktopDownload className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Preview Content */}
                <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                  {displayCode ? (
                    <div className="h-full flex items-start justify-center bg-secondary p-4 overflow-auto">
                      <div style={{ width: viewportWidth, maxWidth: '100%', height: '100%' }} className="transition-all duration-300 bg-white shadow-sm border border-border">
                        <iframe
                          srcDoc={displayCode}
                          title="Website Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts"
                          style={{ backgroundColor: 'white' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <EmptyPreview />
                  )}
                </TabsContent>

                {/* Code Content */}
                <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                  {displayCode ? (
                    <CodeViewer code={displayCode} onCopy={handleCopyCode} copied={copied} />
                  ) : (
                    <EmptyPreview />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Agent Status Bar */}
      <footer className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 ${activeAgentId ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} style={{ borderRadius: '50%' }} />
            <span className="text-[10px] font-mono text-muted-foreground">
              Website Generator Agent
            </span>
          </div>
          {activeAgentId && (
            <span className="text-[10px] font-mono text-accent">active</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground">
            {displayMessages.length > 0 ? `${displayMessages.length} messages` : 'Ready'}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {viewport}
          </span>
        </div>
      </footer>
    </div>
  )
}
