import Bridge from '../../lib/bridge/driver';
import Device from './device';

enum Flow {
  onoffOn = 'shield_onoff_on',
  onoffOff = 'shield_onoff_off',
  onoffToggle = 'shield_onoff_toggle',
  drift = 'shield_drift',
}

class Shield extends Bridge {

  private async commonCapabilityAutocomplete(query: string, device: Device) {
    const value = device.commonCapabilities
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
        return this.commonCapabilityAutocomplete(query, args.device as Device);
      })
      .registerRunListener(async (args, state) => {
        const match = args.capability.id === state.capability;
        if (match) {
          this.logger.logD(`${args.device.getName()}: trigger ${Flow.drift} runListener: ${args.capability.id}`);
        }
        return match;
      });

    // condition
    this.homey.flow
      .getConditionCard(Flow.drift)
      .registerArgumentAutocompleteListener('capability', async (query, args) => {
        return this.commonCapabilityAutocomplete(query, args.device as Device);
      })
      .registerRunListener(async (args, state) => {
        const device = args.device as Device;
        const value = (device.getCapabilityValue(Device.Capability.drift) || '')
          .split(', ')
          .filter((s: string) => s)
          .includes(args.capability.id);
        this.logger.logD(`${device.getName()}: condition ${Flow.drift} runListener: ${args.capability.id} = ${value}`);
        return value;
      });

    // actions
    const actions: Array<[Flow, boolean]> = [
      [Flow.onoffOn, true],
      [Flow.onoffOff, false],
    ];
    actions.forEach(([flow, value]) => {
      this.homey.flow.getActionCard(flow)
        .registerRunListener(async (args) => {
          const device = args.device as Device;
          this.logger.logD(`${device.getName()}: action ${flow} runListener`);
          await device.setShieldOnoffValue(value);
        });
    });
    this.homey.flow.getActionCard(Flow.onoffToggle)
      .registerRunListener(async (args) => {
        const device = args.device as Device;
        const value = !device.getCapabilityValue(Device.Capability.onoff);
        this.logger.logD(`${device.getName()}: action ${Flow.onoffToggle} runListener: ${value}`);
        await device.setShieldOnoffValue(value);
      });
  }
}

export = Shield;
