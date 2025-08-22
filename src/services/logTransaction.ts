import { getFirestore, collection, addDoc, Timestamp, DocumentReference } from "firebase/firestore";
import { app } from "../config/firebase";

// Call this function after a successful payment
export async function logTransaction({
  customerName,
  customerEmail,
  amount,
  deliveryMethod,
  deliveryAddress,
  deliveryFee, // Ensure this is a string
  status = "initiated",
  items = [],
  ...rest
}: {
  customerName: string;
  customerEmail: string;
  amount: number;
  deliveryMethod: string;
  deliveryAddress: string;
  deliveryFee: string; // Updated type to string
  status?: string;
  items?: any[];
  [key: string]: any;
}): Promise<DocumentReference> {
  const db = getFirestore(app);
  const docRef = await addDoc(collection(db, "transactions"), {
    customerName,
    customerEmail,
    amount,
    deliveryMethod,
    deliveryAddress,
    deliveryFee,
    status,
    items,
    date: Timestamp.now().toMillis(),
    timestamp: Timestamp.now(),
    ...rest
  });
  
  return docRef;
}
