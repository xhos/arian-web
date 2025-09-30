import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once on failure
  });
}

export function useUserId() {
  const { data: session } = useSession();
  return session?.data?.user?.id;
}
