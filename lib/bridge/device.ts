import { HomeyAPIV3, HomeyAPIV3Local } from 'homey-api';

import Clone from '../../drivers/clone/device';

abstract class Bridge extends Clone {

  override async _onAdded() {
    await super._onAdded(false); // don't forgetPeer
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract peerNotifyCapabilityValue(peer: HomeyAPIV3Local.ManagerDevices.Device, capability: string, value: any): void;

  // onInit, create a private DeviceCapability object as a proxy to each of its capabilities
  private peerCapability: { [_: string]: HomeyAPIV3.ManagerDevices.Device.DeviceCapability } = {};
  override async onInit(): Promise<void> {
    await super.onInit();

    const peer = await this.getPeer();
    // call peerNotifyCapabilityValue(c, v) when a capability (c) value (v) changes
    this.peerCapability = peer.capabilities
      .reduce((r, c) => Object.assign(r, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [c]: peer.makeCapabilityInstance(c, (v: any) => {
          this.peerNotifyCapabilityValue(peer, c, v);
        }),
      }), {});
  }

  public async _peerGetCapabilities(): Promise<string[]> {
    return (await this.getPeer()).capabilities;
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
    await this.peerCapability[c]?.setValue(v);
  }

  // cleanup resources created onInit
  override async onUninit() {
    this.logger.logD('onUninit');
    Object.values(this.peerCapability).forEach((pc) => pc.destroy());
    this.peerCapability = {};
  }
}

export default Bridge;
