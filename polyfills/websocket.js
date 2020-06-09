if (!global.WebSocket){
    const ws = require('websocket/lib/WebSocketClient')
    global.WebSocket = ws;
}
module.exports= global.WebSocket;
module.exports.WebSocket= global.WebSocket;