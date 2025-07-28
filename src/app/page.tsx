export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl mr-4">🦎</span>
            <h1 className="text-4xl font-bold text-gray-900">
              Lot Lizard
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Carnival lot planning for fairs, rodeos, and outdoor events
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-3">🦎</span>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome to Lot Lizard
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Carnival lot planning with satellite imagery, drag-and-drop equipment placement, 
              precise measurements, and export capabilities for fair and event planning.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Canvas Editor</h3>
                <p className="text-blue-700 text-sm">Interactive 2D canvas for spatial planning</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Equipment Library</h3>
                <p className="text-green-700 text-sm">Pre-built components with accurate dimensions</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Measurements</h3>
                <p className="text-purple-700 text-sm">Precise measurements and annotations</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">Export</h3>
                <p className="text-orange-700 text-sm">Professional PDF generation</p>
              </div>
            </div>
            <div className="mt-8">
              <a 
                href="/canvas" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
