const { randomBytes } = require('crypto')
const Ceramic = require('@ceramicnetwork/http-client').default
const { IDX } = require('@ceramicstudio/idx')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const { fromString, toString } = require('uint8arrays')

function getSeed() {
  let seed
  if (process.env.SEED) {
    seed = fromString(process.env.SEED, 'base16')
    console.log('Using provided seed')
  } else {
    seed = new Uint8Array(randomBytes(32))
    console.log(`Created seed: ${toString(seed, 'base16')}`)
  }
  return seed
}

async function getCeramic() {
  const ceramic = new Ceramic('http://15.207.19.30:7007')
  await ceramic.setDIDProvider(new Ed25519Provider(getSeed()))
  return ceramic
}

const KEY = 'kjzl6cwe1jw14b0jmzq9c9t8axhk0dxi6umlf8honazfgs8jyiesb6hk4g3z16f'

async function uploadSecret(idx, payload) {
  const jwe = await idx.did.createJWE(payload, [idx.did.id])
  await idx.set(KEY, jwe)
}

async function downloadSecret(idx) {
  const jwe = await idx.get(KEY)
  return jwe ? await idx.did.decryptJWE(jwe) : null
}

async function run() {
  const ceramic = await getCeramic()
  const idx = new IDX({ ceramic })
  console.log(`Connected with DID: ${idx.id}`)

  const docID= await idx.set('basicProfile', {
    name:'',
    image:{original: {
      src: "ipfs://bafy...",
      mimeType: "image/png",
      width: 500,
      height: 200
    }},
    description:'This is my cool description.',
    emailId:'',
    gender:'',
    birthDate:'1000-01-01',
    address:''
    })

    console.log('user register',docID);
    const userProfile = await idx.get('basicProfile');

     console.log("Ur profile",userProfile);
}

run().catch(console.error)
