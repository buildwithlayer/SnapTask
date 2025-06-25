import {useEffect} from 'react';
import {onMcpAuthorization} from 'use-mcp';

function OAuthCallback() {
    useEffect(() => {
        onMcpAuthorization().catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h1>Authenticating...</h1>
            <p>This window should close automatically.</p>
        </div>
    );
}

export default OAuthCallback;