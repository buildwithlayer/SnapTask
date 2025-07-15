import Logo from './assets/snaplinear.svg?react';
import FileUpload from './FileUpload';

const DemoPage = () => {
    return (
        <>
            <div className="w-full h-full flex flex-col justify-start items-center overflow-auto">
                <div
                    className="w-full h-full flex flex-col justify-center items-center px-4 text-center md:text-left">
                    <div className="max-w-content-max-width w-full flex flex-col items-center gap-12 py-[72px]">
                        <div className="flex items-center gap-4">
                            <Logo className="w-8 h-8 fill-white"/>
                            <h1 className='font-bold text-4xl'>SnapLinear</h1>
                        </div>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <h1 className='font-bold text-5xl/tight md:text-7xl/tight max-w-[800px]'>
                                Convert Meetings to Tasks in Linear
                            </h1>
                            <h2 className="text-2xl text-gray-300">
                                Automatically extract action items from meeting audio with AI.
                            </h2>
                        </div>
                        <FileUpload demo={true} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default DemoPage;