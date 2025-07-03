import {createContext, type ReactNode, useContext, useEffect} from 'react';
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
    const {authenticate, callTool, error, retry, state, tools} = useMcp({
        autoReconnect: true,
        callbackUrl: import.meta.env.VITE_CALLBACK_URL,
        clientName: 'SnapLinear',
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

    // Track User Email for Amplitude
    useEffect(() => {
        if (state === 'ready' && callTool) {
            const getCurrentUser = async () => {
                try {
                    const myIssuesResponse = await callTool('list_my_issues', { limit: 1 });
                    
                    if (!myIssuesResponse || myIssuesResponse.isError) {
                        console.warn('⚠️ Could not fetch user issues');
                        return;
                    }
                    
                    const issues = JSON.parse(myIssuesResponse.content[0].text);
                    
                    if (issues.length === 0) {
                        console.warn('⚠️ No issues assigned to user');
                        return;
                    }
                    
                    const userId = issues[0].assigneeId;
                    
                    if (!userId) {
                        console.warn('⚠️ No assigneeId found in issues');
                        return;
                    }

                    const userResponse = await callTool('get_user', { query: userId });
                    
                    if (!userResponse || userResponse.isError) {
                        console.warn('⚠️ Could not fetch user details');
                        return;
                    }
                    
                    const user = JSON.parse(userResponse.content[0].text);
                    
                    if ((window as any).amplitude && user.email) {
                        console.log('📊 Setting up Amplitude with user:', user.email);
                        
                        (window as any).amplitude.setUserId(user.email);
                        
                        const identify = new (window as any).amplitude.Identify();
                        identify.set('email', user.email);
                        identify.set('name', user.name);
                        identify.set('displayName', user.displayName);
                        identify.set('isAdmin', user.isAdmin);
                        identify.set('linear_user_id', user.id);
                        
                        (window as any).amplitude.identify(identify);
                        
                        // Track successful Linear connection
                        (window as any).amplitude.track('Linear Connected', {
                            user_email: user.email,
                            user_name: user.name,
                            user_id: user.id
                        });
                    } else {
                        console.warn('⚠️ window.amplitude not available or user has no email');
                    }
                    
                } catch (error) {
                    console.error('❌ Error getting current user:', error);
                }
            };
            
            getCurrentUser();
        }
    }, [state, callTool]);

    return (
        <McpContext.Provider value={{callTool, state, tools: filteredTools}}>
            {state === 'failed' && (
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
            {state !== 'failed' && state !== 'ready' && (
                <div className="flex h-full w-full items-center justify-center">
                    <ClipLoader size={56} color="white"/>
                </div>
            )}
            {state === 'ready' && children}
        </McpContext.Provider>
    );
};

export const useMcpContext = () => useContext(McpContext);
