// pages/api/go-live.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_CLIENT_ID,
  process.env.NEXT_PUBLIC_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_REDIRECT_URI
);

// const transitionBroadcastToLive = async (
//   broadcastId: string,
//   oauth2Client: string
// ) => {
//   const youtube = google.youtube({
//     version: 'v3',
//     auth: oauth2Client,
//   });

//   await youtube.liveBroadcasts.transition({
//     id: broadcastId,
//     part: ['id,snippet,contentDetails,status'],
//     broadcastStatus: 'live',
//   });
// };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { url, key, broadcastId, accessToken } = req.body;

    if (!url || !key || !broadcastId || !accessToken) {
      res.status(400).json({
        error: 'Stream URL, key, broadcastId, and accessToken are required',
      });
      return;
    }

    // Set the OAuth2 client credentials
    oauth2Client.setCredentials({
      access_token: accessToken,
      // refresh_token: refresh_token,
      // expiry_date: expiry_date,
      // scope: scope,
      // token_type: token_type,
    });

    // Authenticate the YouTube API client with the OAuth2 credentials
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    try {
      await youtube.liveBroadcasts.transition({
        id: broadcastId,
        part: ['id', 'snippet', 'contentDetails', 'status'],
        broadcastStatus: 'live',
      });
      res
        .status(200)
        .json({ message: 'Broadcast transitioned to live successfully' });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to transition broadcast to live',
        details: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
