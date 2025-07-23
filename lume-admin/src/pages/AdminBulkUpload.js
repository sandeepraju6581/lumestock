import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../supabaseClient';
import JSZip from 'jszip';
import './AdminBulkUpload.css';

function AdminBulkUpload() {
  const [zipFile, setZipFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      if (file?.type === 'application/zip' || file?.type === 'application/x-zip-compressed') {
        setZipFile(file);
        setMessage('');
      } else {
        setMessage('Error: Please upload a ZIP file');
      }
    },
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB limit
  });

  const validateProductData = (product) => {
    const required = ['title', 'description', 'new_price', 'category', 'orientation', 'license', 'thumbnail_file', 'product_file'];
    const missing = required.filter(field => !product[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  };

  const uploadFileToSupabase = async (base64Data, folder, fileName) => {
    try {
      // Convert base64 to blob
      const base64Response = await fetch(base64Data);
      const blob = await base64Response.blob();
      
      const fileExt = fileName.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from('lumestock-files')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('lumestock-files')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!zipFile) {
      setMessage('Error: Please select a ZIP file');
      return;
    }

    try {
      setUploading(true);
      setMessage('Reading ZIP file...');

      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile);
      
      // Find and read products.json
      const productsFile = contents.file('products.json');
      if (!productsFile) {
        throw new Error('ZIP file must contain a products.json file');
      }

      const productsContent = await productsFile.async('string');
      const products = JSON.parse(productsContent);

      if (!Array.isArray(products)) {
        throw new Error('JSON file must contain an array of products');
      }

      setUploadProgress({ current: 0, total: products.length });

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        try {
          validateProductData(product);

          // Get and upload thumbnail file
          const thumbnailFile = contents.file(product.thumbnail_file);
          if (!thumbnailFile) {
            throw new Error(`Thumbnail file not found: ${product.thumbnail_file}`);
          }
          const thumbnailBlob = await thumbnailFile.async('blob');
          const thumbnailExt = product.thumbnail_file.split('.').pop();
          const thumbnailFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${thumbnailExt}`;
          
          const { data: thumbData, error: thumbError } = await supabase.storage
            .from('lumestock-files')
            .upload(`thumbnails/${thumbnailFileName}`, thumbnailBlob, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (thumbError) throw thumbError;
          
          const { data: thumbUrlData } = supabase.storage
            .from('lumestock-files')
            .getPublicUrl(`thumbnails/${thumbnailFileName}`);
          
          const thumbnailUrl = thumbUrlData.publicUrl;

          // Get and upload product file
          const productFile = contents.file(product.product_file);
          if (!productFile) {
            throw new Error(`Product file not found: ${product.product_file}`);
          }
          const productBlob = await productFile.async('blob');
          const productExt = product.product_file.split('.').pop();
          const productFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${productExt}`;
          
          const { data: fileData, error: fileError } = await supabase.storage
            .from('lumestock-files')
            .upload(`files/${productFileName}`, productBlob, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (fileError) throw fileError;
          
          const { data: fileUrlData } = supabase.storage
            .from('lumestock-files')
            .getPublicUrl(`files/${productFileName}`);
          
          const fileUrl = fileUrlData.publicUrl;

          const productData = {
            title: product.title,
            description: product.description,
            old_price: product.old_price || null,
            new_price: product.new_price,
            category: product.category,
            tags: Array.isArray(product.tags) ? product.tags : [],
            orientation: product.orientation,
            license: product.license,
            thumbnail: thumbnailUrl,
            file_url: fileUrl,
          };

          const { error: insertError } = await supabase
            .from('products')
            .insert([productData]);

          if (insertError) throw insertError;

          setUploadProgress(prev => ({ ...prev, current: i + 1 }));
          setMessage(`Progress: ${i + 1}/${products.length} products uploaded`);

        } catch (error) {
          console.error(`Error uploading product ${i + 1}:`, error);
          setMessage(`Error in product ${i + 1}: ${error.message}`);
          return;
        }
      }

      setMessage(`Success! Uploaded ${products.length} products`);
      setZipFile(null);
      setUploadProgress({ current: 0, total: 0 });

    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-bulk-upload-page">
      <div className="bulk-upload-container">
        <h2>Bulk Upload Products</h2>
        {message && (
          <div className={message.startsWith('Error') ? 'admin-error' : 
                         message.startsWith('Success') ? 'admin-success' : 
                         'admin-info'}>
            {message}
          </div>
        )}

        <div className="json-format-info">
          <h3>ZIP File Structure</h3>
          <pre>
{`your-upload.zip/
  ├── products.json   # Required - Contains product information
  ├── images/        # Folder containing all images
  │   ├── thumb1.jpg
  │   ├── thumb2.png
  │   └── ...
  └── files/         # Folder containing all product files
      ├── file1.cdr
      ├── file2.ai
      └── ...

# products.json format:
[
  {
    "title": "Product Title",
    "description": "Product Description",
    "new_price": 29.99,
    "old_price": 39.99,      // Optional
    "category": "Nature",
    "tags": ["tag1", "tag2"], // Optional
    "orientation": "landscape",
    "license": "premium",
    "thumbnail_file": "images/thumb1.jpg",  // Required - Path to thumbnail in ZIP
    "product_file": "files/file1.cdr"       // Required - Path to product file in ZIP
  }
]`}
          </pre>
        </div>

        <div {...getRootProps({ className: `json-dropzone ${isDragActive ? 'active' : ''}` })}>
          <input {...getInputProps()} />
          <p>Drag & drop your ZIP file here, or click to select</p>
          <small>Maximum file size: 50MB</small>
        </div>

        {zipFile && (
          <div className="file-info">
            <p>Selected file: {zipFile.name}</p>
            <button className="remove-btn" onClick={() => setZipFile(null)}>Remove</button>
          </div>
        )}

        {uploadProgress.total > 0 && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
            <p>{uploadProgress.current} of {uploadProgress.total} products uploaded</p>
          </div>
        )}

        <button 
          className="upload-btn" 
          onClick={handleUpload} 
          disabled={!zipFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Products'}
        </button>
      </div>
    </div>
  );
}

export default AdminBulkUpload;
