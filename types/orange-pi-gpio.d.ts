declare module 'orange-pi-gpio' {
  export default class Gpio {
    constructor(options: {
      pin: number;
      mode: string;
      ready: () => Promise<void>;
    });
    read(): Promise<number>;
    // 添加其他你需要使用的方法
  }
}
