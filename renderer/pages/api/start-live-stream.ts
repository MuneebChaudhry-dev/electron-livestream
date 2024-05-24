import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_CLIENT_ID,
  process.env.NEXT_PUBLIC_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_REDIRECT_URI
);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken, expiry_date, refresh_token, scope, token_type } =
    req.body;

  if (!accessToken) {
    res.status(400).json({ error: 'Access token is required' });
    return;
  }

  // Set the OAuth2 client credentials
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refresh_token,
    expiry_date: expiry_date,
    scope: scope,
    token_type: token_type,
  });

  // Authenticate the YouTube API client with the OAuth2 credentials
  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });

  try {
    // Create a live broadcast
    const broadcastResponse = await youtube.liveBroadcasts.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: 'New Live Stream',
          description: 'Live streaming via API',
          scheduledStartTime: new Date().toISOString(),
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: true,
        },
      },
    });

    const broadcastId = broadcastResponse.data.id;

    // Create a live stream
    const streamResponse = await youtube.liveStreams.insert({
      part: ['snippet', 'cdn'],
      requestBody: {
        snippet: {
          title: 'New Live Stream',
          description: 'Live streaming via API',
        },
        cdn: {
          format: '1080p',
          resolution: '1080p',
          frameRate: '60fps',
          ingestionType: 'rtmp',
        },
      },
    });

    const streamId = streamResponse.data.id;
    const ingestionInfo = streamResponse.data.cdn.ingestionInfo;

    // Bind the live broadcast to the live stream
    await youtube.liveBroadcasts.bind({
      part: ['id', 'snippet', 'contentDetails', 'status'],
      id: broadcastId,
      streamId: streamId,
    });

    res.status(200).json({
      broadcastId,
      streamId,
      ingestionInfo,
    });
  } catch (error) {
    console.error('Error starting live stream:', error);
    res
      .status(500)
      .json({ error: 'Failed to start live stream', details: error.message });
  }
}

export default handler;
