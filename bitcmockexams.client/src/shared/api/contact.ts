import { useApiService } from '@shared/api/api';
import environment from '@shared/config/environment';

const isDev = process.env.NODE_ENV === 'development';

export interface ContactUsVM {
    Name: string;
    EmailId: string;        // Changed from Email to EmailId
    PhoneNumber: string;
    HowDidYouFindUs: string; // Added separate field
    Query: string;
}

export interface ContactUsResponse {
    success: boolean;
    message?: string;
}

export interface CountryCode {
    code: string;
    name: string;
    pattern?: string;
}

export const useContactApi = () => {
    const api = useApiService();

    const getCountryCodes = async (): Promise<CountryCode[]> => {
        const base = isDev ? `${window.location.origin}/a2z-identity` : 'https://a2z-identity.azurewebsites.net';
        const endpoint = `${base}/api/UserProfile/GetCountryCodes`;
        try {
            const data = await api.get(endpoint, false);
            if (!data) return [];
            if (Array.isArray(data)) return data as CountryCode[];
            if (Array.isArray((data as any)?.data)) return (data as any).data as CountryCode[];
            return [];
        } catch (error) {
            console.error('Failed to fetch country codes:', error);
            // Return default country codes as fallback
            return [
                { code: '+91', name: 'India' },
                { code: '+1', name: 'United States' },
                { code: '+44', name: 'United Kingdom' }
            ];
        }
    };

    const submitContactForm = async (data: ContactUsVM): Promise<ContactUsResponse> => {
        const base = isDev ? `${window.location.origin}/a2z-identity` : 'https://a2z-identity.azurewebsites.net';
        const endpoint = `${base}/api/UserProfile/ContactUs`;
        try {
            const response = await api.post(endpoint, data, true);

            // If we reach here without an error, the API call was successful
            // The C# controller returns Ok() with no body, so response will be empty
            return {
                success: true,
                message: response?.message || 'Thank you for your message! We will get back to you soon.'
            };
        } catch (error) {
            console.error('Failed to submit contact form:', error);
            return {
                success: false,
                message: 'Failed to send message. Please try again later.'
            };
        }
    };

    return { submitContactForm, getCountryCodes };
};
