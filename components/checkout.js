import axios from "axios";
import getData from "@/pages/firebase/firestore/getData";
import app from "../pages/firebase/config";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore(app);
const auth = getAuth(app);

export default async function checkout(lineItems) {
  var customerID = "";
  await getData(db, "users", auth.currentUser.uid).then(async (ret) => {
    if (ret.result) {
      let object = ret.result.data();
      if (object) {
        customerID = object.customer_id;
      }
    }
  });

  for (let i = 0; i < lineItems.length; i++) {
    delete lineItems[i]["price"];
    delete lineItems[i]["metadata"];
    let id = lineItems[i]["id"];
    delete lineItems[i]["id"];

    const response = await axios.post("/api/retrieveItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        id: id,
      },
    });

    if (response.data.product) {
      let product = response.data.product;
      lineItems[i]["price"] = product.default_price;
    } else {
      console.log("Error creating stripe item");
    }
  }

  const response = await axios.post("/api/buyItem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      lineItems: lineItems,
      customer_id: customerID,
    },
  });

  if (response.data.session) {
    console.log("Success buying stripe item");
    window.location.href = response.data.session.url;
  } else {
    console.log("Error buying stripe item");
  }
}
