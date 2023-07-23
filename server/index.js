
const express = require('express')
const bodyParse = require('body-parser')
const ethers = require('ethers')
const cors = require('cors')
const { getDatabase } = require('firebase-admin/database')
const serviceAccount = require('./bridge-88f1a-firebase-adminsdk-9gwlp-a9c8fb7010')

const BRIDGE_ABI = require('../artifacts/contracts/Bridge.sol/Bridge.json')
//const BRIDGE_TOKEN_ABI = require('../artifacts/contracts/BridgeToken.sol/BridgeToken.json')

var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bridge-463cb-default-rtdb.firebaseio.com"
});

const db = getDatabase()


const json = bodyParse.json
const app = express();
const router = express.Router()
const fujiProvider = new ethers.providers.JsonRpcProvider(`https://api.avax-test.network/ext/bc/C/rpc`)
const telosProvider = new ethers.providers.JsonRpcProvider(`https://testnet.telos.net/evm`)

const fujiWss = new ethers.providers.JsonRpcProvider(`wss://api.avax-test.network/ext/bc/C/rpc`)
const telosWss = new ethers.providers.JsonRpcProvider(`wss://testnet.telos.net/evm`)

app.use(json());
app.use(router);
const PORT = process.env.PORT || 5000
var server_host = process.env.YOUR_HOST || '0.0.0.0';
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5000'
  ],
};

const fujiRef = db.ref('/sendFuji').push();
const telosWssRef = db.ref('/sendTelos').push();

// Define the collection names you want to create
const COLLECTION_NAMES = ['sendFuji', 'sendTelos'];

// Function to create collections/nodes if they don't exist
async function createCollectionsIfNotExist(collectionNames) {
  try {
    for (const collectionName of collectionNames) {
      const collectionRef = db.ref(collectionName);
      const snapshot = await collectionRef.once('value');
      if (!snapshot.exists()) {
        await collectionRef.set(null); // You can set some initial data here if needed
        console.log(`Collection "${collectionName}" created successfully.`);
      } else {
        console.log(`Collection "${collectionName}" already exists.`);
      }
    }
  } catch (error) {
    console.error('Error creating collections:', error);
  }
}

// Call the function to create collections if they don't exist
createCollectionsIfNotExist(COLLECTION_NAMES);


const FUJI_BRIGE_CONTRACT = new ethers.Contract(
    '0x3b321bDd22236Ab7Ab96f4D8C93fAC822A98E77D',
    BRIDGE_ABI.abi,
    fujiProvider
    )

    const TELOS_BRIGE_CONTRACT = new ethers.Contract(
        '0x7321FC572d9827D3BBcf8C1512B6159562E32bdB',
        BRIDGE_ABI.abi,
        telosProvider
    )
    
    const FUJI_BRIGE_CONTRACT_WSS = new ethers.Contract(
        '0x3b321bDd22236Ab7Ab96f4D8C93fAC822A98E77D',
        BRIDGE_ABI.abi,
        fujiWss
        )
    
        const TELOS_BRIGE_CONTRACT_WSS = new ethers.Contract(
            '0x7321FC572d9827D3BBcf8C1512B6159562E32bdB',
            BRIDGE_ABI.abi,
            telosWss
        )        

app.listen(PORT, server_host, () => {
    console.log(`server is listening on port: ${PORT}`)
})

router.get('/bridge/fujiWss', cors(corsOptions), async (req, res) => {
    try {
        const result = await FUJI_BRIGE_CONTRACT.brigeStatus()
        return res.json(result)
    } catch (error) {
        return res.json(error.message)
    }
})

router.get('/bridge/telosWss', cors(corsOptions), async (req, res) => {
    try {
        const result = await TELOS_BRIGE_CONTRACT.brigeStatus()
        return res.json(result)
    } catch (error) {
        return res.json(error.message)
    }
})

const telosWssSent = async () => {
    TELOS_BRIGE_CONTRACT_WSS.on('TokenSent', (_to, _token, _amount) => {
        telosWssRef.set({
            to: _to,
            token: _token,
            amount: _amount,
            status: 'pending'
        })
    })
}

const fujiSent = async () => {
    FUJI_BRIGE_CONTRACT_WSS.on('TokenSent', (_to, _token, _amount) => {
        fujiRef.set({
            to: _to,
            token: _token,
            amount: _amount,
            status: 'pending'
        })
    })
}

telosWssRef.on('value', (snapshot) => {
        snapshot.forEach(async (data) => {
        try {
          const bridgeData = data.val();
          bridgeData.data.map(async (_data) => {
            FUJI_BRIGE_CONTRACT.ownerBurn(_data.to, _data.amount)
            TELOS_BRIGE_CONTRACT.ownerMint(_data.to, _data.amount);
          })          
        } catch (error) {
          console.log(error);
        }
      })
    })

    fujiRef.on('value', (snapshot) => {
        snapshot.forEach(async (data) => {
        try {
          const bridgeData = data.val();
          bridgeData.data.map(async (_data) => {
            TELOS_BRIGE_CONTRACT.ownerBurn(_data.to, _data.amount)
            FUJI_BRIGE_CONTRACT.ownerMint(_data.to, _data.amount)
          })          
        } catch (error) {
          console.log(error);
        }
      })
    })    

fujiWss.on('block', _ => {
    fujiSent()
})

telosWss.on('block', _ => {
    telosWssSent()
})
