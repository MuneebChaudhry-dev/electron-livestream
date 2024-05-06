import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { HiOutlineCamera } from 'react-icons/hi';

function LiveStreamComponent() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const webcam = webcamRef.current.video;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    webcam.width = canvas.width = webcam.videoWidth;
    webcam.height = canvas.height = webcam.videoHeight;

    (async function drawFrame() {
      requestAnimationFrame(drawFrame);
      context.drawImage(webcam, 0, 0, canvas.width, canvas.height);
    })();
  }, []);

  const handleShareStream = async () => {
    // Implement YouTube live stream sharing logic here
    console.log('Share stream on YouTube');
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='w-full max-w-md'>
        <Webcam
          audio={false}
          ref={webcamRef}
          className='w-full h-96 rounded-lg border-2 border-gray-300'
        />
        <canvas ref={canvasRef} className='hidden' />
        <div className='flex items-center justify-center mt-4'>
          <button
            className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
            onClick={handleShareStream}
          >
            <HiOutlineCamera className='mr-2' />
            Share Stream on YouTube
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiveStreamComponent;
