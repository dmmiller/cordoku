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
    <CordProvider
      clientAuthToken={clientAuthToken}
      translations={{
        en: {
          thread: {
            placeholder_title: "Welcome to the Thunderdoku",
            placeholder_body: "Talk Smack. Win big. Brag to your friends.",
          },
        },
      }}
    >
      {children}
    </CordProvider>
  );
};

export default CordIntegration;
