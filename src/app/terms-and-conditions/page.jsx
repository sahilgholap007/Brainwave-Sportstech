import Head from "next/head";

export default function TermsAndConditions() {
  return (
    <div className="mt-16">
      <Head>
        <title>Terms and Conditions | Brainwave Velocity Private Limited</title>
        <meta name="description" content="Terms and Conditions of Brainwave Velocity Private Limited" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-6">
        <div className="max-w-4xl bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-blue-600">Terms and Conditions</h1>
          <p className="text-gray-600 text-center mt-2">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mt-6">
            <p className="text-gray-700">
              For the purpose of these Terms and Conditions, the term <strong>"we", "us", "our"</strong> used anywhere on this page shall mean <strong>BRAINWAVE VELOCITY PRIVATE LIMITED</strong>, whose registered/operational office is Unit 403-404, Motibhai Smruti Tower, Opposite Railway Station, Thane, MAHARASHTRA 421503.
              <br />
              <strong>"you", "your", "user", "visitor"</strong> shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
              <br />
              Your use of the website and/or purchase from us are governed by the following Terms and Conditions:
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Website Content</h2>
            <p className="text-gray-700 mt-2">
              The content of the pages of this website is subject to change without notice. Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials found or offered on this website for any particular purpose.
            </p>
            <p className="text-gray-700 mt-2">
              You acknowledge that such information and materials may contain inaccuracies or errors, and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Usage of Website and Information</h2>
            <p className="text-gray-700 mt-2">
              Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services, or information available through our website and/or product pages meet your specific requirements.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Intellectual Property</h2>
            <p className="text-gray-700 mt-2">
              Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these Terms and Conditions.
            </p>
            <p className="text-gray-700 mt-2">
              All trademarks reproduced on our website which are not the property of, or licensed to, the operator are acknowledged on the website.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Unauthorized Use</h2>
            <p className="text-gray-700 mt-2">
              Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">External Links</h2>
            <p className="text-gray-700 mt-2">
              From time to time, our website may also include links to other websites. These links are provided for your convenience to provide further information.
            </p>
            <p className="text-gray-700 mt-2">
              You may not create a link to our website from another website or document without <strong>BRAINWAVE VELOCITY PRIVATE LIMITED’s</strong> prior written consent.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Legal Jurisdiction</h2>
            <p className="text-gray-700 mt-2">
              Any dispute arising out of the use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Transactions and Liabilities</h2>
            <p className="text-gray-700 mt-2">
              We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
            </p>
          </section>

          <p className="text-gray-600 text-center mt-6">
            We reserve the right to update these Terms and Conditions at any time. Please check this page periodically for any changes.
          </p>
        </div>
      </div>
    </div>
  );
}
