import React, { useState, useRef, useEffect } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';

const UploadVideo = () => {
  const [videoSrc, setVideoSrc] = useState(null);
  const [backgroundRemovedSrc, setBackgroundRemovedSrc] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoSrc) {
      const runBodyPix = async () => {
        const net = await bodyPix.load();
        const segmentation = await net.segmentPerson(videoRef.current);
        const backgroundRemovedData = bodyPix.toMask(segmentation, {
          r: 0,
          g: 255,
          b: 0,
          a: 255,
        });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(
          backgroundRemovedData.width,
          backgroundRemovedData.height
        );
        imageData.data.set(backgroundRemovedData.data);
        context.putImageData(imageData, 0, 0);
        const backgroundRemovedSrc = canvas.toDataURL('image/png');
        setBackgroundRemovedSrc(backgroundRemovedSrc);
      };
      runBodyPix();
    }
  }, [videoSrc]);

  const selectAndShowVideo = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setVideoSrc(videoURL);
    }
  };

  return (
    <div className='min-h-screen flex justify-center items-center bg-blue-900'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold  mb-6'>Upload a video</h1>
        <div className='border border-gray-400 p-4 inline-block'>
          <input
            type='file'
            accept='video/*'
            onChange={selectAndShowVideo}
            className='hidden'
            id='video-upload'
          />
          <label
            htmlFor='video-upload'
            className='cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Upload
          </label>
        </div>
        <div className='m-6'>
          {videoSrc ? (
            <div>
              <video ref={videoRef} controls className='max-w-full'>
                <source src={videoSrc} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
              {backgroundRemovedSrc && (
                <div>
                  <h2 className='text-white mt-4 mb-2'>Background Removed</h2>
                  <img
                    src={backgroundRemovedSrc}
                    alt='Background Removed'
                    className='max-w-full'
                  />
                </div>
              )}
            </div>
          ) : (
            <p className='text-white'>No video selected</p>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className='hidden'></canvas>
    </div>
  );
};

export default UploadVideo;
