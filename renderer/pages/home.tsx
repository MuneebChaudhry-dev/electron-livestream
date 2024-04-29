import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import UploadVideo from '../components/UploadVideo';

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-tailwindcss)</title>
      </Head>
      <div className='grid grid-col-1 text-2xl w-full text-center'>
        <UploadVideo />
      </div>
      <div className='mt-1 w-full flex-wrap flex justify-center'>
        <Link href='/webcam'>Go Live</Link>
      </div>
    </React.Fragment>
  );
}
