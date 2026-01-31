Bridgekeeper provides Clone, Link and Shield virtual device drivers.
Each such virtual device

* Is paired with a user-selected peer device.
* Assumes the class and system capabilities of its peer.
* Remembers its peer to bridge the flow of capability values.
* Copies the values from its peer when first added.

Clone

* Behaves as a virtual device just like its peer but detached from it.

Link

* Allows capability values to flow freely to and from its peer.
* May appear in a different zone than its peer.
* Allows a door sensor between two zones to trigger activity in each.

Shield

* Shields its peer from cooperating automation.
* Allows values to flow to its peer only when the shield is off.
* Copies values from its peer when the shield is toggled.
* Provides shielding mechanism but not shielding policy.

Shielding policy is supported by

* Listening for peer value changes.
* Publishing capabilities that have drifted.
* Triggering policy flows on capability drift.

Shield example

Manually override Light automation by physical interaction with its onoff switch.
Rewrite automation such as this

* When Light's zone is active/inactive turn on/off Light

as

* When Light's zone is active/inactive turn on/off Light Shield
* When Light Shield onoff drift is detected, toggle shield on or off.

where Light is Light Shield's peer.
