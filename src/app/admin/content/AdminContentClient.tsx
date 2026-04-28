'use client';

import { useState, useTransition } from 'react';
import { saveSiteContent } from './actions';

/*
 * Content registry — every editable text on the site is registered here.
 * Each page has sections, and each section has fields.
 * The `key` maps directly to a businessSettings key in Convex.
 * The `hint` tells the admin *exactly* where this text appears on the live site.
 */
const CONTENT_SCHEMA = [
  {
    page: 'Homepage',
    slug: '/',
    sections: [
      {
        section: 'Hero',
        hint: 'Full-screen hero at the top of the site',
        fields: [
          { key: 'home_hero_title', label: 'Title', hint: 'Main headline (e.g. MELTING MOMENTS)', type: 'text' as const, default: 'MELTING\nMOMENTS' },
          { key: 'home_hero_subtitle', label: 'Subtitle', hint: 'Line beneath the title', type: 'text' as const, default: 'Bespoke Catering · Victoria BC' },
        ],
      },
      {
        section: 'Experience Section',
        hint: 'Oval image area — "02 — Experience"',
        fields: [
          { key: 'home_experience_index', label: 'Section Index', hint: 'Small label (e.g. 02 · Experience)', type: 'text' as const, default: '02 · Experience' },
          { key: 'home_experience_heading', label: 'Heading', hint: 'Serif paragraph below the label', type: 'textarea' as const, default: 'From the very first contact, you will enjoy the professionalism that has been achieved through 16 years of culinary experience.' },
        ],
      },
      {
        section: 'CTA Section',
        hint: 'Dark block with circular image — "03 — Celebration"',
        fields: [
          { key: 'home_cta_index', label: 'Section Index', hint: 'Small label (e.g. 03 · Celebration)', type: 'text' as const, default: '03 · Celebration' },
          { key: 'home_cta_heading', label: 'Heading', hint: 'Main CTA heading', type: 'textarea' as const, default: 'Whether a visionary wedding, an elite corporate gala, or a private gathering, we leave a lasting impression.' },
          { key: 'home_cta_body', label: 'Body Text', hint: 'Short body below heading', type: 'text' as const, default: 'Expect the absolute best.' },
          { key: 'home_cta_button', label: 'Button Text', hint: 'CTA button label', type: 'text' as const, default: 'Book An Event' },
        ],
      },
    ],
  },
  {
    page: 'About',
    slug: '/about',
    sections: [
      {
        section: 'Header',
        hint: 'Top of the About page — "01 — The Studio"',
        fields: [
          { key: 'about_header_index', label: 'Section Index', hint: 'Small label (e.g. 01 · The Studio)', type: 'text' as const, default: '01 · The Studio' },
          { key: 'about_header_title', label: 'Title', hint: 'Large display title (e.g. OBSESSIVE ARTISTRY)', type: 'text' as const, default: 'OBSESSIVE\nARTISTRY' },
          { key: 'about_header_tagline', label: 'Tagline', hint: 'Serif tagline to the right of the image', type: 'text' as const, default: 'We believe that dining is the ultimate sensory performance.' },
          { key: 'about_header_body', label: 'Body Text', hint: 'Paragraph below the tagline', type: 'textarea' as const, default: 'Founded on the principle of unyielding quality in Victoria BC, Melting Moments rejects mass-production in favor of tailored, site-specific culinary installations.' },
        ],
      },
      {
        section: 'Philosophy Section',
        hint: 'Dark block — "02 — Our Philosophy"',
        fields: [
          { key: 'about_philosophy_index', label: 'Section Index', hint: 'Small label', type: 'text' as const, default: '02 · Our Philosophy' },
          { key: 'about_philosophy_title', label: 'Title', hint: 'Large display title', type: 'text' as const, default: 'SOURCED FROM\nTHE EARTH' },
          { key: 'about_philosophy_tagline', label: 'Tagline', hint: 'Serif paragraph', type: 'text' as const, default: 'We partner exclusively with local Vancouver Island farms and independent purveyors.' },
          { key: 'about_philosophy_body', label: 'Body Text', hint: 'Paragraph below the tagline', type: 'textarea' as const, default: 'Our commitment extends beyond the kitchen. We believe the story of the food begins with the soil. By utilizing extreme seasonal restraints, our menus reflect the exact moment of your celebration.' },
        ],
      },
    ],
  },
  {
    page: 'Menus',
    slug: '/menus',
    sections: [
      {
        section: 'Header',
        hint: 'Top of the Menus page',
        fields: [
          { key: 'menus_header_index', label: 'Subtitle', hint: 'Small label above the title', type: 'text' as const, default: 'Explore Our Offerings' },
          { key: 'menus_header_title', label: 'Title', hint: 'Large display title (e.g. CATERING MENUS)', type: 'text' as const, default: 'CATERING\nMENUS' },
        ],
      },
      {
        section: 'Services Notice',
        hint: 'Footer disclaimer text at the bottom of all menus',
        fields: [
          { key: 'menus_disclaimer', label: 'Disclaimer Text', hint: 'Pricing, deposit & guest requirements', type: 'textarea' as const, default: 'These catering menus are just a sample of what you can expect. We can customize any menu to suit your needs. All 5% taxes and 15% gratuity are extra. A deposit of 25% is required at time of booking. Balance due 7 days prior to function. Guaranteed number of guests required 2 weeks in advance. Per person pricing based on a minimum of 75 guests. Prices may change without notice.' },
        ],
      },
    ],
  },
  {
    page: 'Weddings',
    slug: '/weddings',
    sections: [
      {
        section: 'Header',
        hint: 'Top of the Weddings page',
        fields: [
          { key: 'weddings_header_subtitle', label: 'Subtitle', hint: 'Small label above the title', type: 'text' as const, default: 'Information' },
          { key: 'weddings_header_title', label: 'Title', hint: 'Large display title', type: 'text' as const, default: 'Weddings' },
          { key: 'weddings_heading', label: 'Section Heading', hint: 'e.g. A Symphony of Taste', type: 'text' as const, default: 'A Symphony of Taste' },
          { key: 'weddings_body_1', label: 'Paragraph 1', hint: 'First paragraph of body text', type: 'textarea' as const, default: 'Your wedding day requires absolute perfection. Chef Paul brings 16 years of elite catering experience to curate a bespoke menu that tells your unique story.' },
          { key: 'weddings_body_2', label: 'Paragraph 2', hint: 'Second paragraph of body text', type: 'textarea' as const, default: 'From intimate ceremonies on Vancouver Island to grand receptions for 300+ guests, every detail is orchestrated with obsessive precision, from the first canapé through to the final dessert course.' },
          { key: 'weddings_cta_button', label: 'CTA Button Text', hint: 'Button label', type: 'text' as const, default: 'Start Planning' },
        ],
      },
      {
        section: 'Process Steps',
        hint: 'Dark "From Vision to Celebration" section',
        fields: [
          { key: 'weddings_process_heading', label: 'Section Heading', hint: 'e.g. From Vision to Celebration', type: 'text' as const, default: 'From Vision to Celebration' },
          { key: 'weddings_step1_title', label: 'Step 1 Title', hint: 'e.g. Consultation', type: 'text' as const, default: 'Consultation' },
          { key: 'weddings_step1_desc', label: 'Step 1 Description', hint: 'Body text for step 1', type: 'textarea' as const, default: 'We discuss your vision, dietary needs, venue logistics, and budget to craft a personalized proposal.' },
          { key: 'weddings_step2_title', label: 'Step 2 Title', hint: 'e.g. Private Tasting', type: 'text' as const, default: 'Private Tasting' },
          { key: 'weddings_step2_desc', label: 'Step 2 Description', hint: 'Body text for step 2', type: 'textarea' as const, default: 'You and your partner experience the proposed menu firsthand with Chef Paul for final refinements.' },
          { key: 'weddings_step3_title', label: 'Step 3 Title', hint: 'e.g. Your Day', type: 'text' as const, default: 'Your Day' },
          { key: 'weddings_step3_desc', label: 'Step 3 Description', hint: 'Body text for step 3', type: 'textarea' as const, default: 'Our team arrives hours early for seamless setup. You focus on the celebration. We handle everything else.' },
        ],
      },
    ],
  },
  {
    page: 'Private Events',
    slug: '/private-events',
    sections: [
      {
        section: 'Header',
        hint: 'Top of the Private Events page',
        fields: [
          { key: 'events_header_subtitle', label: 'Subtitle', hint: 'Small label above the title', type: 'text' as const, default: 'Information' },
          { key: 'events_header_title', label: 'Title', hint: 'Large display title', type: 'text' as const, default: 'Private Events' },
          { key: 'events_heading', label: 'Section Heading', hint: 'e.g. Intimate Excellence', type: 'text' as const, default: 'Intimate Excellence' },
          { key: 'events_body_1', label: 'Paragraph 1', hint: 'First paragraph of body text', type: 'textarea' as const, default: 'From formal dinner parties to private yacht catering, we deliver discreet, Michelin-level service and unforgettable culinary experiences in the comfort of your own venue.' },
          { key: 'events_body_2', label: 'Paragraph 2', hint: 'Second paragraph of body text', type: 'textarea' as const, default: "Whether it's an anniversary celebration for 12 or a milestone birthday for 80, Chef Paul designs every course to reflect the personality and preferences of the host." },
          { key: 'events_cta_button', label: 'CTA Button Text', hint: 'Button label', type: 'text' as const, default: 'Plan Your Event' },
        ],
      },
      {
        section: 'Feature Cards',
        hint: 'Three card grid below the main content',
        fields: [
          { key: 'events_card1_title', label: 'Card 1 Title', hint: 'e.g. Your Venue, Our Craft', type: 'text' as const, default: 'Your Venue, Our Craft' },
          { key: 'events_card1_desc', label: 'Card 1 Description', hint: 'Body text for card 1', type: 'textarea' as const, default: 'We bring a full-service kitchen to any location: your home, a vineyard, a yacht, or a heritage venue.' },
          { key: 'events_card2_title', label: 'Card 2 Title', hint: 'e.g. Tailored Menus', type: 'text' as const, default: 'Tailored Menus' },
          { key: 'events_card2_desc', label: 'Card 2 Description', hint: 'Body text for card 2', type: 'textarea' as const, default: 'No templates. Every menu is designed from scratch after a personal consultation with Chef Paul.' },
          { key: 'events_card3_title', label: 'Card 3 Title', hint: 'e.g. Invisible Service', type: 'text' as const, default: 'Invisible Service' },
          { key: 'events_card3_desc', label: 'Card 3 Description', hint: 'Body text for card 3', type: 'textarea' as const, default: 'Our staff is trained to be attentive yet unobtrusive. Your guests experience the food, not the logistics.' },
        ],
      },
    ],
  },
  {
    page: 'Corporate',
    slug: '/corporate',
    sections: [
      {
        section: 'Header',
        hint: 'Top of the Corporate page',
        fields: [
          { key: 'corporate_header_index', label: 'Section Label', hint: 'Small label above the title', type: 'text' as const, default: 'Corporate Functions' },
          { key: 'corporate_header_title', label: 'Title', hint: 'Large display title (use \\n for line break)', type: 'text' as const, default: 'BOARDROOM\nTO BANQUET' },
          { key: 'corporate_body_1', label: 'Paragraph 1', hint: 'First body paragraph', type: 'textarea' as const, default: "You've got less than 24 hours to plan a continental breakfast or a lunch. It has to be good. It has to be quick. It has to be now. Why bother trying to get reservations somewhere, or trying to find something that will please everyone, when we can bring it all right to you?" },
          { key: 'corporate_body_2', label: 'Paragraph 2', hint: 'Second body paragraph', type: 'textarea' as const, default: "Whether it's that breakfast for 300 in your lobby or a formal boardroom luncheon for 20, a simple brown-bag lunch or a full china and crystal setting we've got it covered." },
        ],
      },
    ],
  },
];

type ContentField = {
  key: string;
  label: string;
  hint: string;
  type: 'text' | 'textarea';
  default: string;
};

export default function AdminContentClient({ initialContent }: { initialContent: Record<string, string> }) {
  const [content, setContent] = useState<Record<string, string>>(() => {
    // Pre-fill all keys with either stored value or default
    const map: Record<string, string> = { ...initialContent };
    for (const page of CONTENT_SCHEMA) {
      for (const section of page.sections) {
        for (const field of section.fields) {
          if (!(field.key in map)) {
            map[field.key] = field.default;
          }
        }
      }
    }
    return map;
  });

  const [activePage, setActivePage] = useState(CONTENT_SCHEMA[0].page);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  const updateField = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const [saveError, setSaveError] = useState('');

  const handleSave = () => {
    startTransition(async () => {
      // Only save content keys (from schema), not all businessSettings
      const contentKeys = CONTENT_SCHEMA.flatMap(p => p.sections.flatMap(s => s.fields.map(f => f.key)));
      const payload: Record<string, string> = {};
      for (const key of contentKeys) {
        payload[key] = content[key] ?? '';
      }

      const res = await saveSiteContent(payload);
      if (res.success) {
        setSaved(true);
        setDirty(false);
        setSaveError('');
        setTimeout(() => setSaved(false), 2500);
      } else {
        setSaveError('Failed to save content. Please try again.');
      }
    });
  };

  const activeSchema = CONTENT_SCHEMA.find(p => p.page === activePage)!;

  return (
    <div>
      {saveError && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem 1rem', background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.85rem', borderRadius: '6px' }}>
          {saveError}
        </div>
      )}
      {/* Page Tabs */}
      <div className="admin-tabs" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {CONTENT_SCHEMA.map(schema => (
          <button
            key={schema.page}
            className={`admin-tab ${activePage === schema.page ? 'admin-tab--active' : ''}`}
            onClick={() => setActivePage(schema.page)}
          >
            {schema.page}
          </button>
        ))}
      </div>

      {/* Page Context */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.25rem' }}>
            {activeSchema.page}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
              Editing <code style={{ background: 'rgba(0,0,0,0.04)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.7rem' }}>{activeSchema.slug}</code>
            </p>
            <a href={activeSchema.slug} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>View live →</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {dirty && <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 500 }}>Unsaved changes</span>}
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={isPending || !dirty}
            style={{ padding: '0.6rem 1.5rem' }}
          >
            {isPending ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeSchema.sections.map(section => (
        <div key={section.section} className="admin-section" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-section__header">
            <div>
              <h3>{section.section}</h3>
              <p style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.35)', marginTop: '0.15rem' }}>{section.hint}</p>
            </div>
          </div>
          <div className="admin-section__body">
            <div style={{ display: 'grid', gap: '1.25rem', opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
              {section.fields.map((field: ContentField) => (
                <div key={field.key}>
                  <label className="admin-modal__label" style={{ marginBottom: '0.4rem' }}>
                    {field.label}
                  </label>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.3)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {field.hint}
                  </p>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="admin-inline-input"
                      value={content[field.key] ?? field.default}
                      onChange={e => updateField(field.key, e.target.value)}
                      disabled={isPending}
                      rows={3}
                      style={{ resize: 'vertical', minHeight: '72px' }}
                    />
                  ) : (
                    <input
                      className="admin-inline-input"
                      value={content[field.key] ?? field.default}
                      onChange={e => updateField(field.key, e.target.value)}
                      disabled={isPending}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Sticky Save Bar */}
      {dirty && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 'var(--admin-sidebar-width, 240px)',
          right: 0,
          padding: '1rem 2rem',
          background: 'white',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 50,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
            You have unsaved changes
          </span>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={isPending}
            style={{ padding: '0.6rem 1.5rem' }}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {saved && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '0.75rem 1.25rem',
          background: '#059669',
          color: 'white',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 60,
          animation: 'adminFadeIn 0.2s ease',
        }}>
          ✓ Content saved and site updated
        </div>
      )}
    </div>
  );
}
