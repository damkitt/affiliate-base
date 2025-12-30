import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { HiMagnifyingGlassMinus, HiMagnifyingGlassPlus, HiXMark, HiCheck } from "react-icons/hi2";
import getCroppedImg from "@/lib/cropImage";

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: File) => void;
    onCancel: () => void;
}

export function ImageCropper({
    imageSrc,
    onCropComplete,
    onCancel,
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCroppedAreaChange = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSave = async () => {
        try {
            const croppedBlob = (await getCroppedImg(
                imageSrc,
                croppedAreaPixels
            )) as Blob;

            const file = new File([croppedBlob], "cropped-logo.jpg", {
                type: "image/jpeg",
            });
            onCropComplete(file);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with heavy blur */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-[420px] bg-[#111111] rounded-[20px] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col ring-1 ring-white/5">

                {/* Header */}
                <div className="px-5 py-4 flex justify-between items-center border-b border-white/5 bg-[#111111] z-10">
                    <h3 className="text-[14px] font-semibold text-white tracking-wide">Adjust Image</h3>
                    <button
                        onClick={onCancel}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors hover:text-white text-zinc-400"
                    >
                        <HiXMark className="w-4 h-4" />
                    </button>
                </div>

                {/* Cropper Container */}
                <div className="relative h-[320px] w-full bg-[#050505]">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCroppedAreaChange}
                        showGrid={true}
                        cropShape="rect"
                        style={{
                            containerStyle: { background: '#050505' },
                            cropAreaStyle: {
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.85)',
                                borderRadius: '0',
                                color: 'rgba(255, 255, 255, 0.5)' // Grid color
                            },
                            mediaStyle: { transition: 'transform 0.1s' } // Smoother drag
                        }}
                    />
                </div>

                {/* Footer / Controls */}
                <div className="px-5 py-5 bg-[#111111] space-y-6">

                    {/* Zoom Control */}
                    <div className="flex items-center gap-4">
                        <HiMagnifyingGlassMinus className="w-4 h-4 text-zinc-500" />
                        <div className="relative flex-1 group h-6 flex items-center">
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.01}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                            />
                        </div>
                        <HiMagnifyingGlassPlus className="w-4 h-4 text-zinc-500" />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onCancel}
                            className="py-2.5 rounded-lg border border-white/10 text-[13px] font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="py-2.5 rounded-lg bg-white text-black text-[13px] font-semibold hover:bg-zinc-200 transition-all shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                        >
                            <HiCheck className="w-4 h-4" />
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
