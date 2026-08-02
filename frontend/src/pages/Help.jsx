import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, FileText, ShieldQuestion, ChevronRight } from 'lucide-react';

const helpCards = [
  {
    icon: HelpCircle,
    title: 'FAQs',
    desc: 'Answers to your most frequent queries.',
    path: '/help#faqs',
  },
  {
    icon: FileText,
    title: 'Shipping Policy',
    desc: 'Details on delivery zones and timelines.',
    path: '/delivery',
  },
  {
    icon: ShieldQuestion,
    title: 'Refunds',
    desc: 'Our cancellation and refund policies.',
    path: '/refund',
  },
];

const faqs = [
  {
    q: 'Do you offer eggless cakes?',
    a: 'Yes! All our cakes are 100% pure vegetarian and eggless. We never use eggs in any of our products.',
  },
  {
    q: 'What are your delivery timings?',
    a: 'We deliver within Coimbatore city in 2–3 hours. You can choose your preferred delivery slot during checkout. We deliver from 9 AM to 10 PM daily.',
  },
  {
    q: 'Can I order a custom cake?',
    a: 'Absolutely! Visit our Custom Cake page to design your dream cake with your preferred flavour, weight, message, and theme. Our bakers will craft it just for you.',
  },
  {
    q: 'What is the minimum order for delivery?',
    a: 'The minimum order value for online delivery is ₹300. For orders below ₹300, you can opt for shop pickup or order directly via WhatsApp.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is confirmed, you\'ll receive real-time updates via push notification and WhatsApp. You can also track your order from the "My Orders" section in your account.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, credit/debit cards, net banking, and wallets via Razorpay. For orders under ₹300, you can pay at the shop (pickup orders via WhatsApp).',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'You can cancel an order within 5 minutes of placing it. After that, since we start preparing your fresh cake immediately, cancellations are not possible. Please contact us via WhatsApp for any modifications.',
  },
  {
    q: 'Do you deliver outside Coimbatore?',
    a: 'Currently, we deliver only within Coimbatore city limits. We\'re working on expanding our delivery areas soon!',
  },
];

const Help = () => {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <div className="responsive-container py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-black uppercase tracking-widest mb-6" style={{ color: 'var(--heading)' }}>Help & FAQ</h1>
      <p className="text-muted max-w-lg mb-10">Find answers to common questions about our products, delivery, and policies.</p>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16">
        {helpCards.map((card, i) => (
          <Link
            key={i}
            to={card.path}
            className="p-6 rounded-2xl flex flex-col items-center gap-3 border transition-all hover:scale-[1.02] hover:shadow-lg group"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <card.icon size={24} />
            </div>
            <h3 className="font-bold">{card.title}</h3>
            <p className="text-sm text-muted">{card.desc}</p>
            <span className="text-xs font-bold text-primary flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More <ChevronRight size={12} />
            </span>
          </Link>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="w-full max-w-3xl text-left" id="faqs">
        <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-center" style={{ color: 'var(--heading)' }}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 group"
              >
                <span className="font-bold text-sm sm:text-base" style={{ color: 'var(--heading)' }}>{faq.q}</span>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
