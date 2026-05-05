"use client";

import { useSession } from "next-auth/react";

export default function ListaFacturas() {
  const { data: session } = useSession();  
  return (
    <>      
      <div> {session?.user?.email}</div>
    </>
  );
}
