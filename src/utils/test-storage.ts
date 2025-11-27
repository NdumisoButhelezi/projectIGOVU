/**
 * Firebase Storage Test Utility
 * Quick test to verify Firebase Storage is properly configured
 */

import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function testFirebaseStorage(): Promise<{ success: boolean; message: string; url?: string }> {
  try {
    console.log('🧪 Testing Firebase Storage...');
    
    // Create a small test file
    const testData = 'data:text/plain;base64,SGVsbG8gRmlyZWJhc2UgU3RvcmFnZSE='; // "Hello Firebase Storage!"
    const testPath = `test/test_${Date.now()}.txt`;
    
    console.log('Creating storage reference:', testPath);
    const storageRef = ref(storage, testPath);
    
    console.log('Uploading test data...');
    const snapshot = await uploadString(storageRef, testData, 'data_url');
    
    console.log('Upload successful! Getting URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Firebase Storage is working!', downloadURL);
    return {
      success: true,
      message: 'Firebase Storage is properly configured!',
      url: downloadURL
    };
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
