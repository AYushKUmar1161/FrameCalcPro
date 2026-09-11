import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'

interface FormData {
  fullName: string
  email: string
  phone: string
  projectScope: string
  details: string
}

const initialForm: FormData = {
  fullName: '',
  email: '',
  phone: '',
  projectScope: 'Commercial High-Rise',
  details: '',
}

export function ContactRfpSection() {
  const [formData, setFormData] = useState<FormData>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [referenceCode, setReferenceCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName.trim() || !formData.email.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      const code = `FCP-${Math.floor(100000 + Math.random() * 900000)}`
      setReferenceCode(code)
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 750)
  }

  const handleReset = () => {
    setFormData(initialForm)
    setIsSuccess(false)
  }

  return (
    <section
      id="contact"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-24"
      aria-label="Contact and Request for Proposal"
    >
      {/* ── Section Header ── */}
      <div className="space-y-4 mb-10 sm:mb-14 text-left">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold tracking-widest text-[#FF6B00] uppercase">
          <span className="w-6 h-[2px] bg-[#FF6B00] inline-block" />
          <span>GET IN TOUCH</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-[1.08]">
          LET'S BUILD SOMETHING GREAT TOGETHER
        </h2>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed font-normal">
          Whether you're breaking ground on a custom residential home, estimating a multi-family framing project, or modernizing timber infrastructure, our estimating team is ready.
        </p>
      </div>

      {/* ── Main 2-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        
        {/* ══════════════════════════════════════════════
            LEFT COLUMN: Operational Contact Info
            ══════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8">
          
          {/* 1. Headquarters */}
          <div className="flex items-start gap-4 pb-6 border-b border-zinc-800/80 group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-center text-[#FF6B00] flex-shrink-0 group-hover:border-[#FF6B00]/40 group-hover:bg-[#FF6B00]/5 transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                HEADQUARTERS
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                742 IronWorks Ave, Building 5
                <br />
                Chicago, IL 60616
              </p>
            </div>
          </div>

          {/* 2. Direct Lines */}
          <div className="flex items-start gap-4 pb-6 border-b border-zinc-800/80 group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-center text-[#FF6B00] flex-shrink-0 group-hover:border-[#FF6B00]/40 group-hover:bg-[#FF6B00]/5 transition-colors">
              <Phone className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                DIRECT LINES
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                General: <a href="tel:+13125550148" className="hover:text-white transition-colors">+1 (312) 555-0148</a>
                <br />
                Bidding: <a href="tel:+13125550199" className="hover:text-white transition-colors">+1 (312) 555-0199</a>
              </p>
            </div>
          </div>

          {/* 3. Email & Bids */}
          <div className="flex items-start gap-4 pb-6 border-b border-zinc-800/80 group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-center text-[#FF6B00] flex-shrink-0 group-hover:border-[#FF6B00]/40 group-hover:bg-[#FF6B00]/5 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                EMAIL & BIDS
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                <a href="mailto:bids@framecalcpro.com" className="hover:text-white transition-colors block">
                  bids@framecalcpro.com
                </a>
                <a href="mailto:estimates@framecalcpro.com" className="hover:text-white transition-colors block">
                  estimates@framecalcpro.com
                </a>
              </p>
            </div>
          </div>

          {/* 4. Field Operations */}
          <div className="flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-center text-[#FF6B00] flex-shrink-0 group-hover:border-[#FF6B00]/40 group-hover:bg-[#FF6B00]/5 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                FIELD OPERATIONS
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                Mon–Fri: 7:00 AM – 6:00 PM EST
                <br />
                Emergency Dispatch: 24/7
              </p>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════
            RIGHT COLUMN: Request for Proposal Form Card
            ══════════════════════════════════════════════ */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0C101B]/95 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
            
            {/* Ambient inner glow */}
            <div
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255, 107, 0, 0.08) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            {isSuccess ? (
              /* Success Confirmation View */
              <div className="py-8 text-center space-y-5 animate-hero-enter">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-white uppercase">
                    PROPOSAL REQUEST RECEIVED
                  </h3>
                  <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{formData.fullName}</strong>. Our commercial and residential estimating team has received your project details.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 max-w-sm mx-auto font-mono text-xs text-zinc-400 space-y-1">
                  <div>REFERENCE TICKET</div>
                  <div className="text-lg font-bold text-[#FF6B00]">{referenceCode}</div>
                  <div className="text-[11px] text-zinc-500">Response timeframe: Under 2 business hours</div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
                >
                  <span>Submit Another Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* RFP Form */
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                
                {/* Row 1: Full Name & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="rfp-fullname"
                      className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase block"
                    >
                      FULL NAME
                    </label>
                    <input
                      id="rfp-fullname"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Smith"
                      className="w-full h-12 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="rfp-email"
                      className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase block"
                    >
                      EMAIL ADDRESS
                    </label>
                    <input
                      id="rfp-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full h-12 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number & Project Scope */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="rfp-phone"
                      className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase block"
                    >
                      PHONE NUMBER
                    </label>
                    <input
                      id="rfp-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(312) 555-0199"
                      className="w-full h-12 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="rfp-scope"
                      className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase block"
                    >
                      PROJECT SCOPE
                    </label>
                    <div className="relative">
                      <select
                        id="rfp-scope"
                        value={formData.projectScope}
                        onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                        className="w-full h-12 px-4 pr-10 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="Commercial High-Rise">Commercial High-Rise</option>
                        <option value="Custom Residential Home">Custom Residential Home</option>
                        <option value="Multi-Family Framing (2-4 Units)">Multi-Family Framing (2-4 Units)</option>
                        <option value="Heavy Timber / Post & Beam">Heavy Timber / Post & Beam</option>
                        <option value="ADU / Garage Framing">ADU / Garage Framing</option>
                        <option value="Production Framing (Tract Housing)">Production Framing (Tract Housing)</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Project Details & Timeline */}
                <div className="space-y-2 text-left">
                  <label
                    htmlFor="rfp-details"
                    className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase block"
                  >
                    PROJECT DETAILS & TIMELINE
                  </label>
                  <textarea
                    id="rfp-details"
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Describe project site location, estimated square footage, target completion date, and budget..."
                    className="w-full p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-xl bg-[#FF6B00] hover:bg-[#FF7A1A] active:scale-[0.99] font-black text-white uppercase tracking-wider text-sm sm:text-base shadow-[0_4px_25px_rgba(255,107,0,0.45)] hover:shadow-[0_4px_35px_rgba(255,107,0,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>SUBMITTING REQUEST...</span>
                    </>
                  ) : (
                    <span>SUBMIT REQUEST FOR PROPOSAL</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
