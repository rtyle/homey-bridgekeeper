import { HomeyAPIV3 } from 'homey-api';

import Clone from '../../drivers/clone/device';

abstract class Bridge extends Clone {

  override onAdded() {
    this._onAdded();
  }

  // peerHasSetCapabilityValue is called in repsonse to a successful peer setCapabilityValue request.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract peerHasSetCapabilityValue(capability: string, value: any): Promise<void>;

  // onInit, create a private DeviceCapability object as a proxy to each of its capabilities
  private peerCapability: { [key: string]: HomeyAPIV3.ManagerDevices.Device.DeviceCapability } = {};
  override async onInit(): Promise<void> {
    await super.onInit();
    const peer = await this.getPeer();
    // call peerHasCapabilityValue(c, v) when a capability (c) value (v) changes
    this.peerCapability = peer.capabilities
      .reduce((r, c) => Object.assign(r, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [c]: peer.makeCapabilityInstance(c, (v: any) => {
          (async () => {
            await this.peerHasSetCapabilityValue(c, v);
          })().catch(this.error);
        }),
      }), {});
  }

  // like this.getCapabilityValue for our peer
  protected peerGetCapabilityValue(c: string) {
    const v = this.peerCapability[c].value;
    this.log(`${this.constructor.name} peerGetCapabilityValue: ${c} = ${v}`);
    return v;
  }

  // like this.setCapabilityValue for our peer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async peerSetCapabilityValue(c: string, v: any) {
    this.log(`${this.constructor.name} peerSetCapabilityValue: ${c} = ${v}`);
    await this.peerCapability[c].setValue(v);
  }

  // cleanup resources created onInit
  override async onUninit() {
    this.log(`${this.constructor.name} onUninit`);
    Object.values(this.peerCapability).forEach((pc) => pc.destroy());
    this.peerCapability = {};
  }
}

export default Bridge;
