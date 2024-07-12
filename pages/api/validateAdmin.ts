 
import admin from '../../lib/firebaseAdmin'; // Adjust the path to your firebaseAdmin initialization file
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  try {
    // Check if the request has a user token
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the Firebase user ID token from the authorization header
    const idToken = req.headers.authorization.split('Bearer ')[1];

    // Verify the ID token and decode it to access custom claims
    const decodedToken = await admin.auth().verifyIdToken(idToken);
   
    // Check if the user has an 'admin' role
    if (decodedToken.admin === true ) {
      return res.status(200).json({ message: 'User is an admin' });
    } else {
      return res.status(403).json({ error: 'Access forbidden for non-admin users' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
