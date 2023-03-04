const { app, BrowserWindow } = require('electron');


let win;

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 650,
    title: 'Video Player',
    icon: __dirname + '/icon.png',
    autoHideMenuBar: true
  });

  win.loadFile('index.html');

  win.webContents.once('dom-ready', () => {
    win.webContents.executeJavaScript(`
      const document = window.document;
      console.log(document);
    `);
  });
}


app.on('ready', createWindow);
