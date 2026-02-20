"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginSchema, ErrorResponseSchema } from "@/src/schemas";

type ActionStateType = {
  errors: string[];
};

export async function authenticate(
  prevState: ActionStateType,
  formData: FormData,
) {
  const loginCredentials = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const auth = LoginSchema.safeParse(loginCredentials);
  if (!auth.success) {
    return {
      errors: auth.error.issues.map((issue) => issue.message),
    };
  }

  const url = `${process.env.API_URL}/auth/login`;
  const req = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: auth.data.email,
      password: auth.data.password,
    }),
  });

  const json = await req.json();
  if (!req.ok) {
    const { error } = ErrorResponseSchema.parse(json);
    return {
      errors: [error],
    };
  }

  //Setear Cookies
  cookies().set({
    name: "CASHTRACKR_TOKEN",
    value: json,
    httpOnly: true,
    path: "/",
  });

  redirect("/admin");
}
