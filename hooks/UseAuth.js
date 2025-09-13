import { useState, useEffect } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/configuration/firebase-config";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await getIdTokenResult(user)
        .then((idTokenResult) => {
          setIsAdmin(!!idTokenResult.claims.isAdmin);
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAdmin };
};

export default useAuth;
