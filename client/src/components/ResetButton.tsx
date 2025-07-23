import RestartIcon from '../assets/restart.svg?react';
import { useLocalStorageContext } from '../contexts/LocalStorageContext';
import Button from './Button';

const ResetButton = () => {
    const {resetLocalStorage} = useLocalStorageContext();

    return (
        <Button
            onClick={resetLocalStorage}
            style="outlined"
            additionalClasses="px-2 py-1 !gap-2"
        >
            <RestartIcon className="w-5 h-5 fill-primary"/>
            <span className="hidden md:block">Restart</span>
        </Button>
    );
};

export default ResetButton;
