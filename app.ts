import Homey from 'homey';
import { HomeyAPI, HomeyAPIV3Local } from 'homey-api';

import Logger from './lib/logger';

declare module 'homey-api' {
  // use typescript declaration merging to add what this module is missing
  interface HomeyAPIV3Local {
    devices: HomeyAPIV3Local.ManagerDevices;
  }
}

class App extends Homey.App {
  protected readonly logger = Logger.get(this.constructor.name);

  private apiPromise: Promise<HomeyAPIV3Local> | null = null;
  async getApi(): Promise<HomeyAPIV3Local> {
    return this.apiPromise!;
  }

  async onInit() {
    Logger.init(Logger.LevelThreshold.D, this.log.bind(this), this.error.bind(this));
    this.logger.logD('onInit');
    this.apiPromise = HomeyAPI.createAppAPI({ homey: this.homey });
  }
}

export default App;
