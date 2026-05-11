/**
 * Custom fetch with timeout and retry to handle network issues
 */
export const customFetch = async (
  input: RequestInfo | URL, 
  init?: RequestInit, 
  retries = 3
): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const timeout = 30000; // 30 seconds
  
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      if (i > 0) console.log(`[Fetch] Retrying (${i}/${retries-1}): ${url}`);
      else console.log(`[Fetch] Requesting: ${url}`);
      
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      
      clearTimeout(id);
      console.log(`[Fetch] Response from ${url}: ${response.status} ${response.statusText}`);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      const isTimeout = 
        error.name === 'AbortError' || 
        error.message?.includes('timeout') || 
        error.message?.includes('ETIMEDOUT');
      
      if (isTimeout && i < retries - 1) {
        console.warn(`[Fetch] Timeout/Retryable error for ${url}, retrying...`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      if (error.name === 'AbortError') {
        console.error(`[Fetch] Timeout: ${url} exceeded ${timeout}ms after ${retries} attempts`);
        throw new Error(`Fetch timeout for ${url}`);
      }
      
      console.error(`[Fetch] Error for ${url}:`, error);
      throw error;
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
};
