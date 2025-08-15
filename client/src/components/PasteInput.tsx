import {useState} from 'react';
import toast from 'react-hot-toast';
import TextAreaAutosize from 'react-textarea-autosize';
import ClipboardIcon from '../assets/clipboard.svg?react';
import Button from './Button';

const PasteInput = ({handleSubmit}: {handleSubmit: (text: string) => void}) => {
    const [focused, setFocused] = useState(false);
    const [text, setText] = useState('');

    function handlePaste() {
        navigator.clipboard.readText().then((text) => {
            setText(text);
        }).catch((err) => {
            console.error('Failed to read clipboard contents: ', err);
            toast.error('Failed to read clipboard contents');
        });
    }

    return (
        <div className={`flex items-center gap-4 w-full rounded-md border pl-4 ${focused ? 'border-primary' : 'border-gray-700'} ${text ? 'flex-col p-4' : 'flex-row p-2'}`}>
            <TextAreaAutosize
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste transcript here..."
                className="w-full outline-none max-h-[400px] resize-none"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {text ? 
                <Button additionalClasses='w-full' onClick={() => handleSubmit(text)}>Generate Tasks</Button> 
                : navigator.clipboard &&
                    <Button onClick={handlePaste} additionalClasses='!text-gray-900 !bg-white hover:!bg-gray-200 !gap-2'>
                        <ClipboardIcon className="w-6 h-6 fill-gray-900"/>
                        Paste
                    </Button>
            }
        </div>
    );
};

export default PasteInput;