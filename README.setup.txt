sudo dnf install nodejs

mkdir homey
cd homey

npm install homey

npx homey app create

	? What is your app's name? Bridgekeeper
	? What is your app's description? Virtual devices to support policies for traffic over a bridge to a peer
	? What is your app's unique ID? com.github.rtyle.bridgekeeper
	? What platforms will your app support? Homey Pro
	? What is your app's category? tools
	? Use TypeScript? Yes
	? Use ESLint? Yes
	? Use GitHub workflows to validate, update version, and publish your app? Yes
	? Use standard license for Homey Apps (GPL3)? Yes
	? Seems good? Yes
	✓ Logging in...
	To log in with your Athom Account, please visit https://cli.athom.com?port=42387&clientId=64691b4358336640a5ecee5c
	? Paste the code: abd5fa093d15dfb5ef14d5f8a91fea8677ab707b
	✓ You are now logged in as Ross Tyler <rossetyler@gmail.com>
	✓ Installing dev dependencies: typescript
	✓ Installation complete
	✓ Installing dev dependencies: eslint@^7.32.0, eslint-config-athom
	✓ Installation complete
	✓ Added GitHub Workflows: homey-app-publish.yml, homey-app-validate.yml, homey-app-version.yml.
	Make sure to add the HOMEY_PAT secret to your GitHub repository, the personal access token can be found at https://tools.developer.homey.app/me.
	✓ Installing dev dependencies: @types/homey@npm:homey-apps-sdk-v3-types, @types/node, @tsconfig/node16
	✓ Installation complete
	✓ App created in `/net/nas/homes/ross/chux/homey-bridgekeeper/com.github.rtyle.homey-bridgekeeper`

	Learn more about Homey app development at: https://apps.developer.homey.app

mv com.github.rtyle.bridgekeeper bridgekeeper
cd bridgekeeper

git init
git add .
git commit -m 'homey app create'

#! create empty repository git@github.com:rtyle/homey-bridgekeeper.git

git remote add origin git@github.com:rtyle/homey-bridgekeeper.git
git push -u origin master

https://tools.developer.homey.app/me
	copy Personal Access Token
github.com:/rtyle/homey-bridgekeeper Settings > Secrets and variables > Actions > New repository secret
	Name:	HOMEY_PAT
	Secret:	<paste>
	Add secret

code .
	File > Preferences > Extensions
		ESLint
		Homey

	# this works ...

		npx homey app validate

	# ... but github workflow homey-app-validate does not
	
		https://github.com/rtyle/homey-bridgekeeper/actions/workflows/homey-app-validate.yml
			... > Disable workflow

	npm run build

npm install homey-api

# development on homey cloud requires running homey services locally in a docker container

	sudo dnf install docker
	sudo usermod -aG docker $USER
	newgrp docker	# or logout & login
	sudo systemctl start docker

npx homey app run

sudo dnf install nodejs

npx homey app run --remote

	# -r, --remote              Upload the app to Homey Pro and run remotely,
				    instead of a Docker container on this machine.

# running in a docker container will fail
	FetchError: request to https://10-0-0-2.homey.homeylocal.com/api/manager/devices/device failed, reason: getaddrinfo EAI_AGAIN 10-0-0-2.homey.homeylocal.com
# the same happens in a docker shell ...
	docker run --rm -it alpine sh
		/ # nslookup 10-0-0-1.homey.homeylocal.com
		Server:		10.0.0.1
		Address:	10.0.0.1:53

		Non-authoritative answer:
		Name:	10-0-0-2.homey.homeylocal.com
		Address: 10.0.0.2

		** server can't find 10-0-0-2.homey.homeylocal.com: SERVFAIL
# ... unless we use a DNS server that is not as security conscious as ours (e.g. cloudflare)
	docker run --rm -it --dns=1.1.1.1 alpine sh
		/ # nslookup 10-0-0-2.homey.homeylocal.com
		Server:		1.1.1.1
		Address:	1.1.1.1:53

		Non-authoritative answer:
		Name:	10-0-0-2.homey.homeylocal.com
		Address: 10.0.0.2

		Non-authoritative answer:
# unfortunately, CLI way to pass the docker --dns=1.1.1.1 option through
# there are system-wide ways to configure docker but
# using --remote is fine

# local web UI
	https://my.homey.app/homeys/<homey>/settings/system/family
		Owner ... Edit Local User
			Username: <username>
			Password: <password>

	https://10-0-0-2.homey.homeylocal.com/
	https://10.0.0.2/
