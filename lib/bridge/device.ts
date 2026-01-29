import { HomeyAPIV3, HomeyAPIV3Local } from 'homey-api';

import Clone from '../../drivers/clone/device';

abstract class Bridge extends Clone {

  override async _onAdded() {
    await super._onAdded(false); // don't forgetPeer
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract peerNotifyCapabilityValue(peer: HomeyAPIV3Local.ManagerDevices.Device, capability: string, value: any): void;

  // onInit, create private DeviceCapability objects to bridge to our common capabilities
  private peerCapability: { [_: string]: HomeyAPIV3.ManagerDevices.Device.DeviceCapability } = {};
  override async onInit(): Promise<void> {
    await super.onInit();

    try {
      const peer = (await this.getPeer()) as Device;

      // call peerNotifyCapabilityValue(c, v) when a capability (c) value (v) changes
      this.peerCapability = this.commonCapabilities
        .reduce((r, c) => Object.assign(r, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [c]: peer.makeCapabilityInstance(c, (v: any) => {
            this.peerNotifyCapabilityValue(peer, c, v);
          }),
        }), {});
    } catch (e) {
      this.logger.logE_(`onInit: unavailable ${e}`);
      await this.setUnavailable();
    }
  }

  // like this.getCapabilityValue for our peer
  protected peerGetCapabilityValue(c: string) {
    const v = this.peerCapability[c].value;
    this.logger.logV(`peerGetCapabilityValue: ${c} = ${v}`);
    return v;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async peerSetCapabilityValue(c: string, v: any) {
    this.logger.logD(`peerSetCapabilityValue: ${c} = ${v}`);
    try {
      await this.peerCapability[c]?.setValue(v);
    } catch (e) {
      this.logger.logE_(`peerSetCapabilityValue: unavailable ${e}`);
      await this.setUnavailable();
    }
  }

  // cleanup resources created onInit
  override async onUninit() {
    this.logger.logD('onUninit');
    Object.values(this.peerCapability).forEach((pc) => pc.destroy());
    this.peerCapability = {};
  }
}

export default Bridge;
