import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const contactEmail = 'eoxystudio@gmail.com';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Gameplay Feedback');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMsg = message.trim();

    if (trimmedName.length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (trimmedMsg.length < 10) {
      setError('Please include a message of at least 10 characters.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      <header className="space-y-3 border-b border-white/10 pb-8">
        <p className="text-xs font-semibold text-[#f59e0b]">Get in Touch</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#f7f3eb]">
          Contact Rolex Empire
        </h1>
        <p className="text-base text-[#c7bdb1] leading-relaxed">
          Have bug reports, suggestions for Kampala recipes, business inquiries, or privacy
          questions? Send us a message below.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-4">
          {contactEmail && (
            <div className="p-6 rounded-2xl bg-[#1a1613] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[#fcdc04]">
                <Mail className="w-4 h-4" />
                <h2 className="font-display text-base font-bold text-[#f7f3eb]">Direct Email</h2>
              </div>
              <p className="text-sm text-[#c7bdb1]">
                Reach the Rolex Empire team directly for press, partnerships, or privacy inquiries:
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-block text-sm font-semibold text-[#fcdc04] underline underline-offset-4 break-all"
              >
                {contactEmail}
              </a>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-[#1a1613] border border-white/10 space-y-2">
            <h2 className="font-display text-base font-bold text-[#f7f3eb]">Feedback Helps V2</h2>
            <p className="text-xs text-[#bfb5a8] leading-relaxed">
              We review player feedback from Version 1.0 to prioritize new Kampala street locations,
              mobile performance improvements, and recipe expansions.
            </p>
          </div>
        </div>

        <div className="md:col-span-7">
          {submitted ? (
            <div className="p-6 rounded-2xl bg-[#1a221b] border border-emerald-500/35 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="font-display text-lg font-bold text-[#f7f3eb]">
                  Message Received
                </h2>
              </div>
              <p className="text-sm text-[#cfc6ba] leading-relaxed">
                Thank you, <strong>{name}</strong>. Your {topic.toLowerCase()} note has been
                recorded for review.
                {contactEmail && (
                  <>
                    {' '}
                    You can also open your email app to send it directly to{' '}
                    <a
                      href={`mailto:${contactEmail}?subject=${encodeURIComponent(
                        `[Rolex Empire] ${topic} from ${name}`,
                      )}&body=${encodeURIComponent(`${message}\n\nReply to: ${email}`)}`}
                      className="text-[#fcdc04] underline underline-offset-4"
                    >
                      {contactEmail}
                    </a>
                    .
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="min-h-[40px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#f7f3eb] cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-6 rounded-2xl bg-[#1a1613] border border-white/10 space-y-4"
            >
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-xs text-red-200"
                >
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-[#d6cec3] mb-1.5">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Namukasa"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-[#120f0d] border border-white/15 text-sm text-[#f7f3eb] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-[#d6cec3] mb-1.5">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-[#120f0d] border border-white/15 text-sm text-[#f7f3eb] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label htmlFor="contact-topic" className="block text-xs font-semibold text-[#d6cec3] mb-1.5">
                  Topic
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-[#120f0d] border border-white/15 text-sm text-[#f7f3eb] focus:outline-none focus:border-[#f59e0b]"
                >
                  <option value="Gameplay Feedback">Gameplay Feedback</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Business & Partnerships">Business &amp; Partnerships</option>
                  <option value="Privacy Inquiry">Privacy Inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-[#d6cec3] mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your feedback, device details, or question..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#120f0d] border border-white/15 text-sm text-[#f7f3eb] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <button
                type="submit"
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#14110f] text-sm font-extrabold cursor-pointer transition-colors"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
