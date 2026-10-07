const {app,BrowserWindow,Menu}=require("electron");
app.whenReady().then(()=>{Menu.setApplicationMenu(null);
const w=new BrowserWindow({width:900,height:640,backgroundColor:"#e9eaed",icon:__dirname+"/icon-512.png"});
w.loadFile("index.html")});
app.on("window-all-closed",()=>app.quit());
