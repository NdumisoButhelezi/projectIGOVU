/**
 * Direct Storage Upload Test
 * Bypasses compression to test raw upload capability
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function testDirectUpload(): Promise<void> {
  try {
    console.log('🧪 Testing direct upload to Firebase Storage...');
    console.log('Storage bucket:', storage.app.options.storageBucket);
    
    // Create a tiny test blob
    const testBlob = new Blob(['Hello Firebase Storage Test!'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    console.log('Test file created:', {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type
    });
    
    // Create reference
    const storageRef = ref(storage, `Images/test_${Date.now()}.txt`);
    console.log('Storage reference created:', storageRef.fullPath);
    
    // Try upload
    console.log('Starting upload...');
    const snapshot = await uploadBytes(storageRef, testFile);
    console.log('✅ Upload successful!');
    console.log('Snapshot:', {
      fullPath: snapshot.ref.fullPath,
      bucket: snapshot.ref.bucket,
      size: snapshot.metadata.size
    });
    
    // Get URL
    const url = await getDownloadURL(snapshot.ref);
    console.log('✅ Download URL:', url);
    
    console.log('🎉 Direct upload test PASSED!');
  } catch (error) {
    console.error('❌ Direct upload test FAILED:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: (error as any).code,
        serverResponse: (error as any).serverResponse
      });
    }
    throw error;
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  console.log('Direct upload test available. Run testDirectUpload() to test.');
}
