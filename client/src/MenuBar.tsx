import Logo from './assets/snaplinear.svg?react';

function MenuBar() {
    return (
        <div
            className="flex w-full items-center justify-center px-4 py-6 bg-gray-1000 text-white border-b border-gray-900">
            <div className="max-w-content-max-width w-full flex items-center justify-between">
                <div className="flex items-center gap-3 py-1">
                    <Logo className="w-8 h-8 fill-white"/>
                    <div className="font-bold text-xl">SnapLinear</div>
                </div>
                <a href="mailto:support@buildwithlayer.com" className='py-1 hover:border-b-2 border-gray-300'>
                    Contact Support
                </a>
            </div>
        </div>
    );
}

export default MenuBar;
