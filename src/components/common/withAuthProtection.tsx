import React, { ComponentType, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

function getDisplayName<T extends ComponentType<any>>(WrappedComponent: T) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

function withAuthProtection<P extends object>(Component: ComponentType<P>) {
  type WrappedComponentProps = React.ComponentProps<typeof Component>;

  const ProtectedComponent: React.FC<WrappedComponentProps> = (props) => {
    const [loading, setLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && user.emailVerified) {
          setIsAllowed(true);
        } else {
          router.replace("/auth/login");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-lg font-semibold text-teal-600">
            Cargando autenticación...
          </div>
        </div>
      );
    }
    if (!isAllowed) return null;
    return <Component {...props} />;
  };

  ProtectedComponent.displayName = `withAuthProtection(${getDisplayName(
    Component
  )})`;
  return ProtectedComponent;
}

export default withAuthProtection;
