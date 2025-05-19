"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Smartphone } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function QRdisplay({ appUrl }: { appUrl: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-white"
        title="Mobile Preview"
      >
        <Smartphone className="w-6 h-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen} >
        <DialogContent className="sm:max-w-md border-[#8A2BE2] bg-black text-white z-[10000]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-[#8A2BE2] font-orbitron">
              Preview on your own mobile device
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 p-6">
            <div className="space-y-2 text-center">
              <h3 className="font-semibold text-[#8A2BE2] font-orbitron">1. Install Expo Go</h3>
              <p className="text-sm text-gray-300 font-orbitron">Download from the App Store or Google Play</p>
            </div>

            <div className="space-y-2 text-center">
              <h3 className="font-semibold text-[#8A2BE2] font-orbitron">2. Scan this QR code</h3>
              <p className="text-sm text-gray-300 font-orbitron">Use the code scanner app on iOS or Expo Go on Android</p>
            </div>

            <div className=" p-2 rounded-lg bg-black">
              {appUrl ? (
                <QRCodeSVG
                  value={appUrl}
                  size={200}
                  bgColor={"#000000"}
                  fgColor={"#ffffff"}
                  includeMargin={false}
                />
              ) : (
                <h3 className="text-white">No QR available</h3>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
