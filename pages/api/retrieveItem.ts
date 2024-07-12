import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  try {
    // Check if the request has a user token
    let id = req.body.body.id;

    const stripe = require('stripe')(process.env.NEXT_PRIVATE_API_KEY);
    
    const session = await stripe.products.retrieve(id);

    if (session){
        console.log("Successfully retrieved product with id:", session.id);
        return res.status(200).json({ product: session });
    }
    else {
        return res.status(500).json({ error: "Error creating product" });
    }
    
} catch (e) {
    console.log(e);
    return res.status(500).json({ error: e });
  }
} 

