import { Heart, Github, Code } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* OSS Banner */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-bold text-gray-900">100% Open Source & Free Forever</div>
                <div className="text-xs text-gray-600">Privacy-first, no data collection</div>
              </div>
            </div>
            <a
              href="https://github.com/Koushith/quite-inbox"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
            >
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Built by */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Built with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-gray-600">by</span>
            <a
              href="https://koushith.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Koushith
            </a>
          </div>

          {/* Right: Other projects */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">Also check out:</span>
            <a
              href="https://www.roomcraftai.design"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg font-semibold text-purple-700 hover:from-purple-100 hover:to-pink-100 transition-all hover:shadow-sm"
            >
              🎨 RoomCraftAI
            </a>
            <a
              href="https://www.cryptotally.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg font-semibold text-blue-700 hover:from-blue-100 hover:to-cyan-100 transition-all hover:shadow-sm"
            >
              ₿ CryptoTally
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
