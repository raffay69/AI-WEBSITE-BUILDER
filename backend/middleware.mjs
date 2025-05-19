import admin from "./firebase.mjs";

const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1]; 
  // console.log(idToken)
  
  if (!idToken) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach the decoded user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authenticate;