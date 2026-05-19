import { getSession } from "@/lib/auth-server";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const session = await getSession();
  return <NavbarClient session={session} />;
}
