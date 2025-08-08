import FileUpload from './FileUpload';

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
                                Turn any meeting into ready-to-ship Linear issues
                            </h1>
                            <h2 className='text-xl text-gray-300'>
                                Upload audio • paste or upload a transcript • or record on the spot
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="w-full h-full flex flex-col items-center justify-center gap-12 bg-gray-950">
                    <div className="w-full h-full flex flex-col justify-center items-center px-4">
                        <div
                            className="max-w-content-max-width w-full h-full flex flex-col items-center gap-16 text-center py-[56px]">
                            <FileUpload />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandingPage;
