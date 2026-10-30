import Head from "next/head";

export default function ShippingPolicy() {
  return (
    <div className="mt-16">
      <Head>
        <title>Shipping Policy | Brainwave Velocity Private Limited</title>
        <meta name="description" content="Shipping Policy of Brainwave Velocity Private Limited" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-6">
        <div className="max-w-4xl bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-blue-600">Shipping Policy</h1>
          <p className="text-gray-600 text-center mt-2">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mt-6">
            <h1 className="text-gray-700 font-semibold text-xl">
            Shipping is not applicable for business.
            </h1>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Contact for Shipping Issues</h2>
            <p className="text-gray-700 mt-2">
              For any issues in utilizing our services, you may contact our helpdesk at:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2">
              <li><strong>Phone:</strong> <a href="tel:9011009613" className="text-blue-600 underline">9011009613</a></li>
              <li><strong>Email:</strong> <a href="mailto:admin@brainwavesportstech.com" className="text-blue-600 underline">admin@brainwavesportstech.com</a></li>
            </ul>
          </section>

          <p className="text-gray-600 text-center mt-6">
            We reserve the right to update this Shipping Policy at any time. Please check this page periodically for any changes.
          </p>
        </div>
      </div>
    </div>
  );
}
