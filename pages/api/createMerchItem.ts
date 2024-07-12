import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  try {
    // Check if the request has a user token
    let merchItem = req.body.body.merchItem;
    let image = req.body.body.image

    const stripe = require('stripe')(process.env.NEXT_PRIVATE_API_KEY);
    console.log(image);
    const session = await stripe.products.create({
        name: merchItem.name,
        active: merchItem.live,
        description: merchItem.description,
        metadata: {
          image: image,
        },
        images: [image],
        default_price_data: {
          unit_amount : Math.round(merchItem.price * 100),
          currency : "USD",
        },
        
    });

    if (session){
        console.log("Successfully created product with id:", session.id);
        return res.status(200).json({ product_id: session.id });
    }
    else {
        return res.status(500).json({ error: "Error creating product" });
    }
    
} catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
} 

