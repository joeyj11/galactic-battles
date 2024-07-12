import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  try {
    // Check if the request has a user token
    let customer_id = req.body.body.customer_id;

    const stripe = require('stripe')(process.env.NEXT_PRIVATE_API_KEY);

    const session = await stripe.checkout.sessions.list({
        limit: 100,
        customer: customer_id,
    })

    if (session){
        let products:any = []
        for(let i = 0; i < session.data.length; i++){
            const lineItems = await stripe.checkout.sessions.listLineItems(
                session.data[i].id,
                { limit: 100 },
            );
            if (lineItems){
                let temp = []
                for(let j = 0; j < lineItems.data.length; j++){
                    let temp2 = {
                        prod_id: lineItems.data[j].price.product,
                        quantity: lineItems.data[j].quantity,
                        price: lineItems.data[j].price.unit_amount / 100,
                    }
                    temp.push(temp2)
                }
                console.log(temp);
                products.push(temp);
            }
        }
        // products = [ [{prod_id: ..., quantity: ..., price: ...} , {...}], [{...}], ...]
        //console.log("Successfully retrieved order history with id: ", session.data);
        return res.status(200).json({ data: [session.data, products]});
    }
    else {
        return res.status(500).json({ error: "Error retrieving history" });
    }
    
} catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
} 

