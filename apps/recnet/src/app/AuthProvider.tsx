"use client";

import { getAuth, onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { getFirebaseApp } from "@recnet/recnet-web/firebase/client";
import { User, UserSchema } from "@recnet/recnet-web/types/user";
import { getErrorMessage } from "@recnet/recnet-web/utils/error";
import { fetchWithZod } from "@recnet/recnet-web/utils/zodFetch";

import { AuthContext } from "./AuthContext";

export interface AuthProviderProps {
  serverUser: User | null;
  children: React.ReactNode;
}

async function toUser(firebaseUser: FirebaseUser): Promise<User | null> {
  if (!firebaseUser.email) {
    return null;
  }
  try {
    const user = await fetchWithZod(
      UserSchema,
      `/api/userByEmail?email=${firebaseUser.email}`
    );
    return user;
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new Error("ZodError: Invalid user format");
    } else {
      throw new Error("User not found");
    }
  }
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  serverUser,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(serverUser);

  async function revalidateUser() {
    const firebaseUser = getAuth(getFirebaseApp()).currentUser;
    if (!firebaseUser) {
      setUser(null);
      return;
    }
    const user = await toUser(firebaseUser);
    setUser(user);
  }

  const handleIdTokenChanged = useCallback(
    async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();

        // Sets authenticated user cookies
        await fetch("/api/login", {
          headers: {
            Authorization: `Bearer ${idTokenResult.token}`,
          },
        });
        try {
          const user = await toUser(firebaseUser);
          setUser(user);
          if (pathname === "/") {
            router.replace("/feeds");
          }
        } catch (error) {
          const errorMsg = getErrorMessage(error);
          if (errorMsg === "User not found") {
            // create user and redirect
            router.replace("/onboard");
          } else {
            toast.error("Failed to authenticate user. Contact support.");
          }
        }
        return;
      }

      // Removes authenticated user cookies
      await fetch("/api/logout");
      setUser(null);
    },
    [pathname, router]
  );

  useEffect(() => {
    return onIdTokenChanged(getAuth(getFirebaseApp()), handleIdTokenChanged);
  }, [handleIdTokenChanged]);

  return (
    <AuthContext.Provider
      value={{
        user,
        revalidateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
