import axios from 'axios';

export async function createCheckout(data: any, apiUrl: string) {
  try {
    console.log('Sending payload to Yoco API:', JSON.stringify(data, null, 2)); // Debug log
    const response = await axios.post(apiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Yoco API Response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('Yoco API Error:', error.response || error.message); // Debug log
    throw error;
  }
}