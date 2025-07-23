import { supabase } from './supabaseClient';

// Function to ensure user is authenticated
const ensureAuthenticated = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (!session) {
    // Try to sign in with service role
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.REACT_APP_SUPABASE_ADMIN_EMAIL,
      password: process.env.REACT_APP_SUPABASE_ADMIN_PASSWORD
    });
    
    if (signInError) {
      console.error('Authentication failed:', signInError);
      return false;
    }
  }
  return true;
};

// Function to check if storage bucket exists and is accessible
export const checkStorageAccess = async () => {
  try {
    // Ensure we're authenticated first
    const isAuthenticated = await ensureAuthenticated();
    if (!isAuthenticated) {
      console.warn('Not authenticated');
      return false;
    }

    // Try to list buckets to see what's available
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.warn('Could not list buckets:', listError);
      return false;
    }

    console.log('Available buckets:', buckets);

    // Check if lumestock-files bucket exists
    const bucketExists = buckets.some(bucket => bucket.name === 'lumestock-files');

    if (bucketExists) {
      console.log('lumestock-files bucket found');
      return true;
    } else {
      // Try to create the bucket
      try {
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('lumestock-files', {
          public: true,
          fileSizeLimit: 52428800, // 50MB in bytes
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/postscript',
            'image/svg+xml',
            'application/illustrator',
            'application/x-coreldraw'
          ]
        });

        if (createError) {
          console.error('Failed to create bucket:', createError);
          return false;
        }

        console.log('Created lumestock-files bucket successfully');
        return true;
      } catch (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking storage access:', error);
    return false;
  }
};

// Function to test upload permissions
export const testUploadPermissions = async () => {
  try {
    // Create a small test file
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;

    const { data, error } = await supabase.storage
      .from('lumestock-files')
      .upload(`test/${testFileName}`, testFile);

    if (error) {
      console.error('Upload test failed:', error);
      return false;
    }

    // Clean up test file
    await supabase.storage
      .from('lumestock-files')
      .remove([`test/${testFileName}`]);

    console.log('Upload permissions test passed');
    return true;
  } catch (error) {
    console.error('Error testing upload permissions:', error);
    return false;
  }
};

// Updated initialization function
export const initializeStorage = async () => {
  try {
    console.log('Checking storage access...');
    
    // Try multiple times in case of initial auth delay
    for (let i = 0; i < 3; i++) {
      const storageReady = await checkStorageAccess();
      
      if (storageReady) {
        const permissionsOk = await testUploadPermissions();
        if (permissionsOk) {
          console.log('Storage setup complete and ready for uploads');
          return true;
        } else {
          console.warn('Storage bucket exists but upload permissions may be limited');
        }
        break;
      }
      
      if (i < 2) {
        console.log('Retrying storage initialization...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }

    // Final warning if still not ready
    console.warn('Storage initialization incomplete. Some features may be limited.');
    return true; // Allow app to continue
  } catch (error) {
    console.error('Error initializing storage:', error);
    return true; // Allow app to continue
  }
};

