import {useMcp} from 'use-mcp/react';

interface ChatProps {
    summary: string;
}

function Chat({summary}: ChatProps) {
    const {
        authenticate,
        error,
        retry,
        state,
        tools,
    } = useMcp({
        autoReconnect: true,
        callbackUrl: 'http://localhost:3000/oauth/callback',
        clientName: 'SnapLinear',
        url: 'https://mcp.linear.app/sse',
    });

    if (state === 'failed') {
        return (
            <div>
                <p>Connection failed: {error}</p>
                <button onClick={retry}>Retry</button>
                <button onClick={authenticate}>Authenticate Manually</button>
            </div>
        );
    }

    if (state !== 'ready') {
        return <div>Connecting...</div>;
    }

    return (
        <div>
            <h2>Available Tools: {tools.length}</h2>
            <ul>
                {tools.map(tool => (
                    <li key={tool.name}>{tool.name}</li>
                ))}
            </ul>
            <h2>Summary:</h2>
            <p>{summary}</p>
        </div>
    );
}

export default Chat;