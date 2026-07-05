import { supabase } from "./supabase";

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  fullName?: string;
}) {
  return supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
      },
    },
  });
}

export async function signInWithEmail(params: {
  email: string;
  password: string;
}) {
  return supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
