const BASE_URL = '/api/node/admin'

export interface AdminInfo {
    user_id: number;
    email: string;
    name: string;
    role: "ADMIN";
}

export interface AdminLoginResponse {
    token: string;
    admin: AdminInfo;
}

export async function adminLogin( // Function to handle admin login API call
    email: string,
    password: string
): Promise<AdminLoginResponse> {
    console.log("adminApi.adminLogin called with:", { email });
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Indicate that we're sending JSON data
        },
        body: JSON.stringify({ email, password }), // Convert the data to a JSON string because HTTP only accepts strings or Buffers (not typeScript objects)
    })
    if (!response.ok) {
        throw new Error('Gagal login admin');
    }
    const data = await response.json();
    console.log("adminApi.adminLogin response:", data);
    return data;
}

// Function that fetches current admin info
// Used when: - verifying token validity
//            - fetching admin data for display in the admin panel
export async function fetchAdminMe(token: string): Promise<AdminInfo> { // Function to fetch current admin info
    const response = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        },
    });
    if (!response.ok) {
        throw new Error('Gagal mengambil info admin');
    }
    const data = await response.json();
    return data.admin as AdminInfo;
}