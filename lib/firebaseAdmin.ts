import admin from 'firebase-admin';

const serviceAccount = require('../secret.json'); // Replace with the path to your JSON key file
if (!admin.apps.length) {
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // You can also specify other Firebase settings here, such as databaseURL, storageBucket, etc.
},);
}
export default admin;

