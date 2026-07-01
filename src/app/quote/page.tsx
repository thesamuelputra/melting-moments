import { permanentRedirect } from 'next/navigation';

export default function Quote() {
  // 308 so search engines consolidate /quote's link equity into /contact
  permanentRedirect('/contact');
}
