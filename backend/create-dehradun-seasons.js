const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Season windows for Dehradun, Uttarakhand
const seasonWindows = [
  {
    id: 'sw-neem-dehradun',
    species: 'Neem',
    startMonth: 1,
    endMonth: 12, // Year-round
    region: 'Dehradun, Uttarakhand'
  },
  {
    id: 'sw-ashwagandha-dehradun',
    species: 'Ashwagandha',
    startMonth: 10,
    endMonth: 3, // Oct-Mar
    region: 'Dehradun, Uttarakhand'
  },
  {
    id: 'sw-tulsi-dehradun',
    species: 'Tulsi',
    startMonth: 1,
    endMonth: 12, // Year-round
    region: 'Dehradun, Uttarakhand'
  },
  {
    id: 'sw-brahmi-dehradun',
    species: 'Brahmi',
    startMonth: 1,
    endMonth: 12, // Year-round
    region: 'Dehradun, Uttarakhand'
  }
];

async function createSeasonWindows() {
  try {
    console.log('Creating season windows for Dehradun, Uttarakhand...\n');

    // Load connection profile
    const ccpPath = path.resolve(__dirname, '..', 'network', 'organizations', 'peerOrganizations', 'farmerscoop.herbaltrace.com', 'connection-farmerscoop.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create wallet
    const walletPath = path.join(__dirname, '..', 'network', 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if admin identity exists
    const identity = await wallet.get('admin-FarmersCoop');
    if (!identity) {
      console.log('❌ Admin identity not found in wallet');
      return;
    }

    // Connect to gateway
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin-FarmersCoop',
      discovery: { enabled: false, asLocalhost: true }
    });

    // Get network and contract
    const network = await gateway.getNetwork('herbaltrace-channel');
    const contract = network.getContract('herbaltrace');

    // Create each season window
    for (const window of seasonWindows) {
      try {
        console.log(`Creating season window for ${window.species} (months ${window.startMonth}-${window.endMonth})...`);
        
        const windowData = {
          id: window.id,
          species: window.species,
          startMonth: window.startMonth,
          endMonth: window.endMonth,
          region: window.region,
          active: true,
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await contract.submitTransaction('CreateSeasonWindow', JSON.stringify(windowData));
        console.log(`✅ Created season window: ${window.id}\n`);
        
        // Wait 2 seconds between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️  Season window ${window.id} already exists, skipping\n`);
        } else {
          console.error(`❌ Error creating ${window.id}:`, error.message, '\n');
        }
      }
    }

    await gateway.disconnect();
    console.log('✅ Dehradun season windows setup complete!');

  } catch (error) {
    console.error('❌ Failed to create season windows:', error);
    process.exit(1);
  }
}

createSeasonWindows();
