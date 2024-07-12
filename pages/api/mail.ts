import { NextApiRequest, NextApiResponse } from 'next';
import { email } from '@/types/email';
import { EmailAuthCredential } from 'firebase/auth';

export default function handler(
  
  request: NextApiRequest,
  response: NextApiResponse,
)  {
 let nodemailer = require('nodemailer');
/* --- Select AWS SDK version by uncommenting correct version --- */


let aws = require('@aws-sdk/client-ses');

const AWS_ACCESS_KEY_ID = process.env.accessKeyID
const AWS_SECRET_ACCESS_KEY = process.env.secretAccessKey;
const AWS_REGION = process.env.region;

let email:email = JSON.parse(request.body);

const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: AWS_REGION,
  credentials: {
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      accessKeyId: AWS_ACCESS_KEY_ID
  }
});

let transporter = nodemailer.createTransport({
  SES: { ses, aws },
  sendingRate: 1
});

transporter.once('idle', () => {
  if (transporter.isIdle()) {
      transporter.sendMail(
        {
            from: email.source,
            to: email.destination,
      
            subject: 'Message from Rouke at'  + Date(),
            text: email.body,
        },
        (err: any, info: any) => {
            console.log(err || info);
            if (err){
              response.status(500).json({error: "failed to send email"
              });
            } else {
              response.status(200).json({
                email: email.body,
                status: "sent"
                });
            }
        }
      );
  }
});

}