import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="responsive-container py-12 sm:py-20 min-h-[60vh] max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest mb-8 text-[var(--heading)] border-b border-[var(--border)] pb-4">
        Privacy Policy
      </h1>
      
      <div className="space-y-10 text-[var(--muted)] leading-relaxed">
        
        {/* Cake Refund Policy Section */}
        <section className="space-y-6 bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-black text-[var(--heading)] tracking-tight border-b border-[var(--border)] pb-3">
            Cake Refund Policy
          </h2>
          <p className="font-medium text-sm sm:text-base">
            At our TCM, every cake and dessert is freshly prepared to order using high-quality ingredients. Because our products are custom-made and perishable, we have the following refund policy:
          </p>

          <div className="space-y-4 text-sm sm:text-base">
            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Order Cancellation</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Orders may be cancelled up to 48 hours before the scheduled delivery or pickup time for a full refund.</li>
                <li>Cancellations made within 24 hours of delivery may be eligible for a partial refund of up to 50%, depending on the preparation already completed.</li>
                <li>Orders cancelled less than 12 hours before delivery or pickup are non-refundable.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Custom Cake</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Custom-designed cakes, including personalized decorations, themes, names, or photos, are non-refundable once production has begun.</li>
                <li>If work has not yet started, cancellation may be considered at our discretion.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Delivery Issues</h3>
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
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Quality Concerns</h3>
              <p>
                If you believe your cake has a quality issue, please contact us within 12 hours of delivery with photos and a description of the concern. Each case will be reviewed individually. Refunds or replacements are provided only when the issue is determined to be our responsibility.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Customer Errors</h3>
              <p className="mb-2 font-medium">Refunds or replacements will not be provided for:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Incorrect information provided by the customer (delivery address, contact number, message on the cake, etc.).</li>
                <li>Failure to receive the order at the agreed delivery time.</li>
                <li>Damage caused after the cake has been delivered or collected.</li>
                <li>Personal taste preferences regarding flavor, sweetness, or design when the cake matches the approved order.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Refund Processing</h3>
              <p>
                Approved refunds will be processed using the original payment method within 4-5 business days, depending on your bank or payment provider.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Contact Us</h3>
              <p>
                For refund requests or any assistance, please contact our support with your order number and relevant details. We are committed to resolving genuine issues quickly and fairly.
              </p>
            </div>
          </div>
        </section>

        {/* Delivery Policy Section */}
        <section className="space-y-6 bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-black text-[var(--heading)] tracking-tight border-b border-[var(--border)] pb-3">
            Delivery Policy
          </h2>
          <p className="font-medium text-sm sm:text-base">
            We are committed to delivering your cakes fresh, beautiful, and on time. Please review our delivery policy below.
          </p>

          <div className="space-y-4 text-sm sm:text-base">
            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Delivery Areas</h3>
              <p>
                We currently deliver within our designated service areas. Delivery availability may vary based on your location and order value.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Delivery Schedule</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Deliveries are available during our regular operating hours.</li>
                <li>Customers may choose a preferred delivery date and time slot during checkout, subject to availability.</li>
                <li>While we strive to deliver within the selected time slot, unforeseen circumstances such as traffic, weather, or other factors may occasionally cause minor delays.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Delivery Charges</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Delivery charges are calculated based on the delivery location and will be displayed during checkout.</li>
                <li>Free delivery may be available for selected locations or promotional offers.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Order Preparation</h3>
              <p className="mb-2 font-medium">To ensure availability, we recommend placing your order:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>At least 24 hours in advance for standard cakes.</li>
                <li>24-48 hours in advance for custom or designer cakes.</li>
                <li>Larger celebration or wedding cakes may require additional preparation time.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Delivery Confirmation</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Please ensure that someone is available at the delivery address to receive the order.</li>
                <li>If the recipient is unavailable, our delivery team will attempt to contact the customer or recipient.</li>
                <li>If delivery cannot be completed due to an incorrect address or the recipient being unavailable, additional delivery charges may apply for a second delivery attempt.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Delivery Inspection</h3>
              <p>
                Customers are encouraged to inspect the cake upon delivery. Any damage or issues should be reported immediately, along with clear photographs, so we can resolve the matter promptly.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Delivery Delays</h3>
              <p className="mb-2 font-medium">We are not responsible for delays caused by:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Severe weather conditions</li>
                <li>Traffic disruptions</li>
                <li>Road closures</li>
                <li>Natural disasters</li>
                <li>Government restrictions</li>
                <li>Incorrect delivery information provided by the customer</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Cake Care After Delivery</h3>
              <p className="mb-2 font-medium">Once the cake has been delivered:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Store it according to the care instructions provided.</li>
                <li>Keep it away from direct sunlight and excessive heat.</li>
                <li>Refrigerate cakes that require chilling until serving time.</li>
                <li>We are not responsible for damage caused by improper handling or storage after delivery.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Failed Deliveries</h3>
              <p>
                If a delivery cannot be completed due to incorrect address details, inaccessible locations, or the recipient's unavailability, the order may be returned to our shop. Redelivery may be arranged at an additional charge, subject to product condition.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[var(--heading)] text-base sm:text-lg mb-2">Contact Us</h3>
              <p>
                If you have any questions regarding your delivery or need assistance with your order, please contact our team. We are committed to ensuring your product arrives safely and in perfect condition.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
