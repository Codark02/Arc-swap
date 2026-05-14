import { ReactNode } from "react";
import { Page } from "../App";
import Header from "./Header";
import ToastContainer from "./ToastContainer";

interface LayoutProps {
  children: ReactNode;
  page: Page;
  setPage: (p: Page) => void;
}

export default function Layout({ children, page, setPage }: LayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
      }}
    >
      <a
        href="#main-content"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = "16px";
          e.currentTarget.style.top = "16px";
          e.currentTarget.style.width = "auto";
          e.currentTarget.style.height = "auto";
          e.currentTarget.style.zIndex = "9999";
          e.currentTarget.style.padding = "8px 16px";
          e.currentTarget.style.background = "var(--cyan)";
          e.currentTarget.style.color = "#07070d";
          e.currentTarget.style.borderRadius = "8px";
          e.currentTarget.style.fontWeight = "700";
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = "-9999px";
          e.currentTarget.style.width = "1px";
          e.currentTarget.style.height = "1px";
        }}
      >
        Skip to main content
      </a>

      <Header page={page} setPage={setPage} />

      <main
        id="main-content"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "40px 16px 80px",
        }}
      >
        {children}
      </main>

      <ToastContainer />
    </div>
  );
}