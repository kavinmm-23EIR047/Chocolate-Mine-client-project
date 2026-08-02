import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const faqs = [
  {
    q: 'Are all your cakes eggless?',
    a: 'Yes! Every single cake at The Chocolate Mine is 100% pure vegetarian and eggless — no exceptions.',
  },
  {
    q: 'How fast can you deliver in Coimbatore?',
    a: 'We deliver freshly baked cakes within 2–3 hours across Coimbatore. Choose your preferred delivery slot at checkout.',
  },
  {
    q: 'Can I order a custom-designed cake?',
    a: 'Absolutely! Head to our Custom Cake page to pick your flavour, weight, theme, and personal message. Our bakers will craft it to perfection.',
  },
  {
    q: 'What is the minimum order for delivery?',
    a: 'Online delivery requires a minimum order of ₹300. For smaller orders, you can opt for shop pickup or order directly via WhatsApp.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, credit/debit cards, net banking, and wallets via Razorpay. Pickup orders under ₹300 can be placed via WhatsApp.',
  },
];

const HomeFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-10 sm:py-14 tv:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight uppercase text-heading">
              Got Questions?
            </h2>
          </div>
          <Link
            to="/help"
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs lg:text-sm font-black text-primary hover:text-primary-hover uppercase tracking-widest border-b-2 border-primary/20 pb-0.5 transition-all hover:gap-2 whitespace-nowrap"
          >
            View All
          </Link>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2.5 px-4 sm:px-0">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-2xl border overflow-hidden transition-all hover:shadow-sm"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
              >
                <span className="font-bold text-sm sm:text-base text-heading">{faq.q}</span>
                <ChevronRight
                  size={18}
                  className={`shrink-0 text-primary transition-transform duration-300 ${openIndex === i ? 'rotate-90' : ''}`}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: openIndex === i ? '200px' : '0px', opacity: openIndex === i ? 1 : 0 }}
              >
                <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{faq.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HomeFAQ;
