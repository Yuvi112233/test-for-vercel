import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  // Add Content-Type for requests with data
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add Authorization header if token exists
  const token = localStorage.getItem('smartq_token');
  console.log('apiRequest - Token from localStorage:', token);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('apiRequest - Authorization header set:', headers["Authorization"]);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle token update response
  if (res.status === 401) {
    try {
      const errorData = await res.json();
      if (errorData.newToken) {
        // Update token in localStorage
        localStorage.setItem('smartq_token', errorData.newToken);
        console.log('Token updated from server response');
        
        // Retry the request with new token
        return apiRequest(method, url, data);
      }
    } catch (e) {
      // If parsing fails, continue with normal error handling
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token exists
    const token = localStorage.getItem('smartq_token');
    console.log('getQueryFn - Token from localStorage:', token);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log('getQueryFn - Authorization header set:', headers["Authorization"]);
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
