import mongoose from 'mongoose';
import dns from 'dns';

// Optimize DNS resolution for Node.js environments
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Safe, idempotent provisioning of core demo accounts when MongoDB connects.
 * Will NEVER overwrite existing users or reset existing passwords.
 */
async function ensureDemoAccountsProvisioned() {
  try {
    const User = (await import('../models/User.js')).default;
    const { store } = await import('../data/store.js');

    for (const demoUser of store.users) {
      const exists = await User.findOne({ email: demoUser.email.toLowerCase() });
      if (!exists) {
        await User.create({
          name: demoUser.name,
          email: demoUser.email.toLowerCase(),
          password: demoUser.password, // Pre-hashed bcrypt string (User pre-save checks !startsWith('$2'))
          role: demoUser.role,
          specialty: demoUser.specialty || 'General Medicine',
          hospital: demoUser.hospital || 'Metropolitan General Hospital',
          city: demoUser.city || 'Pune',
          area: demoUser.area || 'Baner',
          experience: demoUser.experience || 10,
          bloodType: demoUser.bloodType || 'O+',
          allergies: demoUser.allergies || [],
          emergencyContact: demoUser.emergencyContact || ''
        });
        console.log(`[MongoDB] Safely provisioned demo account: ${demoUser.name} (${demoUser.email})`);
      }
    }
  } catch (err) {
    console.warn('[MongoDB] Demo provisioning check notice:', err.message);
  }
}

/**
 * MongoDB / Mongoose Connection Handler
 * Connects to MongoDB when MONGODB_URI is provided, with clean failover and DNS SRV resilience.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[MongoDB] MONGODB_URI not defined. Operating with verified in-memory store.');
    return null;
  }

  const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`[MongoDB] Connecting to: ${maskedUri}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`[MongoDB] Database Connected: ${conn.connection.host}/${conn.connection.name}`);
    
    // Safely ensure demo accounts exist in database without overwriting
    await ensureDemoAccountsProvisioned();
    return conn;
  } catch (error) {
    // If SRV DNS failure occurred, try with public DNS resolvers (8.8.8.8, 1.1.1.1)
    if (uri.startsWith('mongodb+srv://') && (error.message.includes('querySrv') || error.message.includes('ENOTFOUND'))) {
      console.warn('[MongoDB] SRV DNS resolution failed with system resolver. Retrying with Google/Cloudflare DNS (8.8.8.8, 1.1.1.1)...');
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 10000
        });
        console.log(`[MongoDB] Database Connected via Public DNS: ${conn.connection.host}/${conn.connection.name}`);
        await ensureDemoAccountsProvisioned();
        return conn;
      } catch (retryError) {
        console.warn(`[MongoDB] Atlas connection retry failed: ${retryError.message}`);
      }
    }

    console.warn(`[MongoDB] Database connection unavailable (${error.message}). Operating with verified in-memory store.`);
    return null;
  }
};
