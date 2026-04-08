import dotenv from 'dotenv';
import { B2BDiscoveryPipeline } from './pipelines/b2b-discovery';

dotenv.config();

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY is missing in environment.');
    process.exit(1);
  }

  const discovery = new B2BDiscoveryPipeline(apiKey);

  try {
    const icp = "SaaS companies with >$1M ARR using outdated AI governance processes";
    const region = "UAE & India";
    
    const leads = await discovery.discoverLeads(icp, region);
    
    console.log('💎 Sovereign Growth Engine - Discovered Leads:');
    console.table(leads);
  } catch (error) {
    console.error('💥 Pipeline Failed:', error);
  }
}

main();
