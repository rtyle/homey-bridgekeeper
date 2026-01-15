import Bridge from '../../lib/bridge/driver';
import Device from './device';

enum Flow {
  onoffOn = 'shield_onoff_on',
  onoffOff = 'shield_onoff_off',
  onoffToggle = 'shield_onoff_toggle',
  drift = 'shield_drift',
}

class Shield extends Bridge {

  private async peerCapabilityAutocomplete(query: string, device: Device) {
    const value = (await device._peerGetCapabilities())
      .filter((c: string) => c.toLowerCase().includes(query.toLowerCase()))
      .map((c: string) => ({ name: c, id: c }));
    this.logger.logV(`${device.getName()} peerCapabilityAutocomplete: query = ${query}, value = ${JSON.stringify(value)}`);
    return value;
  }

  override async onInit() {
    await super.onInit();

    // trigger
    this.homey.flow
      .getDeviceTriggerCard(Flow.drift)
      .registerArgumentAutocompleteListener('capability', async (query, args) => {
        return this.peerCapabilityAutocomplete(query, args.device as Device);
      })
      .registerRunListener(async (args, state) => {
        const match = args.capability.id === state.capability;
        this.logger.logD(`${args.device.getName()}: trigger shield_drift runListener: args ${args.capability.id} ${match ? '==' : '!='} state ${state.capability}`);
        return match;
      });

    // condition
    this.homey.flow
      .getConditionCard(Flow.drift)
      .registerArgumentAutocompleteListener('capability', async (query, args) => {
        return this.peerCapabilityAutocomplete(query, args.device as Device);
      })
      .registerRunListener(async (args, state) => {
        const device = args.device as Device;
        const value = device.getCapabilityValue(Device.Capability.drift)
          .split(', ')
          .filter((s: string) => s)
          .includes(args.capability.id);
        this.logger.logD(`${device.getName()}: condition shield_drift runListener: ${args.capability.id} drift? ${value}`);
        return value;
      });

    // actions
    const actions: Array<[Flow, boolean | null]> = [
      [Flow.onoffOn, true],
      [Flow.onoffOff, false],
      [Flow.onoffToggle, null],
    ];
    actions.forEach(([flow, value]) => {
      this.homey.flow.getActionCard(flow)
        .registerRunListener(async (args) => {
          const device = args.device as Device;
          const v = value === null ? !device.getCapabilityValue(Device.Capability.onoff) : value as boolean;
          this.logger.logD(`${device.getName()}: action shield_onoff runListener: ${flow} (${v})`);
          await device._setShieldOnoffValue(v);
        });
    });
  }
}

export = Shield;
