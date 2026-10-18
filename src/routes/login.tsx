import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Saffron Table" },
      { name: "description", content: "Log in to view and manage your table reservations." },
      { property: "og:title", content: "Log in — Saffron Table" },
      { property: "og:description", content: "Log in to manage your reservations." },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
