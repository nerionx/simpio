const { app, BrowserWindow } = require('electron')
const {ipcMain} = require('electron');
const path = require('path');
var radio_dns = require("./js/dns_query");
radio_dns = new radio_dns;
var radio_url = "";
window_main = ""

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  window_main=win;

  win.loadFile('index.html')
}

ipcMain.on("asynchronous-message",(event,result) =>{
  switch(result){
    case "geturl":
      console.log("Sending url");
      radio_dns.get_radiobrowser_base_url_random().then(result => window_main.webContents.send('asynchronous-message',{'type':"dns",'radiourl': result})); //Get a random url for the radio api
    break;
  }
})

app.whenReady().then(() => {
  createWindow();
  
  

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})