"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orange_pi_gpio_1 = __importDefault(require("orange-pi-gpio"));
const emit_1 = __importDefault(require("./utils/emit"));
const logger_1 = __importDefault(require("./utils/logger"));
console.log("lock module loaded");
const port = 20;
let prevState = null;
let triggered = false;
const gpio = new orange_pi_gpio_1.default({
    pin: port,
    mode: "in",
    ready: () => __awaiter(void 0, void 0, void 0, function* () {
        prevState = yield gpio.read();
        setInterval(function () {
            gpio.read().then((state) => {
                if (prevState !== state) {
                    logger_1.default.info("pin " + port + " 通电状态: " + state);
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
                    if (triggered)
                        return;
                    emit_1.default.emit("startRfidReading");
                    triggered = true;
                }
                prevState = state;
            });
        }, 500);
    }),
});
