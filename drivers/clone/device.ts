import Homey from 'homey';
import { HomeyAPIV3Local } from 'homey-api';
import type App from '../../app.ts';

interface CapabilitiesObj {
  [capability: string]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    lastUpdated?: string | number;
  } | undefined;
}

class Clone extends Homey.Device {

  private peer : HomeyAPIV3Local.ManagerDevices.Device | null = null;
  private peerPromise: Promise<HomeyAPIV3Local.ManagerDevices.Device> | null = null;
  protected async getPeer(): Promise<HomeyAPIV3Local.ManagerDevices.Device> {
    this.log(`${this.constructor.name} getPeer`);
    if (this.peer) return this.peer;
    if (this.peerPromise) return this.peerPromise;
    this.peerPromise = (async () => {
      try {
        this.peer = await (await (this.homey.app as App).getApi())
          .devices.getDevice(this.getData().peerId);
        return this.peer;
      } catch (e) {
        this.error('peer not found:', e);
        this.peerPromise = null;
        throw e;
      }
    })();
    return this.peerPromise;
  }

  protected async copyPeer() {
    this.log(`${this.constructor.name} copyPeer`);
    const peer = await this.getPeer();
    const peerCapabilitiesObj = peer.capabilitiesObj as CapabilitiesObj;
    await Promise.all(peer.capabilities
      .map((c) => {
        const v = peerCapabilitiesObj[c]?.value;
        if (v !== null && v !== undefined) {
          return this.setCapabilityValue(c, v).catch(this.error);
        }
        return Promise.resolve();
      }));
  }

  protected _onAdded(forgetPeer: boolean = false) {
    this.log(`${this.constructor.name} onAdded`);
    (async () => {
      await this.copyPeer();
      if (forgetPeer) {
        this.peer = null;
        this.peerPromise = null;
      }
    })().catch(this.error);
  }

  override onAdded() {
    this._onAdded(true);
  }

  // maySetCapabilityValue is called in repsonse to a setCapabilityValue request.
  // throw to deny the request.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maySetCapabilityValue(capability: string, value: any, _options: any) {
    this.log(`${this.constructor.name} hasCapabilityValue: ${capability} = ${value}`);
  }

  // onInit, registerCapbilityListener (hasCapabilityValue) for each of our capabilities
  override async onInit() {
    this.log(`${this.constructor.name} onInit`);
    this.getCapabilities()
      .forEach((c) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.registerCapabilityListener(c, async (v: any, o: any) => {
          await this.maySetCapabilityValue(c, v, o);
        });
      });
  }
}

export = Clone;
