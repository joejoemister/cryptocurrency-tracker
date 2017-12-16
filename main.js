const {app, BrowserWindow, Menu, Tray} = require('electron')
const path = require('path')
const url = require('url')
const shell = require('electron').shell
const ipc = require('electron').ipcMain

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var win
var iconpath = path.join(__dirname + '/assets/img/main_icon.ico')

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600, icon: iconpath})

  var appIcon = new Tray(iconpath);
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show', click: function() {
        app.isQuiting = false;
        win.show();
      }
    },
    {
      label: 'Quit', click: function() {
        app.isQuiting = true;
        app.quit();
      }
    }
  ])

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  /*
  // Open the DevTools.
  win.webContents.openDevTools()
  */
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  appIcon.setContextMenu(contextMenu);

  win.on('minimize', function(event){
    event.preventDefault()
        win.hide();
  })

  win.on('double_click', function() {
    appIcon.setHighlightMode('always')
    win.show();
  })

  win.on('close', function(event) {
    if(!app.isQuiting) {
      event.preventDefault()
          win.hide();
    } return false;
  })

  var menu = Menu.buildFromTemplate([{
      label: 'Menu',
      submenu: [
          {label: 'Adjust Notification Value'},
          {
              label: 'CoinMarketCap',
              click() {
                  shell.openExternal('https://coinmarketcap.com/currencies/electroneum/')
              }
          },
          {type: 'separator'},
          {
            label: 'Exit',
            click() {
                app.quit();
            }
          }
      ]},
    ])

  Menu.setApplicationMenu(menu);

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

ipc.on('update-notify-value', function(event, arg) {
    win.webContents.send('targetPriceVal', arg)
})