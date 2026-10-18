import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Saffron Table" },
      { name: "description", content: "Create an account to reserve a table at Saffron Table." },
      { property: "og:title", content: "Register — Saffron Table" },
      { property: "og:description", content: "Create an account to reserve a table." },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
