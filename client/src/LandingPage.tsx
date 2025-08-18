import {integrations, useIntegrationContext, type Integration} from './contexts/IntegrationContext';

const LandingPage = () => {
    return (
        <>
            <div className="w-full h-full flex flex-col justify-start items-center overflow-auto">
                <div
                    className="w-full flex flex-col justify-center items-center px-4 bg-gray-900 text-center md:text-left">
                    <div className="max-w-content-max-width w-full flex flex-col gap-12 py-[72px]">
                        {/* Hero Section */}
                        <div className="flex flex-col gap-4">
                            <h1 className='font-bold text-4xl'>
                                Convert Meetings to Actions With AI
                            </h1>
                            <h2 className="text-xl text-gray-300">
                                Automatically extract action items from meetings and send them
                                to your project management tool — no manual note-taking required.
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="w-full h-full p-4 flex justify-center">
                    <div className="max-w-content-max-width w-full h-full flex flex-col items-center gap-12 bg-gray-950 py-12">
                        <div className="w-full flex flex-col items-center gap-3 bg-gray-850 p-4 rounded-md">
                            <p className='text-gray-300'>Select an integration to get started</p>
                            {integrations.map((integration) => <IntegrationOption key={integration.name} integration={integration} />)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const IntegrationOption = ({integration}: { integration: Integration; }) => {
    const {setIntegration} = useIntegrationContext();

    return (
        <div className="w-full flex items-center justify-center gap-3 bg-gray-800 p-4 rounded-md cursor-pointer hover:bg-gray-700" onClick={() => setIntegration(integration)}>
            {integration.icon}
            <h3 className="font-semibold">{integration.name}</h3>
        </div>
    );
};

export default LandingPage;
