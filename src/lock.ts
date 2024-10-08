import Gpio from "orange-pi-gpio";
import eventEmitter from "./utils/emit";
import logger from "./utils/logger";

const port: number = 20;
let prevState: number | null = null;
let triggered: boolean = false;

const gpio = new Gpio({
  pin: port,
  mode: "in",
  ready: async () => {
    prevState = await gpio.read();
    setInterval(function () {
      gpio.read().then((state: number) => {
        if (prevState !== state) {
          logger.info("pin " + port + " 通电状态: " + state);
        }
        // return
        // 开门
        if (state === 1) {
          console.log("开门");
          triggered = false;
        }
        // 关门
        else if (state === 0) {
          console.log("关门");
          if (triggered) return;
          eventEmitter.emit("startRfidReading");
          triggered = true;
        }
        prevState = state;
      });
    }, 500);
  },
});

