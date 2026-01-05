import Homey from 'homey';
import { HomeyAPI, HomeyAPIV3Local } from 'homey-api';

declare module 'homey-api' {
  // use typescript declaration merging to add what this module is missing
  interface HomeyAPIV3Local {
    devices: HomeyAPIV3Local.ManagerDevices;
  }
}

class App extends Homey.App {
  private api: HomeyAPIV3Local | null = null;
  private apiPromise: Promise<HomeyAPIV3Local> | null = null;
  async getApi(): Promise<HomeyAPIV3Local> {
    if (this.api) return this.api;
    if (this.apiPromise) return this.apiPromise;
    this.apiPromise = HomeyAPI.createAppAPI({ homey: this.homey })
      .then((api) => {
        this.api = api;
        return api;
      })
      .catch((e) => {
        this.apiPromise = null;
        throw e;
      });
    return this.apiPromise;
  }

  async onInit() {
    this.getApi().catch(this.error);
  }
}

export = App;
