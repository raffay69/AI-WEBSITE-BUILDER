import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  updateProfile,
  GithubAuthProvider
} from "firebase/auth";


export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName: string // Add displayName as an argument
) => {
  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update the user's profile with the displayName
    const user = userCredential.user;
    await updateProfile(user, {
      displayName: displayName,
    });
    return userCredential;
  } catch (error) {
    throw error;
  }
};

export const doSignInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
};

export const doSignInWithGoogle = async (): Promise<UserCredential> => {
    try {
      const provider = new GoogleAuthProvider();
      
      // Add these configurations
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ display: 'popup' });
  
      const result = await signInWithPopup(auth, provider);
      
      return result;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };


  export const doSignInWithGitHub = async (): Promise<UserCredential> => {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope("read:user"); // Request access to the user's profile info
      provider.addScope("user:email"); // Optional: Request access to the user's email
  
      const result = await signInWithPopup(auth, provider);
  
      // Get the GitHub access token
      const credential = GithubAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
  
      if (accessToken) {
        // Fetch the user's GitHub username
        const githubUsername = await fetchGitHubUsername(accessToken);
  
        // Update the Firebase user profile with the GitHub username
        if (githubUsername) {
          await updateProfile(result.user, {
            displayName: githubUsername,
          });
        }
      }
  
      return result;
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      throw error;
    }
  };
  
  // Helper function to fetch GitHub username
  const fetchGitHubUsername = async (accessToken: string): Promise<string | null> => {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch GitHub user info");
      }
  
      const data = await response.json();
      return data.login; // Return the GitHub username
    } catch (error) {
      console.error("Error fetching GitHub username:", error);
      return null;
    }
  };



export const doSignOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};