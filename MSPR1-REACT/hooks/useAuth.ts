import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
    }
  }, []);
};
