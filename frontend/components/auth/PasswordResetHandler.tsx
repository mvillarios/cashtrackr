"use client";
import { useState } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import ValidateTokenForm from "./ValidateTokenForm";

export default function PasswordResetHandler() {
  const [isValidToken, setIsValidToken] = useState(false);
  const [token, setToken] = useState("");

  return (
    <>
      {!isValidToken ? (
        <ValidateTokenForm
          setIsValidToken={setIsValidToken}
          token={token}
          setToken={setToken}
        />
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </>
  );
}
