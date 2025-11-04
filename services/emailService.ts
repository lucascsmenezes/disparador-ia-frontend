import type { Company } from '../types';

interface EmailDetails {
    resumeFileName?: string;
    resumeObjective?: string;
    companies?: Company[];
    error?: string;
}

/**
 * This service sends an email notification by making an API call to a real backend endpoint.
 * The backend is responsible for handling the actual email dispatch.
 */
export const sendEmailNotification = async (
  status: 'success' | 'error',
  userEmail: string,
  details: EmailDetails
): Promise<void> => {
  const endpoint = `/api/send-email`;

  const payload = {
    status,
    userEmail,
    details,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // The server responded with an error status (e.g., 4xx, 5xx)
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
      console.error('Backend error sending email:', response.status, errorData);
      throw new Error(`Server responded with status: ${response.status}`);
    }

    console.log('Email notification request sent to backend successfully.');
    // The promise resolves successfully, indicating the request was sent.
    // The UI will handle this as a success.
    return;

  } catch (error) {
    console.error('Failed to send email notification request:', error);
    // The promise rejects, indicating a network or server error.
    // The UI's .catch() block will handle this.
    throw new Error('Could not connect to the email service.');
  }
};