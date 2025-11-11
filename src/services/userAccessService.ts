const userAccessCache = new Map();
const CACHE_TTL = 60000; // 1 minute

const baseUrl = process.env.IDENTITY_URL;
const retries = 5;

async function fetchWithRetries(url: string, options: any) {
    let attempts = 0;
    while (attempts < retries) {
        try {
            const response = await fetch(url, options);
            if (response.status === 200) return response;
            attempts++;
        } catch (error) {
            console.error('Retry error:', error);
            attempts++;
        }
    }
    return {
        status: 400,
        json: async () => ({ error: 'failed_retries' })
    } as Response;
}

export async function getUserAccessCached(sessionToken: string, storeId: string, userEmail: string) {
    const cacheKey = `${userEmail}_${storeId}`;
    const cached = userAccessCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log('Returning cached user access data');
        return cached.data;
    }

    console.log('Fetching fresh user access data');

    const url = `${baseUrl}user_access/${storeId}?service=store`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionToken}`,
        },
    };

    const response = await fetchWithRetries(url, options);

    if (response.status !== 200) {
        return {
            data: {
                has_access: false
            }
        };
    }

    const responseData = await response.json();

    userAccessCache.set(cacheKey, {
        timestamp: Date.now(),
        data: responseData
    });

    return responseData;
}

// Cleanup function to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    userAccessCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_TTL) {
            userAccessCache.delete(key);
        }
    });
}, CACHE_TTL);

export { userAccessCache };