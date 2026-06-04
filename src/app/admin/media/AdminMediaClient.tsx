'use client';

import { useState, useRef, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { getUploadUrl, saveUploadedImage, updateImage, deleteImage } from './actions';
import Image from 'next/image';

type SiteImage = {
  id: string;
  storageId: string;
  title: string;
  alt: string;
  section: string;
  orderIndex: number;
  uploadedAt: number;
  url: string;
};

const SECTIONS = ['gallery', 'hero', 'about', 'weddings', 'events', 'corporate', 'guidos'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export default function AdminMediaClient({ initialImages }: { initialImages: SiteImage[] }) {
  const [images, setImages] = useState<SiteImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', alt: '', section: '' });
  const [filterSection, setFilterSection] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSection, setUploadSection] = useState('gallery');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [uploadError, setUploadError] = useState('');
  const filtered = filterSection === 'All' ? images : images.filter(img => img.section === filterSection);

  const handleFiles = useCallback((files: FileList | File[]) => {
    setUploadError('');
    const allFiles = Array.from(files);
    // Strict MIME type validation
    const invalidType = allFiles.filter(f => !ALLOWED_TYPES.includes(f.type));
    if (invalidType.length > 0) {
      setUploadError(`Unsupported file type: ${invalidType.map(f => f.name).join(', ')}. Use JPG, PNG, WebP, or AVIF.`);
      return;
    }
    // File size validation
    const oversized = allFiles.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      const names = oversized.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`);
      setUploadError(`Files too large (max 5MB): ${names.join(', ')}`);
      return;
    }
    setSelectedFiles(allFiles);
    // Auto-fill title from first filename
    if (!uploadTitle) {
      const name = allFiles[0].name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setUploadTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [uploadTitle]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${selectedFiles.length}...`);

        // Step 1: Get upload URL from server action
        const uploadUrl = await getUploadUrl();

        // Step 2: POST file to Convex storage
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await result.json();

        // Step 3: Save metadata via server action
        const title = selectedFiles.length === 1
          ? uploadTitle
          : `${uploadTitle} ${i + 1}`;

        await saveUploadedImage({
          storageId,
          title,
          alt: title,
          section: uploadSection,
        });
      }

      // Refresh — the page will revalidate
      setUploadProgress('Done! Refreshing...');
      window.location.reload();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadProgress('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setSelectedFiles([]);
      setUploadTitle('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    try {
      await deleteImage(id);
      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const startEdit = (img: SiteImage) => {
    setEditingId(img.id);
    setEditForm({ title: img.title, alt: img.alt, section: img.section });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateImage(editingId, editForm);
      setImages(images.map(img =>
        img.id === editingId ? { ...img, ...editForm } : img
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #E5E7EB',
    borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit',
  };

  return (
    <div>
      {/* Visually-hidden live region announces upload progress / failure to screen readers */}
      <div role="status" aria-live="polite" style={{
        position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
        overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
      }}>{uploadProgress}</div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Media Library</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            {images.length} image{images.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => fileInputRef.current?.click()}
        >
          + Upload Images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          aria-label="Upload images"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? '#111' : '#D1D5DB'}`,
          borderRadius: '10px',
          padding: selectedFiles.length > 0 ? '1.5rem' : '3rem',
          textAlign: 'center',
          marginBottom: '2rem',
          backgroundColor: dragActive ? 'rgba(0,0,0,0.02)' : '#FAFAFA',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() => selectedFiles.length === 0 && fileInputRef.current?.click()}
      >
        {selectedFiles.length === 0 ? (
          <>
            <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '0.75rem' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Drag and drop images here, or click to browse
            </p>
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Supports JPG, PNG, WebP, AVIF — max 5MB per file
            </p>
            {uploadError && (
              <p role="alert" style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.5rem', fontWeight: 500 }}>
                {uploadError}
              </p>
            )}
          </>
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem' }}>
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>

            {/* Preview thumbnails */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {selectedFiles.slice(0, 6).map((file, i) => (
                <div key={i} style={{
                  width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden',
                  border: '1px solid #E5E7EB', position: 'relative',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
              {selectedFiles.length > 6 && (
                <div style={{
                  width: '80px', height: '80px', borderRadius: '6px', border: '1px solid #E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', color: '#6B7280', fontWeight: 500,
                }}>
                  +{selectedFiles.length - 6}
                </div>
              )}
            </div>

            {/* Upload metadata form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>
                  Title *
                </span>
                <input
                  style={inputStyle}
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Wedding Entrée"
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>
                  Section
                </span>
                <select style={inputStyle} value={uploadSection} onChange={(e) => setUploadSection(e.target.value)}>
                  {SECTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleUpload}
                disabled={uploading || !uploadTitle}
              >
                {uploading ? uploadProgress : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
              </button>
              <button className="admin-btn" onClick={() => { setSelectedFiles([]); setUploadTitle(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['All', ...SECTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilterSection(s)}
            className={`admin-btn admin-btn--sm ${filterSection === s ? 'admin-btn--primary' : ''}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((img) => (
          <div key={img.id} style={{
            background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px',
            overflow: 'hidden', transition: 'box-shadow 0.2s',
          }}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#F3F4F6' }}>
              {img.url ? (
                <Image src={img.url} alt={img.alt} fill sizes="220px" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.8rem' }}>
                  No preview
                </div>
              )}
            </div>

            {/* Metadata */}
            <div style={{ padding: '0.75rem' }}>
              {editingId === img.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input aria-label="Image title" style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                  <input aria-label="Alt text" style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} value={editForm.alt} onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })} placeholder="Alt text" />
                  <select aria-label="Image section" style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} value={editForm.section} onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}>
                    <option value="">No section</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={handleSaveEdit}>Save</button>
                    <button className="admin-btn admin-btn--sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {img.title}
                  </div>
                  {img.section && (
                    <span style={{
                      fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: '#EEF3FF', color: '#2563EB', padding: '0.15rem 0.4rem', borderRadius: '3px',
                      fontWeight: 600,
                    }}>
                      {img.section}
                    </span>
                  )}
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.35rem' }}>
                    {new Date(img.uploadedAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>
                    <button className="admin-btn admin-btn--sm" onClick={() => startEdit(img)}>Edit</button>
                    <button className="admin-btn admin-btn--sm" onClick={() => handleDelete(img.id)} style={{ color: '#DC2626' }}>Delete</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: '#9CA3AF' }}>
            <p style={{ fontSize: '0.9rem' }}>No images{filterSection !== 'All' ? ` in "${filterSection}"` : ''} yet.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Upload your first image using the drop zone above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
