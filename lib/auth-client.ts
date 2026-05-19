import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

export type UserRole = "buyer" | "seller" | "services";
