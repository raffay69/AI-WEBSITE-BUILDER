import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app);


async function addUserContent(userId: any, title: any, content: any , prompt : string , chatID : string) {
  try {
    const docRef = await addDoc(collection(db, "userContent"), {
      userId: userId,
      title: title,
      content: content,
      prompt: prompt,
      chatID: chatID,
      timestamp: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}

// Function to get all content for a specific user 
// <------ for sidebar ----------->
async function getUserContent(userId: unknown) {
  const userContentRef = collection(db, "userContent");
  const q = query(userContentRef, where("userId", "==", userId));
  
  try {
    const querySnapshot = await getDocs(q);
    const userContent: {
      timestamp: Date;
      id: string;
      title:string;
      prompt: string;
      chatID: string 
}[] = [];
    querySnapshot.forEach((doc) => {
      userContent.push({
        id: doc.id,
        title: doc.data().title,
        timestamp: doc.data().timestamp.toDate(),
        chatID: doc.data().chatID,
        prompt:doc.data().prompt,  
      });
    });
    return userContent;
  } catch (e) {
    console.error("Error getting user content: ", e);
    throw e;
  }
}

async function getContentByIDPrompt(userId: unknown, prompt: string, chatID: string) {
  if (!userId || !prompt || !chatID) return null;
  
  const userContentRef = collection(db, "userContent");
  const q = query(
    userContentRef, 
    where("userId", "==", userId),
    where("prompt", "==", prompt),
    where("chatID", "==", chatID)
  );
  
  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    // Return the first matching document
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as any) 
    };
  } catch (e) {
    console.error("Error getting content by prompt and conversation: ", e);
    return null;
  }
}


async function updateContentByChatId(userId: any, chatId: string , content: any) {
  if (!userId || !chatId) {
    console.error("Missing userId or chatId for update");
    return;
  }
  
  try {
    // Find the document with the matching userId and chatId
    const userContentRef = collection(db, "userContent");
    const q = query(
      userContentRef, 
      where("userId", "==", userId),
      where("chatID", "==", chatId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Get the first matching document
      const docRef = doc(db, "userContent", querySnapshot.docs[0].id);
      
      // Update the document
      await updateDoc(docRef, {
        content: content
      });
      
      console.log("Document updated successfully for chatId:", chatId);
    } else {
      console.error("No document found with chatId:", chatId);
    }
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
}




export { app, auth , getUserContent , addUserContent , getContentByIDPrompt ,updateContentByChatId };