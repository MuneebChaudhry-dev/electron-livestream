import React, { useState } from 'react';

const UploadVideo = () => {
  const [videoSrc, setVideoSrc] = useState(null);

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
            <video controls className='max-w-full'>
              <source src={videoSrc} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p className='text-white'>No video selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
