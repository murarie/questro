"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase/client";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase client
      await signOut(auth);
      
      // Call server action to clear session cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Redirect to sign-in page
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      className="btn-secondary text-sm"
    >
      🚪 Logout
    </Button>
  );
};

export default LogoutButton;
