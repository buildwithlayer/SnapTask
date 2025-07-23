import * as amplitude from '@amplitude/analytics-browser';
import {useState} from 'react';
import Button from './components/Button';
import {useLocalStorageContext} from './contexts/LocalStorageContext';

interface SurveyQuestion {
    responseElement?: React.ReactNode;
    responseOptions?: { label: string; value: string | number }[];
    text: string;
}

const Survey = () => {
    const {resetLocalStorage} = useLocalStorageContext();
    
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);

    const [freeTextResponse, setFreeTextResponse] = useState<string>('');

    function handleFreeTextResponse() {
        amplitude.track('survey_response', {
            question: 'What could we add or improve to make SnapLinear more useful for you?',
            response: freeTextResponse,
        });
        setCurrentQuestion((prev) => prev + 1);
        setFreeTextResponse('');
    }

    const questions: SurveyQuestion[] = [
        {
            responseOptions: [
                {label: '1', value: 1},
                {label: '2', value: 2},
                {label: '3', value: 3},
                {label: '4', value: 4},
                {label: '5', value: 5},
                {label: '6', value: 6},
                {label: '7', value: 7},
                {label: '8', value: 8},
                {label: '9', value: 9},
                {label: '10', value: 10},
            ],
            text: 'How likely is it that you would recommend SnapLinear to a friend or colleague?',
        },
        {
            responseOptions: [
                {label: 'Not Accurate', value: 'not_accurate'},
                {label: 'Somewhat Accurate', value: 'somewhat_accurate'},
                {label: 'Accurate', value: 'accurate'},
                {label: 'Very Accurate', value: 'very_accurate'},
            ],
            text: 'How accurate were the tasks we generated?',
        },
        {
            responseElement: (
                <div className='w-full flex flex-col gap-2'>
                    <textarea className='w-full p-2 border border-gray-700 rounded-md bg-white text-gray-900 min-h-[100px]' value={freeTextResponse} onChange={(e) => setFreeTextResponse(e.target.value)} />
                    <Button onClick={handleFreeTextResponse}>Submit Feedback</Button>
                </div>
            ),
            text: 'What could we add or improve to make SnapLinear more useful for you?',
        },
    ];

    return (
        <div className="flex w-full h-full items-center justify-center px-4 overflow-hidden">
            <div className="flex items-center justify-center w-full max-w-content-max-width overflow-y-auto">
                {questions[currentQuestion] ? (
                    <div className='flex flex-col items-center gap-8 w-full'>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-2xl font-bold">Help us improve SnapLinear</h1>
                            <p className="text-gray-300">
                        Your feedback is valuable to us. Please take a moment to fill out this
                        survey.
                            </p>
                        </div>
                        <SurveyQuestion
                            question={questions[currentQuestion]}
                            setCurrentQuestion={setCurrentQuestion}
                        />
                        <Button onClick={resetLocalStorage} additionalClasses='w-full' style='outlined'>Return to Home Page</Button>
                    </div>
                ) : (
                    <div className='flex flex-col items-center gap-8'>
                        <h2 className='text-2xl font-bold'>Thank you for your feedback!</h2>
                        <Button onClick={resetLocalStorage} additionalClasses='w-full'>Return to Home Page</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SurveyQuestion = ({question, setCurrentQuestion}: { question: SurveyQuestion, setCurrentQuestion: React.Dispatch<React.SetStateAction<number>> }) => {
    return (
        <div className='flex flex-col gap-6 items-center bg-gray-900 p-4 rounded-md border border-gray-800 w-full'>
            <p className='text-lg'>{question.text}</p>
            <div className="flex gap-4 w-full flex-wrap">
                {question.responseOptions?.map((option, index) => (
                    <Button
                        key={index}
                        onClick={() => {
                            amplitude.track('survey_response', {
                                question: question.text,
                                response: option.value,
                            });
                            setCurrentQuestion((prev) => prev + 1);
                        }}
                        additionalClasses='grow'
                    >
                        {option.label}
                    </Button>
                ))}
                {question.responseElement}
            </div>
        </div>
    );
};

export default Survey;
