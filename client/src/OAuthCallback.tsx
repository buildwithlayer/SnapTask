import {useEffect} from 'react';
import toast from 'react-hot-toast';
import {useIntegrationContext} from './contexts/IntegrationContext';

export function OAuthLinearCallback() {
    const {setAuthToken} = useIntegrationContext();

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
            toast.error('Authorization code not found');
            return;
        }
        try {
            fetch(`${import.meta.env.VITE_API_URL}/api/auth/linear`, {
                body: new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                method: 'POST',
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to exchange authorization code for access token');
                }
                return response.json();
            }).then(data => {
                setAuthToken(data.access_token);
                window.location.href = '/';
            });
        } catch (error) {
            toast.error('Error during OAuth callback: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }, []);

    return (
        <div className="w-full h-full flex justify-center items-center px-4 bg-gray-900 text-white">
            <div className="w-full h-full max-w-content-max-width flex flex-col items-center justify-center gap-2">
                <h1>Authenticating...</h1>
                <p>This window should close automatically.</p>
            </div>
        </div>
    );
}

export function OAuthAsanaCallback() {
    const {setAuthToken} = useIntegrationContext();

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
            toast.error('Authorization code not found');
            return;
        }
        try {
            fetch(`${import.meta.env.VITE_API_URL}/api/auth/asana`, {
                body: new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                method: 'POST',
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to exchange authorization code for access token');
                }
                return response.json();
            }).then(data => {
                setAuthToken(`Bearer ${data.access_token}`);
                window.location.href = '/';
            });
        } catch (error) {
            toast.error('Error during OAuth callback: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }, []);

    return (
        <div className="w-full h-full flex justify-center items-center px-4 bg-gray-900 text-white">
            <div className="w-full h-full max-w-content-max-width flex flex-col items-center justify-center gap-2">
                <h1>Authenticating...</h1>
                <p>This window should close automatically.</p>
            </div>
        </div>
    );
}

export function OAuthJiraCallback() {
    const {setAuthToken} = useIntegrationContext();

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
            toast.error('Authorization code not found');
            return;
        }
        try {
            fetch(`${import.meta.env.VITE_API_URL}/api/auth/jira`, {
                body: new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                method: 'POST',
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to exchange authorization code for access token');
                }
                return response.json();
            }).then(data => {
                setAuthToken(`Bearer ${data.access_token}`);
                window.location.href = '/';
            });
        } catch (error) {
            toast.error('Error during OAuth callback: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }, []);

    return (
        <div className="w-full h-full flex justify-center items-center px-4 bg-gray-900 text-white">
            <div className="w-full h-full max-w-content-max-width flex flex-col items-center justify-center gap-2">
                <h1>Authenticating...</h1>
                <p>This window should close automatically.</p>
            </div>
        </div>
    );
}