import { Outlet } from "react-router-dom";
import Header from "../Header/Header.jsx";
import "../../styles/global.css";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: "16px 0 40px" }}>
        <Outlet />
      </main>
    </>
  );
}
