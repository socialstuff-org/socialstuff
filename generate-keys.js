const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const keysDirectory = path.join(__dirname, 'keys');
const rsaPrivKeyPath = path.join(keysDirectory, 'priv.pem');

function newKeyPair(mod) {
  return new Promise((res, rej) => {
    crypto.generateKeyPair('rsa', {
      modulusLength:      mod,
      publicKeyEncoding:  {
        type:   'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type:   'pkcs8',
        format: 'pem',
      },
    }, (err, pub, priv) => {
      if (err) {
        rej(err);
      } else {
        res({priv: crypto.createPrivateKey(priv), pub: crypto.createPublicKey(pub)});
      }
    });
  });
}

(async() => {
  try {
    const stat = await fs.promises.stat(keysDirectory);
    if (!stat.isDirectory()) {
      console.error(`Expected '${keysDirectory}' to be a directory!`);
      process.exit(1);
    }
  } catch {
    await fs.promises.mkdir(keysDirectory);
  }
  try {
    const stat = await fs.promises.stat(rsaPrivKeyPath);
    if (!stat.isDirectory()) {
      console.error(`Expected '${keysDirectory}' to be a directory!`);
      process.exit(1);
    }
  } catch {
    const rsaKeys = await newKeyPair(4096);
    await fs.promises.writeFile(rsaPrivKeyPath, rsaKeys.priv.export({ format: 'pem', type: 'pkcs1' }));
  }
  console.log('done with key initialization');
  
})();