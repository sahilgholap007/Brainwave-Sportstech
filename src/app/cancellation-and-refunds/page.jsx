import Head from "next/head";

export default function CancellationAndRefunds() {
  return (
    <div className="mt-16">
      <Head>
        <title>Cancellation and Refunds Policy | Brainwave Velocity Private Limited</title>
        <meta name="description" content="Cancellation and Refunds Policy of Brainwave Velocity Private Limited" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-6">
        <div className="max-w-4xl bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-blue-600">Cancellation and Refunds Policy</h1>
          <p className="text-gray-600 text-center mt-2">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mt-6">
            <p className="text-gray-700">
              <strong>BRAINWAVE VELOCITY PRIVATE LIMITED</strong> believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Cancellation Policy</h2>
            <p className="text-gray-700 mt-2">
              Cancellations will be considered only if the request is made within <strong>9-15 days</strong> of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
            </p>
            <p className="text-gray-700 mt-2">
              <strong>BRAINWAVE VELOCITY PRIVATE LIMITED</strong> does not accept cancellation requests for perishable items like flowers, eatables, etc. However, refund/replacement can be made if the customer establishes that the quality of the product delivered is not good.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Damaged or Defective Items</h2>
            <p className="text-gray-700 mt-2">
              In case of receipt of damaged or defective items, please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at their own end. This should be reported within <strong>9-15 days</strong> of receipt of the products.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Product Not as Expected</h2>
            <p className="text-gray-700 mt-2">
              In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>9-15 days</strong> of receiving the product. The Customer Service Team, after looking into your complaint, will take an appropriate decision.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Products with Manufacturer Warranty</h2>
            <p className="text-gray-700 mt-2">
              In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Refund Process</h2>
            <p className="text-gray-700 mt-2">
              In case of any Refunds approved by <strong>BRAINWAVE VELOCITY PRIVATE LIMITED</strong>, it will take <strong>9-15 days</strong> for the refund to be processed to the end customer.
            </p>
          </section>

          <p className="text-gray-600 text-center mt-6">
            We reserve the right to update this Cancellation and Refunds Policy at any time. Please check this page periodically for any changes.
          </p>
        </div>
      </div>
    </div>
  );
}
