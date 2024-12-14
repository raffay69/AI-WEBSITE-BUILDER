import { useState } from 'react'
import { X } from 'lucide-react'

interface DownloadPopupProps {
  onDownload: () => void
  onCancel: () => void
}

export function DownloadPopup({ onDownload, onCancel }: DownloadPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#111] rounded-lg p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Download code</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-red-800 bg-red-700"
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 rounded-md text-sm bg-white text-black hover:bg-gray-200"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

