import * as amplitude from '@amplitude/analytics-browser';
import {useState} from 'react';
import Button from './components/Button';
import {handleReset} from './components/ResetButton';

const Survey = () => {
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);

    const questions = [
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
                {label: 'Yes', value: 'yes'},
                {label: 'No', value: 'no'},
            ],
            text: 'Did this save you time compared to how you normally handle meeting notes?',
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
            responseOptions: [
                {label: 'Yes', value: 'yes'},
                {label: 'No', value: 'no'},
            ],
            text: 'Would you trust this to replace your current meeting follow-up workflow?',
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
                        <div className='flex flex-col gap-6 items-center bg-gray-900 p-4 rounded-md border border-gray-800 w-full'>
                            <p className='text-lg'>{questions[currentQuestion].text}</p>
                            <div className="flex gap-4 w-full flex-wrap">
                                {questions[currentQuestion].responseOptions.map(
                                    (option, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => {
                                                amplitude.track('survey_response', {
                                                    question: questions[currentQuestion].text,
                                                    response: option.value,
                                                });
                                                setCurrentQuestion(currentQuestion + 1);
                                            }}
                                            additionalClasses='grow'
                                        >
                                            {option.label}
                                        </Button>
                                    ),
                                )}
                            </div>
                        </div>
                        <Button onClick={handleReset} additionalClasses='w-full' style='outlined'>Return to Home Page</Button>
                    </div>
                ) : (
                    <div className='flex flex-col items-center gap-8'>
                        <h2 className='text-2xl font-bold'>Thank you for your feedback!</h2>
                        <Button onClick={handleReset} additionalClasses='w-full'>Return to Home Page</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Survey;
