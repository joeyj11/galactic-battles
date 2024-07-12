import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  try {
    let id = req.body.body.id;

    const stripe = require('stripe')(process.env.NEXT_PRIVATE_API_KEY);
    const session = await stripe.products.update(
        id,
        {active: false}
    );

    if (session){
        console.log("Successfully deleted product with id:", session.id);
        return res.status(200).json({ id: session.id });
    }
    else {
        return res.status(500).json({ error: "Error creating product" });
    }
    
} catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
} 

