import Homey from 'homey';
import { HomeyAPIV3Local } from 'homey-api';

import type App from '../../app.ts';
import Logger from '../../lib/logger.js';

interface CapabilitiesObj {
  [capability: string]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    lastUpdated?: string | number;
  } | undefined;
}

class Clone extends Homey.Device {
  protected readonly logger = Logger.get([this.constructor.name, this.getName()].join(': '));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requestCapabilityValue(c: string, v: any, _options: any) {
    this.logger.logD(`requestCapabilityValue: ${c} = ${v}`);
    await this.setCapabilityValue(c, v);
  }

  public commonCapabilities: string[] = [];

  // onInit, registerCapbilityListener (hasCapabilityValue) for each of our capabilities
  override async onInit() {
    this.logger.logD('onInit');
    const capabilities = this.getCapabilities();
    this.commonCapabilities = capabilities.filter((c) => !this.driver.manifest.capabilities.includes(c));
    capabilities
      .forEach((c) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.registerCapabilityListener(c, async (v: any, o: any) => {
          await this.requestCapabilityValue(c, v, o);
        });
      });
  }

  private peer : HomeyAPIV3Local.ManagerDevices.Device | null = null;
  private peerPromise: Promise<HomeyAPIV3Local.ManagerDevices.Device> | null = null;
  protected async getPeer(): Promise<HomeyAPIV3Local.ManagerDevices.Device> {
    if (this.peer) return this.peer;
    this.logger.logD('getPeer: promise');
    if (this.peerPromise) return this.peerPromise;
    this.peerPromise = (async () => {
      try {
        this.peer = await (await (this.homey.app as App).getApi())
          .devices.getDevice({ id: this.getData().peerId });
        return this.peer;
      } catch (e) {
        this.logger.logE_('getPeer: peer not found', e);
        this.peerPromise = null;
        throw e;
      } finally {
        this.logger.logD('getPeer: promise settled');
      }
    })();
    return this.peerPromise;
  }

  protected async peerSync() {
    const peer = await this.getPeer();
    const peerCapabilitiesObj = peer.capabilitiesObj as CapabilitiesObj;
    await Promise.all(this.commonCapabilities
      .map((c) => {
        const v = peerCapabilitiesObj[c]?.value;
        if (v !== null && v !== undefined && v !== this.getCapabilityValue(c)) {
          return this.setCapabilityValue(c, v)
            .then(() => this.logger.logD(`peerSync setCapabilityValue ${c} = ${v}`))
            .catch((e) => this.logger.logE_(`peerSync setCapabilityValue ${c} = ${v} failure`, e));
        }
        return Promise.resolve();
      }));
  }

  // override _onAdded in subclasses to avoid forgetting peer on onAdded
  protected async _onAdded(forgetPeer: boolean = false) {
    this.logger.logD('onAdded');
    // initialize our mirrored values of our peer's capabilities
    await this.peerSync();
    if (forgetPeer) {
      this.peer = null;
      this.peerPromise = null;
    }
  }

  override onAdded() {
    this._onAdded(true).catch((e) => {});
  }
}

export = Clone;
