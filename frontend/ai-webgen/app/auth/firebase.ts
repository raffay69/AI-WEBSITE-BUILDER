import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  deleteField,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//TODO: add a type field for mobile
async function addUserContent(
  userId: any,
  title: any,
  content: any,
  prompt: string,
  chatID: string,
  type: string
) {
  try {
    const docRef = await addDoc(collection(db, "userContent"), {
      userId: userId,
      title: title,
      content: content,
      prompt: prompt,
      chatID: chatID,
      type: type,
      timestamp: new Date(),
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
      title: string;
      prompt: string;
      chatID: string;
      type: string;
    }[] = [];
    querySnapshot.forEach((doc) => {
      userContent.push({
        id: doc.id,
        title: doc.data().title,
        timestamp: doc.data().timestamp.toDate(),
        chatID: doc.data().chatID,
        prompt: doc.data().prompt,
        type: doc.data().type,
      });
    });
    return userContent;
  } catch (e) {
    console.error("Error getting user content: ", e);
    throw e;
  }
}

async function getContentByIDPrompt(
  userId: unknown,
  prompt: string,
  chatID: string
) {
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
      ...(doc.data() as any),
    };
  } catch (e) {
    console.error("Error getting content by prompt and conversation: ", e);
    return null;
  }
}

async function getHostURLAndHostingID(
  userId: unknown,
  prompt: string,
  chatID: string
) {
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
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      url: doc.data().url,
      hostingID: doc.data().hostingID,
    };
  } catch (e) {
    console.error("Error getting URL by prompt and conversation: ", e);
    return null;
  }
}

async function updateContentByChatId(
  userId: any,
  chatId: string,
  content: any
) {
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
        content: content,
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

async function addURLandHostingID(
  userId: any,
  chatId: string,
  prompt: string,
  URL: string,
  ID: string
) {
  if (!userId || !chatId || !prompt) {
    console.error("Missing userId or chatId for update");
    return;
  }

  try {
    // Find the document with the matching userId and chatId
    const userContentRef = collection(db, "userContent");
    const q = query(
      userContentRef,
      where("userId", "==", userId),
      where("chatID", "==", chatId),
      where("prompt", "==", prompt)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Get the first matching document
      const docRef = doc(db, "userContent", querySnapshot.docs[0].id);

      // Update the document
      await updateDoc(docRef, {
        url: URL,
        hostingID: ID,
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

async function deleteURLandHostingID(
  userId: any,
  chatId: string,
  prompt: string
) {
  if (!userId || !chatId || !prompt) {
    console.error("Missing userId or chatId for update");
    return;
  }

  try {
    // Find the document with the matching userId and chatId
    const userContentRef = collection(db, "userContent");
    const q = query(
      userContentRef,
      where("userId", "==", userId),
      where("chatID", "==", chatId),
      where("prompt", "==", prompt)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Get the first matching document
      const docRef = doc(db, "userContent", querySnapshot.docs[0].id);

      // Update the document
      await updateDoc(docRef, {
        url: deleteField(),
        hostingID: deleteField(),
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

async function deleteUserContent(userId: string, chatId: string) {
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
      const docToDelete = querySnapshot.docs[0];
      const docRef = doc(db, "userContent", docToDelete.id);

      // Delete the document
      await deleteDoc(docRef);

      console.log("Document successfully deleted for chatId:", chatId);
      return {
        success: true,
        message: "Content deleted successfully",
      };
    } else {
      console.warn("No document found with chatId:", chatId);
      return {
        success: false,
        message: "No matching document found",
      };
    }
  } catch (error) {
    console.error("Error deleting document: ", error);
    return {
      success: false,
      message: "Failed to delete content",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export {
  app,
  auth,
  getUserContent,
  addUserContent,
  getContentByIDPrompt,
  updateContentByChatId,
  deleteUserContent,
  getHostURLAndHostingID,
  addURLandHostingID,
  deleteURLandHostingID,
};
