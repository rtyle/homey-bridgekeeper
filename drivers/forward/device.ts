import Bridge from '../../lib/bridge/device';

class Forward extends Bridge {

  // both maySetCapabilityValue and peerHasSetCapabilityValue
  // forward the setCapabilityValue only if different
  // to avoid an infinite loop

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async maySetCapabilityValue(c: string, v: any, o: any) {
    this.log(`${this.constructor.name} maySetCapabilityValue: ${c} = ${v}`);
    if (v !== this.peerGetCapabilityValue(c)) {
      await this.peerSetCapabilityValue(c, v);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async peerHasSetCapabilityValue(c: string, v: any) {
    const v_ = this.getCapabilityValue(c);
    this.log(`${this.constructor.name} getCapabilityValue: ${c} = ${v_}`);
    if (v !== v_) {
      this.log(`${this.constructor.name} setCapabilityValue: ${c} = ${v}`);
      await this.setCapabilityValue(c, v);
    }
  }
}

export = Forward;
