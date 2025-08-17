export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Rental Management API Documentation
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Interactive API documentation with live testing capabilities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api-docs.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-red-500"
            >
              View API Documentation
              <svg
                className="ml-2 -mr-1 w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-red-500"
            >
              Download OpenAPI Spec
              <svg
                className="ml-2 -mr-1 w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            API Overview
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Units API
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GET /api/units - List all units</li>
                <li>• POST /api/units - Create a new unit</li>
                <li>• GET /api/units/{`{id}`} - Get specific unit</li>
                <li>• PUT /api/units/{`{id}`} - Update unit</li>
                <li>• DELETE /api/units/{`{id}`} - Delete unit</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Expenses API
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GET /api/expenses - List expenses (with filters)</li>
                <li>• POST /api/expenses - Create a new expense</li>
                <li>• GET /api/expenses/{`{id}`} - Get specific expense</li>
                <li>• PUT /api/expenses/{`{id}`} - Update expense</li>
                <li>• DELETE /api/expenses/{`{id}`} - Delete expense</li>
                <li>• GET /api/expenses/stats - Get expense statistics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Income API
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GET /api/income - List income (with filters)</li>
                <li>• POST /api/income - Create a new income</li>
                <li>• GET /api/income/{`{id}`} - Get specific income</li>
                <li>• PUT /api/income/{`{id}`} - Update income</li>
                <li>• DELETE /api/income/{`{id}`} - Delete income</li>
                <li>• GET /api/openapi - Get API specification</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Features</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 📚 Complete OpenAPI 3.0 specification</li>
            <li>
              • 🧪 Interactive testing with &quot;Try it out&quot; functionality
            </li>
            <li>• 📝 Detailed request/response examples</li>
            <li>• 🏷️ Comprehensive schema definitions</li>
            <li>• 🔍 Search and filtering capabilities</li>
            <li>• 📱 Mobile-responsive documentation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
