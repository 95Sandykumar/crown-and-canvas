"use client";

import { Suspense, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Upload, X, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStepper } from "@/components/layout/order-stepper";
import { useOrderFlowStore } from "@/stores/order-flow-store";

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStyle = searchParams.get("style");

  const { petName, petPhotoUrl, setPetName, setPetPhoto, setStyle, goToStep } =
    useOrderFlowStore();

  const [preview, setPreview] = useState<string | null>(petPhotoUrl);
  const [name, setName] = useState(petName);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setPetPhoto(result);
    };
    reader.readAsDataURL(file);
  }, [setPetPhoto]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleContinue = () => {
    if (!preview) {
      setError("Please upload a photo of your pet.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your pet's name.");
      return;
    }

    setPetName(name.trim());
    if (preselectedStyle) {
      setStyle(preselectedStyle);
      goToStep("customize");
      router.push("/order/customize");
    } else {
      goToStep("select-style");
      router.push("/order/select-style");
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <OrderStepper currentStep="upload" />

        <div className="mt-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Upload Your Pet&apos;s Photo
            </h1>
            <p className="text-charcoal/60">
              A clear, well-lit photo works best. Head shots or close-ups are ideal.
            </p>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? "border-royal bg-royal/5"
                : preview
                ? "border-gold/40 bg-white"
                : "border-border hover:border-royal/40 hover:bg-royal/5"
            }`}
          >
            {preview ? (
              <div className="space-y-4">
                <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-xl">
                  <Image
                    src={preview}
                    alt="Pet preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setPetPhoto("");
                    }}
                    className="absolute top-2 right-2 rounded-full bg-charcoal/60 p-1 text-white hover:bg-charcoal transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-charcoal/50">Click or drag to change photo</p>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cream">
                  <Upload className="h-8 w-8 text-royal" />
                </div>
                <div>
                  <p className="text-base font-medium text-charcoal">
                    Drag and drop your photo here
                  </p>
                  <p className="text-sm text-charcoal/50 mt-1">
                    or click to browse &middot; JPG, PNG, WebP &middot; Max 10MB
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="hidden"
            />
          </div>

          {/* Photo tips */}
          <div className="rounded-xl bg-white border border-border/40 p-4">
            <div className="flex items-start gap-3">
              <Camera className="h-5 w-5 text-royal mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-charcoal">Photo tips for best results</p>
                <ul className="text-xs text-charcoal/50 space-y-0.5">
                  <li>&bull; Clear, well-lit photo of your pet</li>
                  <li>&bull; Face should be visible and facing camera</li>
                  <li>&bull; Close-up or head-and-shoulders is ideal</li>
                  <li>&bull; Avoid blurry or very dark images</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pet name */}
          <div className="space-y-2">
            <label htmlFor="petName" className="text-sm font-medium text-charcoal">
              Your Pet&apos;s Name
            </label>
            <Input
              id="petName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Max, Luna, Buddy..."
              className="bg-white"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Continue */}
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full bg-royal hover:bg-royal-dark text-white py-6 text-base"
          >
            Continue to {preselectedStyle ? "Customize" : "Choose Style"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal border-t-transparent" />
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}
