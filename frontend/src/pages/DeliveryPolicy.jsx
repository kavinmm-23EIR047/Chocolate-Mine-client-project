import React from 'react';

const DeliveryPolicy = () => {
  return (
    <div className="responsive-container py-12 sm:py-20 min-h-[60vh] max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest mb-8 text-[var(--heading)] border-b border-[var(--border)] pb-4">
        Delivery Policy
      </h1>
      
      <div className="space-y-6 text-[var(--muted)] leading-relaxed bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 rounded-2xl shadow-sm">
        <p className="font-medium text-sm sm:text-base">
          We are committed to delivering your cakes fresh, beautiful, and on time. Please review our delivery policy below.
        </p>

        <div className="space-y-6 text-sm sm:text-base">
          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Delivery Areas</h2>
            <p>
              We currently deliver within our designated service areas. Delivery availability may vary based on your location and order value.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Delivery Schedule</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Deliveries are available during our regular operating hours.</li>
              <li>Customers may choose a preferred delivery date and time slot during checkout, subject to availability.</li>
              <li>While we strive to deliver within the selected time slot, unforeseen circumstances such as traffic, weather, or other factors may occasionally cause minor delays.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Delivery Charges</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Delivery charges are calculated based on the delivery location and will be displayed during checkout.</li>
              <li>Free delivery may be available for selected locations or promotional offers.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Order Preparation</h2>
            <p className="mb-2 font-medium">To ensure availability, we recommend placing your order:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>At least 24 hours in advance for standard cakes.</li>
              <li>24-48 hours in advance for custom or designer cakes.</li>
              <li>Larger celebration or wedding cakes may require additional preparation time.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Delivery Confirmation</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Please ensure that someone is available at the delivery address to receive the order.</li>
              <li>If the recipient is unavailable, our delivery team will attempt to contact the customer or recipient.</li>
              <li>If delivery cannot be completed due to an incorrect address or the recipient being unavailable, additional delivery charges may apply for a second delivery attempt.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Delivery Inspection</h2>
            <p>
              Customers are encouraged to inspect the cake upon delivery. Any damage or issues should be reported immediately, along with clear photographs, so we can resolve the matter promptly.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Delivery Delays</h2>
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
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Cake Care After Delivery</h2>
            <p className="mb-2 font-medium">Once the cake has been delivered:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Store it according to the care instructions provided.</li>
              <li>Keep it away from direct sunlight and excessive heat.</li>
              <li>Refrigerate cakes that require chilling until serving time.</li>
              <li>We are not responsible for damage caused by improper handling or storage after delivery.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Failed Deliveries</h2>
            <p>
              If a delivery cannot be completed due to incorrect address details, inaccessible locations, or the recipient's unavailability, the order may be returned to our shop. Redelivery may be arranged at an additional charge, subject to product condition.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">Contact Us</h2>
            <p>
              If you have any questions regarding your delivery or need assistance with your order, please contact our team. We are committed to ensuring your product arrives safely and in perfect condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPolicy;
