import apiClient, { extractData } from './apiClient';

/**
 * Profile Access Service (QR Code functionality)
 * Implements endpoints from API documentation:
 * Base Path: /profile-access
 */

// Generate QR code for user (Agent/Admin)
export async function generateQRCode(userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const response = await apiClient.get(`/profile-access/qr/${userId}`);
        return extractData(response);
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

// Get user info by QR token (Public)
export async function getUserByQRToken(token) {
    try {
        if (!token) {
            throw new Error('QR token is required');
        }

        const response = await apiClient.get(`/profile-access/scan/${token}`);
        return extractData(response);
    } catch (error) {
        console.error('Error getting user by QR token:', error);
        throw error;
    }
}

// Update user via QR scan (Agent/Admin)
export async function updateUserViaQR(token, userData) {
    try {
        if (!token) {
            throw new Error('QR token is required');
        }

        if (!userData || typeof userData !== 'object') {
            throw new Error('Valid user data is required');
        }

        const response = await apiClient.put(`/profile-access/scan/${token}`, userData);
        return extractData(response);
    } catch (error) {
        console.error('Error updating user via QR:', error);
        throw error;
    }
}

// Import users from Excel (Admin)
export async function importUsersFromExcel(file) {
    try {
        if (!file) {
            throw new Error('Excel file is required');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/profile-access/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return extractData(response);
    } catch (error) {
        console.error('Error importing users from Excel:', error);
        throw error;
    }
}

export default {
    generateQRCode,
    getUserByQRToken,
    updateUserViaQR,
    importUsersFromExcel,
};