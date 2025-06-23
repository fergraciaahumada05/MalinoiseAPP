import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

export function withAuthProtection<P>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const [loading, setLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, user => {
        if (user && user.emailVerified) {
          setIsAllowed(true);
        } else {
          router.replace("/auth/login");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }, [router]);

    if (loading) return <div className="text-center mt-10">Cargando...</div>;
    if (!isAllowed) return null;
    return <Component {...(props as P)} />;
  };
}
