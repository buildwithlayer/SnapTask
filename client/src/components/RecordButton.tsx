import {useEffect, useState} from 'react';
import type {FileWithPath} from 'react-dropzone';
import toast from 'react-hot-toast';
import MicrophoneIcon from '../assets/microphone.svg?react';
import StopRecordingIcon from '../assets/stop-recording.svg?react';
import Button from './Button';

interface RecordButtonProps {
    handleRecordingComplete: (file: FileWithPath) => void;
    isRecording: boolean;
    setIsRecording: (isRecording: boolean) => void;
}

const RecordButton = ({handleRecordingComplete, isRecording, setIsRecording}: RecordButtonProps) => {
    const browserSupportsRecording = Boolean(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
    );

    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null,
    );

    async function handleRecord() {
        if (!browserSupportsRecording) {
            toast.error('Your browser does not support audio recording.');
            return;
        }

        let audioStream;
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
        } catch (error) {
            toast.error('Failed to access microphone. Please check your permissions and try again.');
            return;
        }

        const mediaRecorder = new MediaRecorder(audioStream);

        mediaRecorder.ondataavailable = (event) => {
            const audioBlob = new Blob([event.data], {
                type: 'audio/weba',
            });
            const audioFile = new File([audioBlob], 'recorded-audio.weba', {
                type: 'audio/weba',
            });
            handleRecordingComplete(audioFile);
            toast.success('Audio recorded successfully!');
        };

        setMediaRecorder(mediaRecorder);
        setIsRecording(true);
        mediaRecorder.start();
    }

    async function handleStopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    }

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isRecording) {
            timer = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [isRecording]);
    return (
        <>{browserSupportsRecording && (
            <Button
                additionalClasses="!gap-1.5 !py-3 w-full"
                onClick={isRecording ? handleStopRecording : handleRecord}
            >
                {isRecording ? (
                    <>
                        <StopRecordingIcon fill="white"/>
                        <span>Recording</span>
                        <span className="ml-2 text-gray-200">
                            {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:
                            {String(elapsedTime % 60).padStart(2, '0')}
                        </span>
                    </>
                ) : (
                    <>
                        <MicrophoneIcon fill="white"/>
                        <span>Record Audio</span>
                    </>
                )}
            </Button>
        )}</>
    );
};

export default RecordButton;