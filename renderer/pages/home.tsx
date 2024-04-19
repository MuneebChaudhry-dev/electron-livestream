import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
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
    </React.Fragment>
  );
}
