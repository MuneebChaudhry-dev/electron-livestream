import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import LiveStreamComponent from '../components/LiveStream';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();
  const [tokens, setTokens] = useState(null);
  const [liveStreamInfo, setLiveStreamInfo] = useState(null);

  useEffect(() => {
    const { tokens: tokensFromURL } = router.query;

    if (tokensFromURL) {
      const decodedTokens = JSON.parse(decodeURIComponent(tokensFromURL));
      sessionStorage.setItem('youtube_tokens', JSON.stringify(decodedTokens));
      setTokens(decodedTokens);
      router.replace('/home'); // Clean the URL
    } else {
      const storedTokens = sessionStorage.getItem('youtube_tokens');
      if (storedTokens) {
        setTokens(JSON.parse(storedTokens));
      } else {
        const code = router.query.code;
        if (code) {
          fetch(`/api/auth?code=${code}`)
            .then((response) => response.json())
            .then((data) => {
              sessionStorage.setItem('youtube_tokens', JSON.stringify(data));
              setTokens(data);
              router.replace('/home'); // Clean the URL
            })
            .catch((error) => {
              console.error('Error fetching tokens:', error);
            });
        }
      }
    }
  }, [router.query]);

  const startLiveStream = async () => {
    if (tokens) {
      const response = await fetch('/api/start-live-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: tokens.access_token,
          expiry_date: tokens.expiry_date,
          refresh_token: tokens.refresh_token,
          scope: tokens.scope,
          token_type: tokens.token_type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLiveStreamInfo(data);
        await fetch('http://localhost:5100/api/update-stream-details', {
          // Update to match your Express server address
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: data.ingestionInfo.ingestionAddress,
            key: data.ingestionInfo.streamName,
          }),
        });
      } else {
        console.error('Failed to start live stream:', data.error);
      }
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>Live With YOUTUBE</title>
      </Head>
      <div className='grid grid-col-1 text-2xl w-full text-center'>
        <LiveStreamComponent />
      </div>
      <div className='mt-1 w-full flex-wrap flex justify-center'>
        <Link href='/auth'>Authenticate to Youtube</Link>
      </div>
      <div className='mt-1 w-full flex-wrap flex justify-center'>
        <button onClick={startLiveStream} disabled={!tokens}>
          Start Live Stream
        </button>
      </div>
      <div>
        {liveStreamInfo && (
          <div>
            <p>Stream URL: {liveStreamInfo.ingestionInfo.ingestionAddress}</p>
            <p>Stream Key: {liveStreamInfo.ingestionInfo.streamName}</p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
