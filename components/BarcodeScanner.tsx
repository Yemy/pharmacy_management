"use client";

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Camera, X, Scan } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, isOpen, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen && !codeReader) {
      const reader = new BrowserMultiFormatReader();
      setCodeReader(reader);
    }
  }, [isOpen, codeReader]);

  const startScanning = async () => {
    if (!codeReader || !videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Use the first available camera (usually back camera on mobile)
      const selectedDeviceId = videoInputDevices[0].deviceId;

      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            onScan(barcode);
            stopScanning();
            onClose();
          }
          if (error && !(error.name === 'NotFoundException')) {
            console.error('Barcode scanning error:', error);
          }
        }
      );
    } catch (err) {
      console.error('Failed to start barcode scanning:', err);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  useEffect(() => {
    return () => {
      // Cleanup will be handled by component unmount
    };
  }, [codeReader]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Scan className="w-5 h-5" />
            <span>Barcode Scanner</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click "Start Scanning" to begin</p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanning overlay */}
                <div className="absolute inset-4 border-2 border-red-500 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
                </div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-x-4 top-4 bottom-4 overflow-hidden">
                  <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            )}
            
            <Button onClick={handleClose} variant="outline">
              Cancel
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Position the barcode within the red frame to scan
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Trigger component for opening the scanner
interface BarcodeScannerTriggerProps {
  onScan: (barcode: string) => void;
  children?: React.ReactNode;
}

export function BarcodeScannerTrigger({ onScan, children }: BarcodeScannerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children || (
          <Button variant="outline" size="sm">
            <Scan className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
        )}
      </div>
      
      <BarcodeScanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScan={onScan}
      />
    </>
  );
}