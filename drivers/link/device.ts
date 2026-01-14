import Bridge from '../../lib/bridge/device';

class Link extends Bridge {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async requestCapabilityValue(c: string, v: any, o: any) {
    await super.requestCapabilityValue(c, v, o);
    await this.peerSetCapabilityValue(c, v);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async peerNotifyCapabilityValue(c: string, v: any) {
    this.logger.logD(`peerNotifyCapabilityValue: ${c} = ${v}`);
    await this.setCapabilityValue(c, v);
  }
}

export = Link;
