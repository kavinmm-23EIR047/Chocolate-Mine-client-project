import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import compressImage from '../../utils/compressImage';

const ImageUpload = ({ value, onChange, label = 'Upload Image', accept = 'image/*', compress = true }) => {
  const [preview, setPreview] = useState(value || null);
  const [compressing, setCompressing] = useState(false);
  const [stats, setStats] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (!value) {
      setPreview(null);
      setStats(null);
    }
  }, [value]);

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let finalFile = file;
    const origSize = file.size;

    if (compress && file.type.startsWith('image/')) {
      try {
        setCompressing(true);
        finalFile = await compressImage(file);
        const formatName = finalFile.type.split('/')[1]?.toUpperCase() || 'WEBP';
        setStats({
          originalSize: formatSize(origSize),
          compressedSize: formatSize(finalFile.size),
          format: formatName,
          reducedPercent: Math.round(((origSize - finalFile.size) / origSize) * 100)
        });
      } catch (err) {
        console.warn('Image compression fallback to original file:', err);
      } finally {
        setCompressing(false);
      }
    }

    const objectUrl = URL.createObjectURL(finalFile);
    setPreview(objectUrl);
    onChange(finalFile);
  };

  const handleRemove = () => {
    setPreview(null);
    setStats(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-muted uppercase tracking-widest">{label}</label>
        {stats && (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Sparkles size={10} />
            {stats.compressedSize} ({stats.format}) • {stats.reducedPercent > 0 ? `-${stats.reducedPercent}% size` : 'Optimized'}
          </span>
        )}
      </div>

      {compressing ? (
        <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="text-primary animate-spin" />
          <div className="text-center">
            <p className="text-sm font-black text-heading">Compressing & Optimizing Image...</p>
            <p className="text-xs text-muted mt-0.5">Converting to high-quality WebP format</p>
          </div>
        </div>
      ) : preview ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-border group shadow-sm">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {stats && (
            <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-md">
              <Sparkles size={11} className="text-amber-400" />
              <span>{stats.compressedSize}</span>
              <span className="text-white/40">|</span>
              <span className="text-emerald-400">High Quality {stats.format}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-90 group-hover:opacity-100 transition-all shadow-lg"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-input cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors group"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <ImageIcon size={24} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-heading">Click to upload</p>
            <p className="text-xs text-muted mt-1">PNG, JPG, WEBP • Auto-compressed for good quality</p>
          </div>
          <div className="flex items-center gap-2 bg-button-alt-bg text-button-alt-text border border-border px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest group-hover:bg-button-bg group-hover:text-button-text transition-all shadow-premium-sm">
            <Upload size={14} />
            Browse Files
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUpload;
