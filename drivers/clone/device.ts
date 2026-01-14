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
  protected readonly logger = Logger.get([this.constructor.name, this.getName()].join(' '));

  private peer : HomeyAPIV3Local.ManagerDevices.Device | null = null;
  private peerPromise: Promise<HomeyAPIV3Local.ManagerDevices.Device> | null = null;
  protected async getPeer(): Promise<HomeyAPIV3Local.ManagerDevices.Device> {
    if (this.peer) return this.peer;
    this.logger.logD('getPeer promise');
    if (this.peerPromise) return this.peerPromise;
    this.peerPromise = (async () => {
      try {
        this.peer = await (await (this.homey.app as App).getApi())
          .devices.getDevice({ id: this.getData().peerId });
        return this.peer;
      } catch (e) {
        this.logger.logE_('peer not found', e);
        this.peerPromise = null;
        throw e;
      } finally {
        this.logger.logD('getPeer resolved');
      }
    })();
    return this.peerPromise;
  }

  protected async copyPeer() {
    this.logger.logD('copyPeer');
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
    this.logger.logD('onAdded');
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requestCapabilityValue(c: string, v: any, _options: any) {
    this.logger.logD(`requestCapabilityValue: ${c} = ${v}`);
    await this.setCapabilityValue(c, v);
  }

  // onInit, registerCapbilityListener (hasCapabilityValue) for each of our capabilities
  override async onInit() {
    this.logger.logD('onInit');
    this.getCapabilities()
      .forEach((c) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.registerCapabilityListener(c, async (v: any, o: any) => {
          await this.requestCapabilityValue(c, v, o);
        });
      });
  }
}

export = Clone;
