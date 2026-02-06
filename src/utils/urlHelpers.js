// Utility to resolve image URLs, handling proxy bypassing for development
export const resolveImageUrl = (url) => {
    if (!url) return null;

    const API_DOMAIN = "https://api.memorisehub.com";
    
    // DEV FIX: Replace absolute API domain with relative path to use Vite proxy
    if (url.startsWith(API_DOMAIN)) {
        return url.replace(API_DOMAIN, "");
    }

    // If it's an external URL (not our API), return as is
    if (url.startsWith("http") || url.startsWith("https")) return url;

    // If it's a relative path that already acts as a proxy route (starts with /api or /storage)
    if (url.startsWith("/api") || url.startsWith("/storage")) return url;

    // Otherwise, assume it's a relative file path (e.g. from VPS) and prepend proxy base
    return `/api/${url.replace(/^\//, "")}`;
};
