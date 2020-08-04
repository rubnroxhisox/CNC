var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var axios = require('axios');
var FormData = require('form-data');
var dt = require("./digitaltwin");

var num_Connections = 0;
var users = [];
var cncjs = [];
var twinarray = [];
var token = null;
var file = {
  name: 'GCODE',
  gcode: 'G17 G21 G90 G94 G54\nG0 X-5 Y0 Z0 F200\nG2 X0 Y5 I5 J0 F200\nG02 X5 Y0 I0 J-5\nG02 X0 Y-5 I-5 J0\nG02 X-5 Y0 I0 J5\nG01 Z1 F500\nG00 X0 Y0 Z5 ',
  context: ' '
}

//Middleware
app.get("/", (req, res) => {
  res.send("<h1>Sending Data.....</h1>");
});

http.listen(3000, () => {
  console.log("Listening on port 3000");
});

//Handler for when a new connection is made to the server, when the event 'connection' is triggered
//socket is the new instace of the user, each client will have a different socket
io.on("connection", (socket) => {
  //Keep track of how many connections that we have
  num_Connections++;
  console.log("We have a new connection");
  console.log("The number of connections is: " + num_Connections);

  socket.on("type", (data) => {
    if (data === 1) {
      //Type 1 will be a CNCjs user
      console.log("We have a new CNCjs connection");
      cncjs.push(socket);
      socket.emit("givemeparameters");
      console.log("Emitting static to require parameters");
      socket.emit('file', file);
    } else if (data === 2) {
      //Type 2 will be a user that is wanting to upload a job
      console.log(
        "We have a new user connected and waiting to upload a g code file YAY THANK GOD"
      );
      users.push(socket);
    }
  });

  socket.on("parameters", (parameters) => {
    console.log("We have received new parameters");
    var digTwin = new dt(socket.id, num_Connections);
    //digTwin.parameters(parameters);
    twinarray.push(digTwin);
    //console.log("Digital Twins", twinarray);
  });

  //console.log('Users: ', users);
  socket.on("disconnect", () => {
    console.log("User disconnected...");
    num_Connections--;
    console.log("There is now: " + num_Connections);
    //Need to have a way to remove the user and Digital Twin from their respective arrays on
    //disconnection from the server
  });

  socket.on("mpos", (position) => {
    console.log("We have recieved the position of the machine")
    console.log(position);
  });

  socket.on("wpos", (position) => {
    console.log("We have received the position of the work peice");
    console.log(position);
  });

  socket.on('uploading', () => {
    console.log("Trying to upload the GCode file");
  });

  socket.on('code', (gcode) => {
    console.log("We have received this Gcode: " + gcode);
  })

  socket.on('token', (token) => {
    console.log("This is the access token: " + token);
  })

  socket.on('loadgcode', () => {
    console.log("Trying to load gcode!");
    var data = new FormData();
    data.append('port', '/dev/tty.usbserial-14310');
    data.append('name', 'Test G Code');
    data.append('gcode', 'G17 G21 G90 G94 G54\nG0 X-5 Y0 Z0 F200\nG2 X0 Y5 I5 J0 F200\nG02 X5 Y0 I0 J-5\nG02 X0 Y-5 I-5 J0\nG02 X-5 Y0 I0 J5\nG01 Z1 F500\nG00 X0 Y0 Z5');

    var config = {
      method: 'post',
      url: 'http://172.23.190.112:8000/api/gcode',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiIsIm5hbWUiOiIiLCJpYXQiOjE1OTUzOTkxMDMsImV4cCI6MTU5Nzk5MTEwM30.81xqioWW0pVspqh-8EdiPMDtk8VSiwFSoSs0ewtAjek',
        ...data.getHeaders()
      },
      data: data
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });

  })

  socket.on('file', (file) => {
    console.log("We have received a file!");
    console.log(file);
  })

});

//'Cookie': 'lang=en; connect.sid=s%3AxGkzXhe7DSeTXUVP_wk_vqYb3s_sMGtu.0%2BlZVs%2Bk0DmmTZvTFzOzvWwl0AZd%2BGA8GKXtSFFmdDY'