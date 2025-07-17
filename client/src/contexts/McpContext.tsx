import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {ClipLoader} from 'react-spinners';
import {type Tool, useMcp, type UseMcpResult} from 'use-mcp/react';
import Button from '../components/Button';


interface McpContextType {
    callTool?: UseMcpResult['callTool'];
    state?: UseMcpResult['state'];
    tools?: Tool[];
}

const McpContext = createContext<McpContextType>({});

export const McpProvider = ({children}: { children: ReactNode }) => {
    const {authenticate, authUrl, callTool, error, retry, state, tools} = useMcp({
        autoReconnect: true,
        callbackUrl: import.meta.env.VITE_CALLBACK_URL,
        clientName: 'SnapLinear',
        debug: false,
        preventAutoAuth: true,
        url: 'https://mcp.linear.app/sse',
    });

    const includedTools = [
        'list_comments',
        'create_comment',
        'get_issue',
        'list_issues',
        'create_issue',
        'update_issue',
        'get_issue_status',
        'list_my_issues',
        'search_documentation',
    ];

    const filteredTools = tools?.filter((tool) => {
        return includedTools.includes(tool.name);
    });

    const [showErrorUI, setShowErrorUI] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (state === 'failed') {
            timer = setTimeout(() => setShowErrorUI(true), 1000);
        } else {
            setShowErrorUI(false);
        }
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [state]);

    return (
        <McpContext.Provider value={{callTool, state, tools: filteredTools}}>
            {showErrorUI && (
                <div className="flex flex-col items-center justify-center text-center h-full w-full gap-8">
                    <div className="flex flex-col items-center gap-1">
                        <p>Connection failed:</p>
                        <p className="text-red-500">{error}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={retry}>Retry</Button>
                        <Button onClick={authenticate}>Authenticate Manually</Button>
                    </div>
                </div>
            )}
            {!showErrorUI && state !== 'ready' && state !== 'pending_auth' && (
                <div className="flex h-full w-full items-center justify-center">
                    <ClipLoader size={56} color="white"/>
                </div>
            )}
            {state === 'pending_auth' && (
                <div className="flex h-full w-full items-center justify-center">
                    <Button onClick={() => {window.open(authUrl, '_blank');}}>
                            Log in with Linear
                    </Button>
                </div>
            )}
            {state === 'ready' && children}
        </McpContext.Provider>
    );
};

export const useMcpContext = () => useContext(McpContext);
