import db from '@/lib/db';

export type BusinessInfo = {
  name: string;
  owner: string;
  address: string;
  phone: string;
  email: string;
  website: string;
};

const defaults: BusinessInfo = {
  name: 'Melting Moments Catering',
  owner: 'Paul Silletta',
  address: '614 Grenville Ave, Esquimalt, BC V9A 6L2',
  phone: '250-385-2462',
  email: 'info@meltingmoments.ca',
  website: 'https://meltingmoments.ca',
};

export async function getBusinessInfo(): Promise<BusinessInfo> {
  try {
    const settings = await db.businessSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    
    return {
      name: map.name || defaults.name,
      owner: map.owner || defaults.owner,
      address: map.address || defaults.address,
      phone: map.phone || defaults.phone,
      email: map.email || defaults.email,
      website: map.website || defaults.website,
    };
  } catch {
    return defaults;
  }
}
