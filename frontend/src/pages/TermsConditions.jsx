import React from 'react';

const TermsConditions = () => {
  return (
    <div className="responsive-container py-12 sm:py-20 min-h-[60vh] max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest mb-8 text-[var(--heading)] border-b border-[var(--border)] pb-4">
        Terms & Conditions
      </h1>

      <div className="space-y-6 text-[var(--muted)] leading-relaxed bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 rounded-2xl shadow-sm">
        <p className="font-medium text-sm sm:text-base">
          Welcome to TCM. By placing an order with us, you agree to the following Terms & Conditions. Please read them carefully before placing your order.
        </p>

        <div className="space-y-6 text-sm sm:text-base">
          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">1. Orders</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All cakes and desserts are freshly prepared to order using high-quality ingredients.</li>
              <li>Customers are responsible for providing accurate order details, including delivery address, contact number, cake message, delivery date, and delivery time.</li>
              <li>Customers may choose a preferred delivery date and time slot during checkout, subject to availability.</li>
              <li>We recommend placing orders at least 24 hours in advance for standard cakes.</li>
              <li>Custom or designer cakes should be ordered 24–48 hours in advance.</li>
              <li>Larger celebration or wedding cakes may require additional preparation time.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">2. Order Cancellation</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Orders may be cancelled up to 48 hours before the scheduled delivery or pickup time for a full refund.</li>
              <li>Cancellations made within 24 hours of delivery may be eligible for a partial refund of up to 50%, depending on the preparation already completed.</li>
              <li>Orders cancelled less than 12 hours before delivery or pickup are non-refundable.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">3. Custom Cakes</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Custom-designed cakes, including personalized decorations, themes, names, or photos, are non-refundable once production has begun.</li>
              <li>If work has not yet started, cancellation may be considered at our discretion.</li>
              <li>Personal taste preferences regarding flavor, sweetness, or design are not eligible for a refund or replacement when the cake matches the approved order.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">4. Delivery Areas</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We currently deliver within our designated service areas.</li>
              <li>Delivery availability may vary based on your location and order value.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">5. Delivery Schedule</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Deliveries are available during our regular operating hours.</li>
              <li>Customers may choose a preferred delivery date and time slot during checkout, subject to availability.</li>
              <li>While we strive to deliver within the selected time slot, unforeseen circumstances such as traffic, weather, or other factors may occasionally cause minor delays.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">6. Delivery Charges</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Delivery charges are calculated based on the delivery location and will be displayed during checkout.</li>
              <li>Free delivery may be available for selected locations or promotional offers.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">7. Delivery Confirmation</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Please ensure that someone is available at the delivery address to receive the order.</li>
              <li>If the recipient is unavailable, our delivery team will attempt to contact the customer or recipient.</li>
              <li>If delivery cannot be completed due to an incorrect address or the recipient being unavailable, additional delivery charges may apply for a second delivery attempt.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">8. Delivery Inspection</h2>
            <p className="mb-2">Customers are encouraged to inspect the cake upon delivery.</p>
            <p className="mb-2 font-medium">If your cake is damaged during delivery due to our handling, please:</p>
            <ul className="list-disc pl-5 space-y-1.5 mb-3">
              <li>Inspect the cake upon delivery.</li>
              <li>Notify us within 20 minutes of receiving the order.</li>
              <li>Provide clear photos of the damaged cake.</li>
            </ul>
            <p className="mb-2 font-medium">After verification, we may offer one of the following:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>A replacement cake, subject to availability.</li>
              <li>A partial refund.</li>
              <li>Store credit for a future purchase.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">9. Quality Concerns</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>If you believe your cake has a quality issue, please contact us within 12 hours of delivery with photos and a description of the concern.</li>
              <li>Each case will be reviewed individually.</li>
              <li>Refunds or replacements are provided only when the issue is determined to be our responsibility.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">10. Customer Errors</h2>
            <p className="mb-2 font-medium">Refunds or replacements will not be provided for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Incorrect information provided by the customer, including delivery address, contact number, message on the cake, etc.</li>
              <li>Failure to receive the order at the agreed delivery time.</li>
              <li>Damage caused after the cake has been delivered or collected.</li>
              <li>Personal taste preferences regarding flavor, sweetness, or design when the cake matches the approved order.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">11. Delivery Delays</h2>
            <p className="mb-2 font-medium">We are not responsible for delays caused by:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Severe weather conditions.</li>
              <li>Traffic disruptions.</li>
              <li>Road closures.</li>
              <li>Natural disasters.</li>
              <li>Government restrictions.</li>
              <li>Incorrect delivery information provided by the customer.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">12. Failed Deliveries</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>If a delivery cannot be completed due to incorrect address details, inaccessible locations, or the recipient's unavailability, the order may be returned to our shop.</li>
              <li>Redelivery may be arranged at an additional charge, subject to product condition.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">13. Cake Care After Delivery</h2>
            <p className="mb-2 font-medium">Once the cake has been delivered:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Store it according to the care instructions provided.</li>
              <li>Keep it away from direct sunlight and excessive heat.</li>
              <li>Refrigerate cakes that require chilling until serving time.</li>
              <li>We are not responsible for damage caused by improper handling or storage after delivery.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">14. Refund Processing</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Approved refunds will be processed using the original payment method within 4–5 business days, depending on your bank or payment provider.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">15. Contact Us</h2>
            <p className="mb-2">
              For order cancellations, refund requests, delivery concerns, quality issues, or any other assistance, please contact our support team with your order number and relevant details.
            </p>
            <p>
              We are committed to resolving genuine issues quickly and fairly and ensuring your product arrives safely and in perfect condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
