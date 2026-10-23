import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import "./styles.css";
import { getRouter } from "./router";

const router = getRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>,
);