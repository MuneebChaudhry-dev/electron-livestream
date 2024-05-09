import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import express from 'express';
import cors from 'cors';
import * as child_process from 'child_process';
import * as http from 'http';
import * as socketIo from 'socket.io';
import { ffmpeg2, youtubeSettings, inputSettings } from './helpers/ffmpeg';

const isProd = process.env.NODE_ENV === 'production';

let mainWindow: Electron.BrowserWindow | null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (isProd) {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
      })
    );
  } else {
    const port = process.argv[2];
    mainWindow.loadURL(`http://localhost:${port}/`);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

console.log(ffmpeg2);
const appServer = express();
appServer.use(cors());
appServer.use(express.json({ limit: '200mb' }));
appServer.use(
  express.urlencoded({ limit: '200mb', extended: true, parameterLimit: 50000 })
);

appServer.get('/', (req: express.Request, res: express.Response) => {
  res.send('Application works!');
});

const PORT = process.env.PORT || 5100;
const WS_PORT: number = Number(process.env.PORT) || 3100;
const server = http.createServer(appServer);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log(`socket connected to ${socket.id}`);

  const socketQueryParams = socket.handshake.query;
  const youtubeDestinationUrl = `rtmp://y.rtmp.youtube.com/live2/r6z4-zsyu-gz01-1m01-ed0w`;

  const ffmpegInput = inputSettings.concat(
    youtubeSettings(youtubeDestinationUrl)
  );

  const ffmpeg = child_process.spawn('ffmpeg', ffmpegInput);

  ffmpeg.on('close', (code: any, signal: any) => {
    console.log(
      'FFmpeg child process closed, code ' + code + ', signal ' + signal
    );
    socket.emit('error', 'FFmpeg process closed');
  });

  ffmpeg.stdin.on('error', (e: any) => {
    console.log('FFmpeg STDIN Error', e);
    socket.emit('error', 'FFmpeg STDIN error');
  });

  ffmpeg.stderr.on('data', (data: any) => {
    console.log('FFmpeg STDERR:', data.toString());
  });

  socket.on('message', (msg: any) => {
    console.log('DATA', msg);
    ffmpeg.stdin.write(msg);
  });

  socket.conn.on('close', () => {
    console.log('kill: SIGINT');
    ffmpeg.kill('SIGINT');
  });
});

server.listen(PORT, () => {
  console.log('Application started on port ', PORT);
});
