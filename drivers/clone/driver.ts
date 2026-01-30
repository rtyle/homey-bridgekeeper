import Homey from 'homey';
import { HomeyAPIV3Local } from 'homey-api';

import type App from '../../app.ts';
import Logger from '../../lib/logger.js';
import Capabilities from '../../lib/capabilities.js';

interface Device extends HomeyAPIV3Local.ManagerDevices.Device {
  capabilitiesOptions: object;
}

interface Api extends HomeyAPIV3Local {
  zones: HomeyAPIV3Local.ManagerZones;
}

class Clone extends Homey.Driver {
  protected logger = Logger.get(this.constructor.name);

  async onPair(session: Homey.Driver.PairSession) {
    this.logger.logD('onPair');

    // we can pair with any device
    const api = await (this.homey.app as App).getApi() as Api;
    const devices = Object.values(await api.devices.getDevices()) as Device[];

    // back-end handlers for pair/filter_devices.html front-end
    // provide lists of system's zones and classes (list_{zones,classes}) and
    // getters/setters for selections of such ({g,s}et_{zones,classes}).

    session.setHandler('list_zones', async () => {
      const list = Object.values(await api.zones.getZones()).sort((a, b) => a.name.localeCompare(b.name));
      this.logger.logD('onPair list_zones', list.map((item) => item.name).join(', '));
      return list.map((item) => ({ id: item.id, name: item.name }));
    });

    session.setHandler('list_classes', async () => {
      const list = [...new Set(devices.map((device) => device.class))].filter(Boolean).sort();
      this.logger.logD('onPair list_classes', list.join(', '));
      return list.map((item) => ({ id: item, name: item }));
    });

    let zones: string[] = [];
    session.setHandler('get_zones', async () => {
      this.logger.logD('onPair get_zones');
      return zones;
    });
    session.setHandler('set_zones', async (list: string[]) => {
      this.logger.logD('onPair set_zones', ...list);
      zones = list;
    });

    let classes: string[] = [];
    session.setHandler('get_classes', async () => {
      this.logger.logD('onPair get_classes');
      return classes;
    });
    session.setHandler('set_classes', async (list: string[]) => {
      this.logger.logD('onPair set_classes', ...list);
      classes = list;
    });

    // back-end handler for front-end list_devices template
    // filters devices by zones and classes
    session.setHandler('list_devices', async () => {
      this.logger.logD('onPair list_devices');
      const driverName_ = this.manifest.name[this.homey.i18n.getLanguage()] || this.manifest.name['en'];
      // our device will have all of our capabilities
      // plus those of its peer's that are system (sub-)capabilities

      const list = devices
        .filter((peer_) => !zones.length || zones.includes(peer_.zone))
        .filter((peer_) => !classes.length || classes.includes(peer_.class))
        .map((peer) => {
          return {
            name: this.homey.__('device_name', { peerDeviceName: peer.name, driverName: driverName_ }),
            data: {
              peerId: peer.id,
            },
            capabilities: [...(this.manifest.capabilities || []),
              ...peer.capabilities.filter((c) => Capabilities.has(c.split('.')[0]))],
            capabilitiesOptions: { ...(this.manifest.capabilitiesOptions || {}), ...peer.capabilitiesOptions },
            class: peer.class,
          };
        });

      this.logger.logV('onPair list_devices', JSON.stringify(list));
      return list;
    });
  }
}

export = Clone;
