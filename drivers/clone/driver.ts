import Homey from 'homey';
import { HomeyAPIV3Local } from 'homey-api';

import type App from '../../app.ts';
import Log from '../../lib/logger.js';

interface Device extends HomeyAPIV3Local.ManagerDevices.Device {
  capabilitiesOptions: object;
}

class Clone extends Homey.Driver {
  protected logger = Log.get(this.constructor.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async onPairListDevices(): Promise<Array<any>> {
    const driverName_ = this.manifest.name[this.homey.i18n.getLanguage()] || this.manifest.name['en'];
    this.logger.logD('onPairListDevices');
    // we can pair with any device.
    // our device will have all of our capabilities plus all of its peer's capabilities
    return Object.values(await (await (this.homey.app as App).getApi()).devices.getDevices())
      .map((peer_) => {
        const peer = peer_ as Device;
        return {
          name: this.homey.__('device_name', { peerDeviceName: peer.name, driverName: driverName_ }),
          data: {
            peerId: peer.id,
          },
          capabilities: [...(this.manifest.capabilities || []), ...peer.capabilities],
          capabilitiesOptions: { ...(this.manifest.capabilitiesOptions || {}), ...peer.capabilitiesOptions },
        };
      });
  }
}

export = Clone;
