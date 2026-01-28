'use strict';

import https from 'https';

function jsonParse(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'homey-capabilities-scraper',
        Accept: 'application/vnd.github.v3+json',
      },
    };

    https.get(url, options, (res) => {
      let data = '';

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function getCapabilities() {
  const source_ = 'https://api.github.com/repos/athombv/node-homey-lib/contents/assets/capability/capabilities';
  return {
    source: source_,
    timestamp: new Date().toISOString(),
    capabilities: (await jsonParse(source_))
      .filter((file) => file.name.endsWith('.json'))
      .map((file) => file.name.replace('.json', ''))
      .sort(),
  };
}

async function main() {
  const { source, timestamp, capabilities } = await getCapabilities();
  process.stdout.write(`// automatically generated on ${timestamp} from ${source}

export default new Set([
${capabilities.map((capability) => `  '${capability}'`).join(',\n')},
]);
`);
}

await main();
