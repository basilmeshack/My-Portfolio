export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-purple-500/40 border-t-purple-400" />
        <p className="text-sm text-gray-300">Loading section...</p>
      </div>
    </div>
  )
}
