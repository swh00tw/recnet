"use client";

import React, { useEffect, useCallback } from "react";
import { getAuth, onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { getFirebaseApp } from "@recnet/recnet-web/firebase/client";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "./_trpc/client";
import { User } from "@recnet/recnet-api-model";
import { setRecnetCustomClaims } from "../server/user";
import { TRPCClientError } from "@trpc/client";

export interface AuthProviderProps {
  serverUser: User | null;
  children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  serverUser,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const utils = trpc.useUtils();
  const { data, isPending, isError } = trpc.getMe.useQuery(undefined, {
    initialData: serverUser
      ? {
          user: serverUser,
        }
      : undefined,
  });
  const user = data?.user ?? null;

  const loginMutation = trpc.login.useMutation();

  const revalidateUser = useCallback(async () => {
    await utils.getMe.invalidate();
  }, [utils.getMe]);

  const handleIdTokenChanged = useCallback(
    async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();

        // Sets authenticated user cookies
        try {
          await fetch("/api/login", {
            headers: {
              Authorization: `Bearer ${idTokenResult.token}`,
            },
          });
        } catch (e) {
          console.log(e);
        }
        try {
          // login user at api server and set custom claims
          const data = await loginMutation.mutateAsync(undefined, {
            onError: (error) => {
              if (
                error instanceof TRPCClientError &&
                error.data.code === "NOT_FOUND" &&
                error.message === "User not found"
              ) {
                // create user and redirect
                router.replace("/onboard");
              }
            },
          });
          await setRecnetCustomClaims(data.user.role, data.user.id);
          await revalidateUser();
          if (pathname === "/") {
            router.replace("/feeds");
          }
        } catch (error) {
          console.log(error);
        }
        return;
      }

      // Removes authenticated user cookies
      await fetch("/api/logout");
      await revalidateUser();
    },
    [pathname, router, loginMutation, revalidateUser]
  );

  useEffect(() => {
    return onIdTokenChanged(getAuth(getFirebaseApp()), handleIdTokenChanged);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        revalidateUser,
        isPending,
        isError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
