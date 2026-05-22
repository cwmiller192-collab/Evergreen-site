export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          Thank You
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          Your inquiry has been received. We’ll review your scenario and reach out shortly.
        </p>

        <a
          href="https://evglending.com"
          className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
        >
          Return to Homepage
        </a>
      </div>
    </main>
  );
}
