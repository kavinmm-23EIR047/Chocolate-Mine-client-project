import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="responsive-container py-12 sm:py-20 min-h-[60vh] max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest mb-8 text-[var(--heading)] border-b border-[var(--border)] pb-4">
        Privacy Policy
      </h1>

      <div className="space-y-6 text-[var(--muted)] leading-relaxed bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 rounded-2xl shadow-sm">
        <p className="font-medium text-sm sm:text-base">
          At TCM, we respect the privacy of our customers and are committed to handling the information provided while placing and delivering orders responsibly.
        </p>

        <div className="space-y-6 text-sm sm:text-base">
          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">1. Information We Collect</h2>
            <p className="mb-2">When you place an order, we may collect information required to prepare, process, and deliver your order, including:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Customer name.</li>
              <li>Contact number.</li>
              <li>Delivery address.</li>
              <li>Order details.</li>
              <li>Delivery date and preferred delivery time slot.</li>
              <li>Cake customization details, including messages, names, themes, or photos provided for custom cakes.</li>
              <li>Payment-related information required to process your order.</li>
              <li>Photos or descriptions provided when reporting delivery damage or quality concerns.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">2. How We Use Your Information</h2>
            <p className="mb-2">The information provided by customers may be used to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Process and prepare orders.</li>
              <li>Customize cakes according to the approved order details.</li>
              <li>Contact customers or recipients regarding an order or delivery.</li>
              <li>Deliver orders to the provided delivery address.</li>
              <li>Process payments and approved refunds.</li>
              <li>Handle cancellation requests.</li>
              <li>Review delivery damage or quality concerns.</li>
              <li>Arrange replacements, partial refunds, store credit, or redelivery where applicable.</li>
              <li>Provide customer support and assistance.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">3. Delivery Information</h2>
            <p className="mb-2">Customers are responsible for providing correct delivery information, including the delivery address and contact number.</p>
            <p className="mb-2 font-medium">The provided information may be used by our delivery team to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mb-2">
              <li>Locate the delivery address.</li>
              <li>Contact the customer or recipient when required.</li>
              <li>Complete the delivery.</li>
              <li>Arrange a second delivery attempt when applicable.</li>
            </ul>
            <p className="text-xs sm:text-sm italic">Incorrect delivery information provided by the customer may result in failed delivery or additional delivery charges.</p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">4. Custom Cake Information</h2>
            <p className="mb-2">For custom-designed cakes, customers may provide personalized information such as:</p>
            <ul className="list-disc pl-5 space-y-1.5 mb-2">
              <li>Names.</li>
              <li>Messages.</li>
              <li>Themes.</li>
              <li>Photos.</li>
              <li>Decoration requirements.</li>
            </ul>
            <p>This information is used to prepare the custom cake according to the approved order.</p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">5. Damage and Quality Concerns</h2>
            <p className="mb-2">When reporting delivery damage or quality concerns, customers may be required to provide:</p>
            <ul className="list-disc pl-5 space-y-1.5 mb-2">
              <li>Order number.</li>
              <li>Clear photographs of the cake.</li>
              <li>A description of the concern.</li>
              <li>Relevant order and delivery details.</li>
            </ul>
            <p>This information will be used to review and verify the issue and determine whether a replacement, partial refund, store credit, or other resolution is applicable.</p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">6. Payment and Refund Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Payment information is used to process customer orders.</li>
              <li>When a refund is approved, it will be processed using the original payment method within 4–5 business days, depending on the customer's bank or payment provider.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">7. Customer Responsibility</h2>
            <p className="mb-2">Customers are responsible for ensuring that the information provided while placing an order is accurate.</p>
            <p className="mb-2 font-medium">This includes:</p>
            <ul className="list-disc pl-5 space-y-1.5 mb-2">
              <li>Delivery address.</li>
              <li>Contact number.</li>
              <li>Cake message.</li>
              <li>Customization details.</li>
              <li>Delivery date and time information.</li>
            </ul>
            <p className="text-xs sm:text-sm italic">We are not responsible for issues resulting from incorrect information provided by the customer.</p>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">8. Contact and Order Communication</h2>
            <p className="mb-2">We may use the contact information provided with an order to communicate regarding:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Order confirmation.</li>
              <li>Cake preparation.</li>
              <li>Customization requirements.</li>
              <li>Delivery.</li>
              <li>Recipient availability.</li>
              <li>Delivery issues.</li>
              <li>Cancellation or refund requests.</li>
              <li>Quality concerns.</li>
              <li>Customer support.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-[var(--heading)] text-lg mb-2">9. Contact Us</h2>
            <p className="mb-2">
              If you have any questions regarding your order information, delivery information, refund request, or any assistance related to your order, please contact our support team with your order number and relevant details.
            </p>
            <p>
              We are committed to handling customer information responsibly while providing our ordering, delivery, refund, and customer support services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
