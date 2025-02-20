import { queryClient } from "./queryClient";

export function clearAuthCache() {
  // Clear all queries when auth state changes
  queryClient.clear();
}
