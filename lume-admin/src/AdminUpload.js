import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useDropzone } from 'react-dropzone';
import './AdminUpload.css';

const initialState = {
  title: '',
  description: '',
  old_price: '',
  new_price: '',
  category: '',
  tags: '',
  orientation: '',
  license: '',
  thumbnail: null,
  file: null,
};

const categories = [
  'Nature', 'Business', 'Technology', 'People', 'Animals', 'Travel', 'Food', 'Abstract', 'Other'
];
const orientations = ['landscape', 'portrait', 'square'];
const licenses = ['free', 'premium'];

function AdminUpload() {
  const [form, setForm] = useState(initialState);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!session || error) {
          // Try to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: process.env.REACT_APP_SUPABASE_ADMIN_EMAIL,
            password: process.env.REACT_APP_SUPABASE_ADMIN_PASSWORD,
          });
          
          if (signInError) {
            if (signInError.message === 'Email not confirmed') {
              setMessage('Error: Please confirm your email address or ask an administrator to confirm your account in the Supabase dashboard.');
            } else {
              setMessage(`Error: ${signInError.message}`);
            }
            console.error('Authentication failed:', signInError);
            return;
          }
        }
        setIsAuthenticated(true);
        setMessage(''); // Clear any error messages if auth succeeds
      } catch (error) {
        console.error('Unexpected error during authentication:', error);
        setMessage('Error: An unexpected error occurred during authentication');
      }
    };

    checkAuth();
  }, []);

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        setMessage('Error: Authentication failed');
      } else if (!session) {
        setMessage('Error: Please login to upload products');
      }
    };
    checkSession();
  }, []);

  const removeThumbnail = () => {
    setForm(f => ({ ...f, thumbnail: null }));
    setThumbnailPreview(null);
  };

  const removeFile = () => {
    setForm(f => ({ ...f, file: null }));
    setFilePreview(null);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onThumbnailDrop = acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      setForm(f => ({ ...f, thumbnail: file }));
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const onFileDrop = acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      setForm(f => ({ ...f, file: file }));
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps, isDragActive: isThumbnailDragActive } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps, isDragActive: isFileDragActive } = useDropzone({
    onDrop: onFileDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/postscript': ['.eps'],
      'image/svg+xml': ['.svg'],
      'application/illustrator': ['.ai'],
      'application/x-coreldraw': ['.cdr']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB limit
  });

  const uploadFileToSupabase = async (file, folder) => {
    try {
      // Check if the bucket exists, if not this will throw an error
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        throw new Error('Storage is not properly configured: ' + bucketError.message);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('lumestock-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('lumestock-files')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      if (!form.title || !form.new_price || !form.category || !form.orientation || !form.license) {
        throw new Error('Please fill in all required fields');
      }

      if (!form.thumbnail) {
        throw new Error('Please upload a thumbnail image');
      }

      if (!form.file) {
        throw new Error('Please upload a product file');
      }

      setMessage('Uploading files...');

      let thumbUrl = '';
      try {
        thumbUrl = await uploadFileToSupabase(form.thumbnail, 'thumbnails');
      } catch (error) {
        throw new Error(`Failed to upload thumbnail: ${error.message}`);
      }

      let fileUrl = '';
      try {
        fileUrl = await uploadFileToSupabase(form.file, 'files');
      } catch (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      setMessage('Saving product data...');

      const productData = {
        title: form.title,
        description: form.description,
        old_price: form.old_price ? parseFloat(form.old_price) : null,
        new_price: parseFloat(form.new_price),
        category: form.category,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        orientation: form.orientation,
        license: form.license,
        thumbnail: thumbUrl,
        file_url: fileUrl,
      };

      const { error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select(); // Add select() to get the inserted data back

      if (insertError) {
        console.error('Product insert error:', insertError);
        throw new Error(`Failed to save product: ${insertError.message}`);
      }

      setMessage('Upload successful!');
      setForm(initialState);
      setThumbnailPreview(null);
      setFilePreview(null);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-upload-page">
      <form className="admin-upload-form" onSubmit={handleSubmit}>
        <h2>📤 Upload New Product</h2>
        {message && <div className={message.startsWith('Error') ? 'admin-error' : 'admin-success'}>{message}</div>}
        
        {/* Basic Information Section */}
        <div className="form-section">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Product Title *"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Product Description *"
            rows={4}
            required
          />
        </div>

        {/* Pricing Section */}
        <div className="admin-row">
          <input
            name="old_price"
            value={form.old_price}
            onChange={handleChange}
            placeholder="Original Price (optional)"
            type="number"
            min="0"
            step="0.01"
          />
          <input
            name="new_price"
            value={form.new_price}
            onChange={handleChange}
            placeholder="Current Price *"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Product Details Section */}
        <div className="admin-row">
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">📁 Select Category *</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select name="orientation" value={form.orientation} onChange={handleChange} required>
            <option value="">📐 Orientation *</option>
            {orientations.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
          </select>
          <select name="license" value={form.license} onChange={handleChange} required>
            <option value="">🔐 License Type *</option>
            {licenses.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
        </div>

        {/* Tags Section */}
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="🏷️ Tags (comma separated, e.g., design, vector, business)"
        />

        {/* File Upload Section */}
        <div className="admin-row">
          <div className="dropzone-container">
            <h3>📸 Thumbnail Image</h3>
            <div {...getThumbnailRootProps({ className: `dropzone ${isThumbnailDragActive ? 'active' : ''}` })}>
              <input {...getThumbnailInputProps()} />
              <p>📤 Drag & drop thumbnail here, or click to select</p>
              <small>Supported: JPG, PNG, GIF, WebP (max 5MB)</small>
            </div>
            {thumbnailPreview && (
              <div className="preview-container">
                <img src={thumbnailPreview} alt="Thumbnail Preview" className="preview-image" />
                <button type="button" className="remove-btn" onClick={removeThumbnail}>❌ Remove</button>
              </div>
            )}
          </div>
          
          <div className="dropzone-container">
            <h3>📁 Product File</h3>
            <div {...getFileRootProps({ className: `dropzone ${isFileDragActive ? 'active' : ''}` })}>
              <input {...getFileInputProps()} />
              <p>📤 Drag & drop product file here, or click to select</p>
              <small>Supported: CDR, SVG, AI, EPS, PDF, JPG, PNG (max 50MB)</small>
            </div>
            {filePreview && (
              <div className="preview-container">
                <img src={filePreview} alt="File Preview" className="preview-image" />
                <button type="button" className="remove-btn" onClick={removeFile}>❌ Remove</button>
              </div>
            )}
            {form.file && !filePreview && (
              <div className="preview-container">
                <p>📄 File selected: {form.file.name}</p>
                <small>Size: {(form.file.size / 1024 / 1024).toFixed(2)} MB</small>
                <button type="button" className="remove-btn" onClick={removeFile}>❌ Remove</button>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={uploading || !isAuthenticated}>
          {uploading ? '⏳ Uploading...' : '🚀 Upload Product'}
        </button>
      </form>
    </div>
  );
}

export default AdminUpload;