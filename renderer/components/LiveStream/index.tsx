import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Webcam from 'react-webcam';
import { HiOutlineCamera } from 'react-icons/hi';

const LiveStreamComponent: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  let socket = io('ws://localhost:3100', { transports: ['websocket'] });
  const [stream, setStream] = useState<MediaStream>();

  const handleStartRecording = () => {
    if (!socket) {
      socket = io('ws://localhost:3100', { transports: ['websocket'] });
    }
    console.log(socket);
  };

  const recorderInit = () => {
    let liveStream = (videoRef.current as any).captureStream(30);

    let mediaRecorder = new MediaRecorder(liveStream!, {
      mimeType: 'video/webm;codecs=h264',
      videoBitsPerSecond: 3 * 1024 * 1024,
    });

    console.log(mediaRecorder, mediaRecorder.ondataavailable);
    mediaRecorder.ondataavailable = (e: any) => {
      console.log('sending chunks', e.data, socket);
      socket.send(e.data);
    };
    mediaRecorder.start(100);
  };

  const getStream = async () => {
    if (stream && videoRef.current) return;
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        height: { min: 720, max: 1280 },
        width: { min: 1080, max: 1920 },
        frameRate: { min: 15, ideal: 24, max: 30 },
        facingMode: 'user',
      },
    });
    setStream(mediaStream);
    if (videoRef.current) {
      console.log(videoRef.current);
      videoRef.current.srcObject = mediaStream;
    }
  };

  useEffect(() => {
    getStream();
  }, [videoRef]);

  useEffect(() => {
    const webcam = webcamRef.current?.video;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    canvas.width = webcam.videoWidth;
    canvas.height = webcam.videoHeight;

    (async function drawFrame() {
      requestAnimationFrame(drawFrame);
      context?.drawImage(webcam as any, 0, 0, canvas?.width, canvas?.height);
    })();
  }, []);

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='w-full max-w-md'>
        <Webcam
          audio={false}
          ref={webcamRef}
          className='w-full h-96 rounded-lg border-2 border-gray-300'
        />
        <canvas ref={canvasRef} className='hidden' />
        <video
          width={200}
          height={200}
          className='video-container'
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
        />
        <div className='flex items-center justify-center mt-4'>
          <button
            className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
            onClick={handleStartRecording}
          >
            <HiOutlineCamera className='mr-2' />
            Start Recording
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamComponent;
