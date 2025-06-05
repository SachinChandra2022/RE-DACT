import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body to get the image link
    const { fileLink } = await request.json();

    // Check if the image link is provided
    if (!fileLink) {
      return NextResponse.json({ error: 'Image link is required' }, { status: 400 });
    }

    // Dummy data - vulnerable fields
    const vulnerableFields = [
      'Account Number',
      'Passport Number',
      'Social Security Number',
      'Credit Card Number',
      'Driver’s License Number',
    ];
    console.log(fileLink)
    // Return the dummy array as a JSON response
    return NextResponse.json({ vulnerableFields });
  } catch (error) {
    // Handle errors and send a response with a status code of 500
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
