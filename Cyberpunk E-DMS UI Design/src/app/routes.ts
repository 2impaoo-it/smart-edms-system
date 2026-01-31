import { createBrowserRouter } from "react-router";
import { MainLayout } from "@/app/components/MainLayout";
import { Dashboard } from "@/app/pages/Dashboard";
import { SignDocument } from "@/app/pages/SignDocument";
import { NotFound } from "@/app/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "sign/:id", Component: SignDocument },
      { path: "*", Component: NotFound },
    ],
  },
]);
