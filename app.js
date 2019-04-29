const express = require('express')
const http = require('http');
//make sure you keep this order
const app = express();
const server = http.createServer(app);
const path = require('path');
//let speed = 255
let speed = [216, 255]

const hbs = require('hbs');

require('dotenv').config()

const five = require("johnny-five");
const board = new five.Board();

const internalIp = require('internal-ip');
var exec = require('child_process').exec;

var socket = require('socket.io-client')(process.env.REMOTE);
console.log(process.env.REMOTE)

console.log("antes de conectar")
socket.on('connect', function () {

  console.log("connected by socket", socket.connected, socket.id)

  board.on("ready", () => {
    console.log("placa lista")

    boardConnected = true
    setTimeout(() => { socket.emit('board ready', boardConnected); }, 2000)

    socket.emit("local ip", internalIp.v4.sync())

    socket.on("speed update", msg => {
      console.log(msg)
      if (msg == 1) {
        speed = [110, 128]
      }
      else if (msg == 2) {
        speed = [165, 191]
      }
      else if (msg == 3) {
        speed = [222, 255]
      }

      console.log(speed)

    })


    const servoUpDown = new five.Servo({
      pin: 4,
      center: true
    })

    const servoLeftRight = new five.Servo({
      pin: 5,
      center: true
    })

    let servoMov = {
      speed: 3000
    }

    const detector = new five.Sensor({
      pin: 6,
      type: "digital"
    });

    detectMetal = () => {
      detector.on("change", function () {
        console.log(this.value)
        socket.emit('metal detected', this.value);
      });
    }

    detectMetal()
    let primera = true
    socket.on("camServo", msg => {

      let servoInterval
      switch (msg) {
        case "up":
          console.log("servo moves up")
          servoUpDown.to(0, servoMov.speed)
          break
        case "down":
          console.log("servo moves down")
          servoUpDown.to(180, servoMov.speed)


          break
        case "left":
          console.log("servo moves left")
          servoLeftRight.to(180, servoMov.speed)

          break
        case "right":
          console.log("servo moves right", servoMov.leftRight)
          servoLeftRight.to(0, servoMov.speed)
          break
        case "stop":
          console.log("stop")
          servoLeftRight.stop()
          servoUpDown.stop()
          break
        case "center":
          servoLeftRight.center()
          servoUpDown.center()


      }
    })


    socket.on("keypress", msg => {
      console.log(msg)
      switch (msg) {

        case 38:
          console.log("Hacia adelante")
          var configs = five.Motor.SHIELD_CONFIGS.ARDUINO_MOTOR_SHIELD_R3_1;
          //Motor B es el derecho
          var motorA = new five.Motor(configs.A);
          var motorB = new five.Motor(configs.B);
          motorB.forward(speed[1])
          motorA.forward(speed[0])

          //res.json({ distancia: "distancia" })
          break
        case 40:

          console.log("Hacia detras")
          var configs = five.Motor.SHIELD_CONFIGS.ARDUINO_MOTOR_SHIELD_R3_1;

          var motorA = new five.Motor(configs.A);
          var motorB = new five.Motor(configs.B);

          motorA.reverse(speed[0])
          motorB.reverse(speed[1])

          //res.json({ distancia: "distancia" })

          break
        case 37:

          var configs = five.Motor.SHIELD_CONFIGS.ARDUINO_MOTOR_SHIELD_R3_1;

          var motorA = new five.Motor(configs.A);
          var motorB = new five.Motor(configs.B);

          motorB.forward(speed[1])
          motorA.reverse(speed[0])
          //res.json({ distancia: "distancia" })


          break;
        case 39:
          var configs = five.Motor.SHIELD_CONFIGS.ARDUINO_MOTOR_SHIELD_R3_1;

          var motorA = new five.Motor(configs.A);
          var motorB = new five.Motor(configs.B);

          motorA.forward(speed[0])
          motorB.reverse(speed[1])
          //res.json({ distancia: "distancia" })

          break;
        case 90:
          servo.to(0)
          break
        case 88:
          servo.to(180)
          break

        case "stop":
          var configs = five.Motor.SHIELD_CONFIGS.ARDUINO_MOTOR_SHIELD_R3_1;

          var motorA = new five.Motor(configs.A);
          var motorB = new five.Motor(configs.B);

          motorA.stop()
          motorB.stop()
          //res.json({ distancia: "distancia" })
          break
        default:
          break
      }
      detectMetal()
    })
  })
});

// socket.on('event', function (data) { });
// socket.on('disconnect', function () { });

const port = process.env.PORT

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

const bodyParser = require("body-parser")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

let boardConnected = false

shutdown = (callback) => {
  exec('sudo /sbin/shutdown now', function (msg) { console.log(msg) });
}

app.get('/', (req, res, next) => {
  let data = {
    ip: internalIp.v4.sync()
  }

  res.render('index', data);
});

app.post("/shutdown", (req, res, next) => {

  console.log("shutdown has been pushed")
  shutdown(function (output) {
    console.log(output);
  })
})
server.listen(port, () => console.log(`Example app listening on port ${port}!`))