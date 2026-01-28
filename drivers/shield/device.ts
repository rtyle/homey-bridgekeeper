import { HomeyAPIV3Local } from 'homey-api';
import Bridge from '../../lib/bridge/device';

enum Capability {
  onoff = 'shield_onoff',
  drift = 'shield_drift',
}

class Shield extends Bridge {
  public static readonly Capability = Capability;

  override async _onAdded() {
    await super._onAdded(); // initialize our mirrored values of our peer's capabilities
    const shieldCapabilityDefaults: Array<[Capability, boolean | string]> = [
      [Capability.onoff, false],
      [Capability.drift, ''],
    ];
    await Promise.all(shieldCapabilityDefaults.map(async ([c, v]) => {
      this.logger.logD(`onAdded setCapabilityValue ${c} = ${v}`);
      await this.setCapabilityValue(c, v);
    }));
  }

  private async setShieldDriftValue(value: string) {
    this.logger.logD(`setShieldDriftValue: ${value}`);
    await this.setCapabilityValue(Capability.drift, value);
  }

  private async setShieldDriftSet(newSet: Set<string>) {
    // derive oldSet from the current capability value as it persists across reboots
    const oldSet: Set<string> = new Set((this.getCapabilityValue(Capability.drift) || '')
      .split(', ')
      .filter((s: string) => s));
    // no Set.symmetricDifference(), so do it manually
    const symmetricDifference = new Set([
      ...Array.from(newSet).filter((e) => !oldSet.has(e)),
      ...Array.from(oldSet).filter((e) => !newSet.has(e)),
    ]);
    if (symmetricDifference.size > 0) { // is there a difference?
      // update (and store) capability value
      await this.setShieldDriftValue(Array.from(newSet).sort().join(', '));
      // trigger flows for each changed capability
      await Promise.all(Array.from(symmetricDifference).map(async (c) => {
        const v = String(this.peerGetCapabilityValue(c));
        this.logger.logD(`trigger shield_drift: ${c} = ${v}`);
        await this.homey.flow
          .getDeviceTriggerCard(Capability.drift)
          .trigger(this, { value: v }, { capability: c });
      }));
    }
  }

  // serialize processing by settling the last promise before making the next one
  private lastPromise: Promise<void> = Promise.resolve();

  public async _setShieldOnoffValue(v: boolean) {
    this.lastPromise = this.lastPromise.then(async () => {
      this.logger.logD(`setShieldOnoffValue: ${v}`);
      await this.setCapabilityValue(Capability.onoff, v);
      await this.peerSync();
      await this.setShieldDriftValue('');
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async requestCapabilityValue(c: string, v: any, o: any) {
    if (this.driver.manifest.capabilities.includes(c)) {
      switch (c) {
        case Capability.onoff:
          await this._setShieldOnoffValue(v);
          break;
        default:
          this.logger.logE_(`requestCapabilityValue: ${c} = ${v} unsupported`);
          throw new Error(`unsupported shield capability request: ${c} = ${v}`);
      }
    } else if (this.getCapabilityValue(Capability.onoff)) {
      this.logger.logD(`requestCapabilityValue: ${c} = ${v} blocked`);
      throw new Error(this.homey.__('error.set_capability_value_blocked', { name: this.getName(), capability: c, value: v }));
    } else {
      this.lastPromise = this.lastPromise.then(async () => {
        this.logger.logD(`requestCapabilityValue: ${c} = ${v}`);
        await this.peerSetCapabilityValue(c, v); // update drift upon peerNotifyCapabilityValue
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async peerNotifyCapabilityValue(peer: HomeyAPIV3Local.ManagerDevices.Device, c: string, v: any) {
    // resolve our lastPromise then promise to process this change
    // this ensures that we have completed processing of prior changes before starting on this one
    this.lastPromise = this.lastPromise.then(async () => {
      this.logger.logD(`peerNotifyCapabilityValue: ${c} = ${v}`);
      if (this.driver.manifest.capabilities.includes(c)) {
        this.logger.logE_(`peerNotifyCapabilityValue: ${c} = ${v} unsupported`);
      } else {
        await this.setShieldDriftSet(new Set((await this.getCommonCapabilities())
          .filter((c) => this.getCapabilityValue(c) !== this.peerGetCapabilityValue(c))));
      }
    });
  }
}

export = Shield;
