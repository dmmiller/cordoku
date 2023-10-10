"use client";
import { CordProvider } from "@cord-sdk/react";
import "./cord.css";

type Props = {
  clientAuthToken: string;
};
const CordIntegration = ({
  clientAuthToken,
  children,
}: React.PropsWithChildren<Props>) => {
  return (
    <CordProvider clientAuthToken={clientAuthToken}>{children}</CordProvider>
  );
};

export default CordIntegration;
