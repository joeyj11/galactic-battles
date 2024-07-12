import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  try {
    // Check if the request has a user toke
    let customer_email = req.body.body.email;
    const stripe = require('stripe')(process.env.NEXT_PRIVATE_API_KEY);

    const customer = await stripe.customers.create({
        email: customer_email,
    });

    if (customer){
        console.log("Successfully created customer with id:", customer.id);
        return res.status(200).json({ id: customer.id });
    }
    else {
        return res.status(500).json({ error: "Error creating customer" });
    }
    
} catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
} 

