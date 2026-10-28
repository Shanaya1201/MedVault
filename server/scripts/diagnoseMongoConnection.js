import dns from 'dns';
import mongoose from 'mongoose';

/**
 * MongoDB Atlas Connection Diagnostic Tool
 * Safely analyzes URI format, DNS SRV resolution, and cluster connectivity.
 * NEVER prints credentials.
 */
async function diagnose() {
  const uri = process.env.TARGET_MONGODB_URI || process.env.MONGODB_URI;

  console.log('===========================================================');
  console.log('  MONGODB ATLAS CONNECTION DIAGNOSTIC UTILITY');
  console.log('===========================================================\n');

  if (!uri) {
    console.log('[Status] No TARGET_MONGODB_URI or MONGODB_URI found in environment.');
    console.log('To diagnose your connection string:');
    console.log('  $env:TARGET_MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medvault"');
    console.log('  node server/scripts/diagnoseMongoConnection.js\n');
    process.exit(0);
  }

  // Safe URI mask
  const masked = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`[Target URI]: ${masked}`);

  // 1. Check Protocol
  const isSrv = uri.startsWith('mongodb+srv://');
  const isStandard = uri.startsWith('mongodb://');
  if (!isSrv && !isStandard) {
    console.error('❌ Invalid URI protocol: Must start with "mongodb+srv://" or "mongodb://"');
    return;
  }
  console.log(`✓ Protocol: ${isSrv ? 'mongodb+srv (DNS Seedlist)' : 'mongodb (Standard)'}`);

  // 2. Parse Host and Database
  try {
    const afterProtocol = uri.split('://')[1];
    const [authAndHost, queryString] = afterProtocol.split('?');
    const [auth, hostAndDb] = authAndHost.includes('@') ? authAndHost.split('@') : ['', authAndHost];
    
    // Check Auth
    if (auth) {
      const [user, pass] = auth.split(':');
      console.log(`✓ Username provided: ${user ? user.substring(0, 2) + '***' : 'MISSING'}`);
      console.log(`✓ Password provided: ${pass ? '*** (' + pass.length + ' chars)' : 'MISSING'}`);
      
      // Check for unencoded special characters in password
      const rawPass = decodeURIComponent(pass);
      if (pass !== encodeURIComponent(rawPass) && /[#$&+,/:;=?@]/.test(rawPass)) {
        console.warn('⚠️ Warning: Password contains special characters that might require URL-encoding:');
        console.warn('   Replace @ with %40, : with %3A, # with %23, etc.');
      }
    } else {
      console.warn('⚠️ No credentials in connection string.');
    }

    // Check Host and DB
    const firstSlash = hostAndDb.indexOf('/');
    let host = firstSlash !== -1 ? hostAndDb.substring(0, firstSlash) : hostAndDb;
    let dbName = firstSlash !== -1 ? hostAndDb.substring(firstSlash + 1) : '';

    console.log(`✓ Target Host: ${host}`);
    console.log(`✓ Target Database: ${dbName || '(default: test)'}`);

    if (isSrv) {
      if (host.includes(':')) {
        console.error('❌ Error: SRV URI (mongodb+srv://) cannot specify a port number (e.g. :27017). Remove the port.');
      }

      // 3. DNS SRV Lookup Check
      const srvRecord = `_mongodb._tcp.${host}`;
      console.log(`\n[DNS] Performing SRV lookup for: ${srvRecord}...`);

      // Try system resolver first
      try {
        const addresses = await dns.promises.resolveSrv(srvRecord);
        console.log(`✓ [System DNS] SRV resolution successful! Found ${addresses.length} host nodes:`);
        addresses.forEach(a => console.log(`   - ${a.name}:${a.port}`));
      } catch (dnsErr) {
        console.error(`❌ [System DNS] Failed to resolve SRV record: ${dnsErr.code || dnsErr.message}`);

        // Try Google / Cloudflare public DNS fallback
        console.log('[DNS] Testing resolution using public DNS (8.8.8.8 / 1.1.1.1)...');
        try {
          const resolver = new dns.promises.Resolver();
          resolver.setServers(['8.8.8.8', '1.1.1.1']);
          const addresses = await resolver.resolveSrv(srvRecord);
          console.log(`✓ [Public DNS] Successful! Found ${addresses.length} nodes via 8.8.8.8.`);
          console.log('💡 DIAGNOSIS: Your local network/ISP DNS is failing on SRV records.');
          console.log('   Enabling public DNS servers in Node.js solves this.');
        } catch (pubDnsErr) {
          console.error(`❌ [Public DNS] Also failed: ${pubDnsErr.code || pubDnsErr.message}`);
          console.log('💡 DIAGNOSIS: The cluster hostname does not exist, is misspelled, or the Atlas cluster has been paused/terminated.');
        }
      }
    }

    // 4. Test Actual Mongoose Connection
    console.log('\n[Mongoose] Attempting connection (timeout: 6000ms)...');
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
      console.log(`✓ [CONNECTED] Successfully connected to database: ${mongoose.connection.name}`);
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`✓ Target contains ${collections.length} collections:`, collections.map(c => c.name));
      await mongoose.disconnect();
    } catch (connErr) {
      console.error(`❌ [Mongoose Connection Failed]: ${connErr.message}`);
      if (connErr.message.includes('IP that isn\'t whitelisted') || connErr.message.includes('Could not connect to any servers')) {
        console.log('💡 Atlas Network Access: Make sure your IP address (and 0.0.0.0/0 for Render) is added in Atlas Network Access IP Access List.');
      } else if (connErr.message.includes('bad auth') || connErr.message.includes('Authentication failed')) {
        console.log('💡 Atlas Credentials: Username or password does not match Atlas Database Access users.');
      }
    }

  } catch (err) {
    console.error('Error parsing URI:', err.message);
  }
}

diagnose();

