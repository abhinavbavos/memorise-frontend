// Utility to resolve image URLs, handling proxy bypassing for development
export const resolveImageUrl = (url) => {
    if (!url) return null;

    // console.log("Resolving URL:", url);
    const API_DOMAIN = "https://api.memorisehub.com";
    
    let resolvedUrl = url;

    // DEV FIX: Replace absolute API domain with relative path to use Vite proxy
    if (url.startsWith(API_DOMAIN)) {
        resolvedUrl = url.replace(API_DOMAIN, "");
    }

    // If it's an external URL (not our API), return as is
    else if (url.startsWith("http") || url.startsWith("https")) {
        // console.log("External URL:", url);
        return url;
    }

    // If it's a relative path that already acts as a proxy route (starts with /api or /storage)
    else if (url.startsWith("/api") || url.startsWith("/storage")) {
        // resolvedUrl is already correct
    } else {
        // Otherwise, assume it's a relative file path (e.g. from VPS) and prepend proxy base
        resolvedUrl = `/api/${url.replace(/^\//, "")}`;
    }

    // console.log("Resolved result:", resolvedUrl);
    return resolvedUrl;
};
