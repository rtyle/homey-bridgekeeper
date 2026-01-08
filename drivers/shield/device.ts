import Bridge from '../../lib/bridge/device';

class Shield extends Bridge {

  override async copyPeer() {
    await super.copyPeer();
    await this.setCapabilityValue('shield_drift', '').catch(this.error);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async maySetCapabilityValue(c: string, v: any, o: any) {
    this.logger.logD(`maySetCapabilityValue: ${c} = ${v}`);
    if (this.driver.manifest.capabilities.includes(c)) {
      if (c === 'shield_onoff') {
        await this.copyPeer();
      }
    } else if (v !== this.peerGetCapabilityValue(c)) {
      if (this.getCapabilityValue('shield_onoff')) {
        throw new Error(this.homey.__('errors.set_capability_value_blocked', { capability: c, value: v }));
      } else {
        await this.peerSetCapabilityValue(c, v); // let it throw on error
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async peerHasSetCapabilityValue(c: string, v: any) {
    this.logger.logD(`peerHasSetCapabilityValue: ${c} = ${v}`);
    const capability = 'shield_drift';
    const value = this.getCapabilities()
      .filter((c) => !this.driver.manifest.capabilities.includes(c))
      .filter((c) => this.getCapabilityValue(c) !== this.peerGetCapabilityValue(c))
      .sort()
      .join(', ');
    if (value !== this.getCapabilityValue(capability)) {
      this.logger.logD(`setCapabilityValue: ${capability} = ${value}`);
      await this.setCapabilityValue(capability, value);
    }
  }
}

export default Shield;
