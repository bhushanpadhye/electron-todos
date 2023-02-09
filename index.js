const electron = require('electron');

const { app, BrowserWindow, ipcMain, Menu } = electron;

let mainWindow;
let modalWindow;

function buildMenuItem() {
    let menuItemList = [];

    if(process.platform === 'darwin') {
        menuItemList.push({
            label: ''
        });
    }

    menuItemList.push({
        label: 'File',
        submenu: [
            {
                label: 'New Todo',
                click() {
                    createModalWindow()
                }
            },
            {
                label: 'Clear Todo',
                click() {
                    mainWindow.webContents.send('todo:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    });

    if(process.env.NODE_ENV !== 'production') {
        menuItemList.push({
            label: 'Debug',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
                    click(event, focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    role: 'reload'
                }
            ]
        })
    }

    const menuItems = Menu.buildFromTemplate(menuItemList);
    Menu.setApplicationMenu(menuItems);
}

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadURL(`file://${__dirname}/main.html`);
    mainWindow.on('closed', () => app.quit());
    buildMenuItem();
})

function createModalWindow() {
    modalWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'New Todo Modal',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    modalWindow.loadURL(`file://${__dirname}/modal.html`);
    modalWindow.on('closed', ()=> {modalWindow = null});
}

ipcMain.on('todo:add', (event, todo) => {
    mainWindow.webContents.send('todo:show', todo);
    modalWindow.close();
})
