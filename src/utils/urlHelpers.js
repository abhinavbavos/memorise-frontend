// Utility to resolve image URLs, handling proxy bypassing for development
export const resolveImageUrl = (url) => {
    if (!url) return null;

    // console.log("Resolving URL:", url);
    const API_DOMAIN = "https://api.memorisehub.com";
    const IS_DEV = import.meta.env.DEV;
    
    // 1. If it has the API domain
    if (url.startsWith(API_DOMAIN)) {
        // DEV: Strip domain to use Vite proxy (avoids CORP/CORS issues locally)
        if (IS_DEV) {
            return url.replace(API_DOMAIN, "");
        }
        // PROD: Keep full URL (Cross-origin request to api.memorisehub.com)
        return url;
    }

    // 2. If it's an external URL (not our API) or a local data/blob URL, return as is
    if (url.startsWith("http") || url.startsWith("https") || url.startsWith("data:") || url.startsWith("blob:")) {
        return url;
    }

    // 3. If it's a relative path that already acts as a proxy route (starts with /api or /storage)
    if (url.startsWith("/api") || url.startsWith("/storage")) {
        // DEV: Return as is (Vite proxies it)
        if (IS_DEV) return url;
        // PROD: Prepend domain (unless served from same origin, but safe to be explicit)
        return `${API_DOMAIN}${url}`;
    }

    // 4. Otherwise, assume it's a relative file path (e.g. from VPS)
    // DEV: /api/... (proxy)
    // PROD: https://api.../api/...
    const cleanPath = url.replace(/^\//, "");
    if (IS_DEV) {
        return `/api/${cleanPath}`;
    } else {
        return `${API_DOMAIN}/api/${cleanPath}`;
    }
};
