import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../supabaseClient';
import JSZip from 'jszip';

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Bulk Upload Products
          </h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.startsWith('Error') 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : message.startsWith('Success') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ZIP File Structure
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
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

          <div 
            {...getRootProps({ 
              className: `border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`
            })}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop your ZIP file here, or click to select
              </p>
              <small className="text-gray-500">Maximum file size: 50MB</small>
            </div>
          </div>

          {zipFile && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-green-800 font-medium">Selected file: {zipFile.name}</span>
              </div>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                onClick={() => setZipFile(null)}
              >
                Remove
              </button>
            </div>
          )}

          {uploadProgress.total > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="mb-2">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-blue-800 font-medium text-center">
                {uploadProgress.current} of {uploadProgress.total} products uploaded
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button 
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                !zipFile || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
              onClick={handleUpload} 
              disabled={!zipFile || uploading}
            >
              {uploading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </div>
              ) : (
                'Upload Products'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBulkUpload;
