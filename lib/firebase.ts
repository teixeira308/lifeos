import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { app, auth } from "./firebase-auth";

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
