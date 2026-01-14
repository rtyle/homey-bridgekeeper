import Bridge from '../../lib/bridge/device';

class Shield extends Bridge {

  private async setShieldDriftValue(value: string) {
    this.logger.logD(`setShieldDriftValue: ${value}`);
    await this.setCapabilityValue('shield_drift', value);
  }

  private async setShieldDriftSet(newSet: Set<string>) {
    // derive oldSet from the current capability value as it persists across reboots
    const oldSet: Set<string> = new Set(this.getCapabilityValue('shield_drift').split(', ').filter((s: string) => s));
    // no Set.symmetricDifference(), so do it manually
    const symmetricDifference = new Set([
      ...Array.from(newSet).filter((e) => !oldSet.has(e)),
      ...Array.from(oldSet).filter((e) => !newSet.has(e)),
    ]);
    if (symmetricDifference.size > 0) { // is there a difference?
      // update (and store) capability value
      await this.setShieldDriftValue(Array.from(newSet).sort().join(', '));
      // trigger flows for each changed capability
      for (const c of symmetricDifference) {
        const v = String(this.peerGetCapabilityValue(c));
        this.logger.logD(`trigger shield_drift: ${c} = ${v}`);
        this.homey.flow
          .getDeviceTriggerCard('shield_drift')
          .trigger(this, { value: v }, { capability: c })
          .then(() => this.logger.logD(`trigger shield_drift: ${c} = ${v} success`))
          .catch((e) => this.error(`${this.getName()} trigger shield_drift: ${c} = ${v}`, e));
      }
    }
  }

  public async _setShieldOnoffValue(v: boolean) {
    this.logger.logD(`setShieldOnoffValue: ${v}`);
    await this.setCapabilityValue('shield_onoff', v);
    await this.copyPeer();
    await this.setShieldDriftValue('');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async requestCapabilityValue(c: string, v: any, o: any) {
    if (this.driver.manifest.capabilities.includes(c)) {
      switch (c) {
        case 'shield_onoff':
          await this._setShieldOnoffValue(v);
          break;
        default:
          this.logger.logE_(`requestCapabilityValue: ${c} = ${v} unsupported`);
          throw new Error(`unsupported shield capability request: ${c} = ${v}`);
      }
    } else {
      this.logger.logD(`requestCapabilityValue: ${c} = ${v}`);
      if (this.getCapabilityValue('shield_onoff')) {
        this.logger.logD_(`requestCapabilityValue: ${c} = ${v} blocked`);
        throw new Error(this.homey.__('errors.set_capability_value_blocked', { name: this.getName(), capability: c, value: v }));
      } else {
        await this.peerSetCapabilityValue(c, v); // update drift upon peerNotifyCapabilityValue
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async peerNotifyCapabilityValue(c: string, v: any) {
    this.logger.logD(`peerNotifyCapabilityValue: ${c} = ${v}`);
    await this.setShieldDriftSet(new Set((await this.getPeer()).capabilities
      .filter((c) => this.getCapabilityValue(c) !== this.peerGetCapabilityValue(c))));
  }
}

export = Shield;
