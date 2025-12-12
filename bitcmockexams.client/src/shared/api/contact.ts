import { useApiService } from '@shared/api/api';
import environment from '@shared/config/environment';

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

export const useContactApi = () => {
    const api = useApiService();

    const submitContactForm = async (data: ContactUsVM): Promise<ContactUsResponse> => {
        const endpoint = `${environment.identityUrl}/UserProfile/ContactUs`;
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

    return { submitContactForm };
};
