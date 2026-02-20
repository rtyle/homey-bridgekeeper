When Light's zone is active/inactive then turn on/off Light.

If you have automation like this then Bridgekeeper is for you. Such automation works great until you need to override it. The natural thing to do is to go to the Light switch and turn it back off/on. Wouldn't it be nice if, once you did that, the automation would be stopped? Then a Bridgekeeper Shield is for you.

Wouldn't it be nice if, when a door in this zone opens to another, activity is triggered in both zones? Then a Bridgekeeper Link is for you.

Wouldn't it be nice to test on a virtual copy of Light so as not to affect those that currently depend on it? Then a Bridgekeeper Clone is for you. 

Bridgekeeper provides Clone, Link and Shield virtual device drivers. Each such virtual device

* Is paired with a user-selected peer device.
* Assumes the class, system capabilities and flow cards of its peer.
* Remembers its peer to bridge the flow of capability values.
* Copies the values from its peer when it is first added.

Clone

* Behaves as a virtual device just like its peer but detached from it.

Link

* Allows capability values to flow freely to and from its peer.
* May appear in a different zone than its peer.
* Acts as an alias to its peer.

Shield

* Shields its peer from cooperating automation.
* Allows values to flow to its peer only when the shield is off.
* Copies values from its peer when the shield is toggled on or off.
* Provides shielding mechanism but not shielding policy.

Shielding policy is supported by

* Listening for peer value changes.
* Publishing capabilities that have drifted apart.
* Triggering shielding policy flows on capability drift.

Shielding Light from automation is simple:

* Add a Bridgekeeper Shield device.
* Select Light as its peer, filtering by its zone and device class.
* Light Shield will be created in Light's image with all its system capabilities and flow cards.
* Rewrite the automation to target Light Shield instead of Light and add shielding policy flow(s) such as
* When there is Light Shield onoff drift then toggle shield on or off.

A Bridgekeeper Shield does not presume to know the best shielding policy for your situation.
