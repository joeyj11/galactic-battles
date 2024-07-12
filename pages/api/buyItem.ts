import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  try {

    let lineItems = req.body.body.lineItems;
    let customer_id = req.body.body.customer_id;

    const stripe = require('stripe')(process.env.NEXT_PRIVATE_API_KEY);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url:`https://www.google.com`,
        cancel_url: 'https://www.yahoo.com',
        customer: customer_id,
        shipping_address_collection: {
            allowed_countries: ['US', 'CA'],
        },
        metadata: {
          date : String(new Date()),
        },
      });

    if (session){
        console.log("Successfully purchased product with id:", session);
        return res.status(200).json({ session: session });
    }
    else {
        return res.status(500).json({ error: "Error purchasing product" });
    }
    
} catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
} 

