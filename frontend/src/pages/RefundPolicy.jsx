import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="responsive-container py-12 sm:py-20 min-h-[60vh] max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest mb-8 text-[var(--heading)] border-b border-[var(--border)] pb-4">
        Cake Refund Policy
      </h1>
      
      <div className="space-y-6 text-[var(--muted)] leading-relaxed bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 rounded-2xl shadow-sm">
        <p className="font-medium text-sm sm:text-base">
          At our TCM, every cake and dessert is freshly prepared to order using high-quality ingredients. Because our products are custom-made and perishable, we have the following refund policy:
        </p>

        <div className="space-y-6 text-sm sm:text-base">
          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Order Cancellation</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Orders may be cancelled up to 48 hours before the scheduled delivery or pickup time for a full refund.</li>
              <li>Cancellations made within 24 hours of delivery may be eligible for a partial refund of up to 50%, depending on the preparation already completed.</li>
              <li>Orders cancelled less than 12 hours before delivery or pickup are non-refundable.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Custom Cake</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Custom-designed cakes, including personalized decorations, themes, names, or photos, are non-refundable once production has begun.</li>
              <li>If work has not yet started, cancellation may be considered at our discretion.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Delivery Issues</h2>
            <p className="mb-2 font-medium">If your cake is damaged during delivery due to our handling, please:</p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3">
              <li>Inspect the cake upon delivery.</li>
              <li>Notify us within 20mins of receiving the order.</li>
              <li>Provide clear photos of the damaged cake.</li>
            </ul>
            <p className="mb-2 font-medium">After verification, we may offer one of the following:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>A replacement cake (subject to availability).</li>
              <li>A partial refund.</li>
              <li>Store credit for a future purchase.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Quality Concerns</h2>
            <p>
              If you believe your cake has a quality issue, please contact us within 12 hours of delivery with photos and a description of the concern. Each case will be reviewed individually. Refunds or replacements are provided only when the issue is determined to be our responsibility.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Customer Errors</h2>
            <p className="mb-2 font-medium">Refunds or replacements will not be provided for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Incorrect information provided by the customer (delivery address, contact number, message on the cake, etc.).</li>
              <li>Failure to receive the order at the agreed delivery time.</li>
              <li>Damage caused after the cake has been delivered or collected.</li>
              <li>Personal taste preferences regarding flavor, sweetness, or design when the cake matches the approved order.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Refund Processing</h2>
            <p>
              Approved refunds will be processed using the original payment method within 4-5 business days, depending on your bank or payment provider.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Contact Us</h2>
            <p>
              For refund requests or any assistance, please contact our support with your order number and relevant details. We are committed to resolving genuine issues quickly and fairly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
