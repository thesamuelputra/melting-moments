'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { saveSiteContent } from './actions';
import { TextAreaField, TextField, useDirtyGuard, useToast } from '../_components';

/*
 * Content registry: every editable text on the site is registered here.
 * Each page has sections, and each section has fields.
 * The `key` maps directly to a businessSettings key in Convex.
 * The `hint` tells the admin *exactly* where this text appears on the live site.
 *
 * IMPORTANT: every `default` below is an exact copy of the hardcoded fallback
 * in the consuming public page (grep the key in src/app to verify). If a page
 * fallback changes, update it here too; the editor treats `default` as the
 * "built-in site copy" for the Reset control.
 */
const CONTENT_SCHEMA = [
  {
    page: 'Homepage',
    slug: '/',
    sections: [
      {
        section: 'CTA Section',
        hint: 'Dark call-to-action block near the bottom of the homepage',
        fields: [
          { key: 'home_cta_heading', label: 'Heading', hint: 'Main CTA heading', type: 'textarea' as const, default: 'Whatever the occasion, we make it count.' },
          { key: 'home_cta_body', label: 'Body Text', hint: 'Short body below heading', type: 'text' as const, default: 'From a 200-guest wedding to Tuesday night dinner.' },
          { key: 'home_cta_button', label: 'Button Text', hint: 'CTA button label', type: 'text' as const, default: 'Get a Quote' },
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
        hint: 'Top of the About page, "01 · The Studio"',
        fields: [
          { key: 'about_header_index', label: 'Section Index', hint: 'Small label (e.g. 01 · The Studio)', type: 'text' as const, default: '01 · The Studio' },
          { key: 'about_header_title', label: 'Title', hint: 'Large stacked display title: each line of text is one line on the page', type: 'text' as const, default: 'COOKED\nWITH CARE' },
          { key: 'about_header_tagline', label: 'Tagline', hint: 'Serif tagline to the right of the image', type: 'text' as const, default: 'We believe good food should make an occasion feel like one.' },
          { key: 'about_header_body', label: 'Body Text', hint: 'Paragraph below the tagline', type: 'textarea' as const, default: 'We started in a family kitchen in Victoria, BC, and we still cook that way: from scratch, by hand, with menus built around your event rather than a set list.' },
        ],
      },
      {
        section: 'Philosophy Section',
        hint: 'Dark block, "02 · Our Philosophy"',
        fields: [
          { key: 'about_philosophy_index', label: 'Section Index', hint: 'Small label', type: 'text' as const, default: '02 · Our Philosophy' },
          { key: 'about_philosophy_title', label: 'Title', hint: 'Large stacked display title: each line of text is one line on the page', type: 'text' as const, default: 'SOURCED FROM\nTHE EARTH' },
          { key: 'about_philosophy_tagline', label: 'Tagline', hint: 'Serif paragraph', type: 'text' as const, default: 'We buy from Vancouver Island farms and independent purveyors we know by name.' },
          { key: 'about_philosophy_body', label: 'Body Text', hint: 'Paragraph below the tagline', type: 'textarea' as const, default: 'Good food starts with good ingredients, so we cook with what the Island is growing right now. That means your menu tastes like the season your celebration lands in.' },
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
          { key: 'menus_header_title', label: 'Title', hint: 'Large stacked display title: each line of text is one line on the page', type: 'text' as const, default: 'CATERING\nMENUS' },
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
          { key: 'weddings_heading', label: 'Section Heading', hint: 'e.g. A Menu Made for Your Day', type: 'text' as const, default: 'A Menu Made for Your Day' },
          { key: 'weddings_body_1', label: 'Paragraph 1', hint: 'First paragraph of body text', type: 'textarea' as const, default: 'Your wedding deserves more than a set menu. With 17 years behind him, Chef Paul sits down with you and builds the food around your day and the people at it.' },
          { key: 'weddings_body_2', label: 'Paragraph 2', hint: 'Second paragraph of body text', type: 'textarea' as const, default: 'From an intimate ceremony on Vancouver Island to a reception for 300, we look after every detail, from the first canapé through to the last dessert course.' },
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
          { key: 'weddings_step3_desc', label: 'Step 3 Description', hint: 'Body text for step 3', type: 'textarea' as const, default: 'Our team arrives hours early and sets everything up quietly. You focus on the celebration. We handle everything else.' },
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
          { key: 'events_heading', label: 'Section Heading', hint: 'e.g. Dinner, In Good Hands', type: 'text' as const, default: 'Dinner, In Good Hands' },
          { key: 'events_body_1', label: 'Paragraph 1', hint: 'First paragraph of body text', type: 'textarea' as const, default: 'From a formal dinner party to catering aboard a yacht, we bring the kitchen to you and serve a proper meal in your own space, without the fuss.' },
          { key: 'events_body_2', label: 'Paragraph 2', hint: 'Second paragraph of body text', type: 'textarea' as const, default: "Whether it's an anniversary dinner for 12 or a milestone birthday for 80, Chef Paul builds every course around the host and the guests at the table." },
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
          { key: 'events_card3_title', label: 'Card 3 Title', hint: 'e.g. Service That Stays Out of the Way', type: 'text' as const, default: 'Service That Stays Out of the Way' },
          { key: 'events_card3_desc', label: 'Card 3 Description', hint: 'Body text for card 3', type: 'textarea' as const, default: 'Our staff are attentive without hovering, so your guests remember the food and the night, not the logistics.' },
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
          { key: 'corporate_header_title', label: 'Title', hint: 'Large stacked display title: each line of text is one line on the page', type: 'text' as const, default: 'BOARDROOM\nTO BANQUET' },
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

const ALL_FIELDS: ContentField[] = CONTENT_SCHEMA.flatMap((p) => p.sections.flatMap((s) => s.fields));

/**
 * The editor baseline: the stored CMS value when one exists, otherwise the
 * built-in page fallback. cms() treats '' as unset (`settings[key] || fallback`),
 * so an empty stored value also displays as the default.
 */
function buildInitial(initialContent: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const field of ALL_FIELDS) {
    map[field.key] = initialContent[field.key] || field.default;
  }
  return map;
}

function SessionExpiredNotice() {
  return (
    <div
      role="alert"
      style={{
        marginBottom: '1rem', padding: '0.875rem 1rem', background: 'rgba(185,28,28,0.05)',
        border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.85rem', borderRadius: '6px',
        display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
      }}
    >
      <span>Session expired. Log in again to keep editing.</span>
      <Link href="/admin-login" className="admin-btn admin-btn--sm" style={{ textDecoration: 'none' }}>
        Log in
      </Link>
    </div>
  );
}

export default function AdminContentClient({ initialContent }: { initialContent: Record<string, string> }) {
  const [baseline, setBaseline] = useState<Record<string, string>>(() => buildInitial(initialContent));
  const [content, setContent] = useState<Record<string, string>>(() => buildInitial(initialContent));

  const [activePage, setActivePage] = useState(CONTENT_SCHEMA[0].page);
  const [isPending, startTransition] = useTransition();
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [saveBar, setSaveBar] = useState<HTMLDivElement | null>(null);
  const toast = useToast();

  // Publish the save bar's height so the toast stack can sit above it. Toasts
  // are anchored to the same bottom-right corner as Save, and they outrank it,
  // so without this a toast lands on top of the button you just pressed and
  // blocks the next press.
  useEffect(() => {
    const root = document.documentElement;
    if (!saveBar) {
      root.style.setProperty('--admin-actionbar-height', '0px');
      return;
    }
    const publish = () => {
      root.style.setProperty('--admin-actionbar-height', `${Math.ceil(saveBar.getBoundingClientRect().height)}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(saveBar);
    return () => {
      observer.disconnect();
      root.style.setProperty('--admin-actionbar-height', '0px');
    };
  }, [saveBar]);

  const dirtyKeys = useMemo(
    () => ALL_FIELDS.map((f) => f.key).filter((k) => content[k] !== baseline[k]),
    [content, baseline]
  );
  const dirty = dirtyKeys.length > 0;
  useDirtyGuard(dirty);

  const dirtyPageNames = useMemo(() => {
    const dirtySet = new Set(dirtyKeys);
    return new Set(
      CONTENT_SCHEMA.filter((p) =>
        p.sections.some((s) => s.fields.some((f) => dirtySet.has(f.key)))
      ).map((p) => p.page)
    );
  }, [dirtyKeys]);

  const updateField = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (dirtyKeys.length === 0) {
      toast.info('Nothing to publish');
      return;
    }
    // Dirty-key diff: persist only the fields the admin actually changed, so
    // untouched keys are never blanket-published over live copy.
    const payload: Record<string, string> = {};
    for (const key of dirtyKeys) payload[key] = content[key];
    const count = dirtyKeys.length;

    startTransition(async () => {
      const res = await saveSiteContent(payload).catch(
        () => ({ success: false as const, error: 'failed' as const })
      );
      if (res.success) {
        setBaseline((prev) => ({ ...prev, ...payload }));
        setLastSavedAt(new Date());
        setSessionExpired(false);
        toast.success(`Published ${count} change${count === 1 ? '' : 's'}. Live site updated`);
      } else if (res.error === 'unauthorized') {
        setSessionExpired(true);
        toast.error('Session expired. Log in again');
      } else {
        toast.error(('message' in res && res.message) || 'Failed to save content. Please try again');
      }
    });
  };

  const handleDiscard = () => {
    setContent(baseline);
  };

  const activeSchema = CONTENT_SCHEMA.find((p) => p.page === activePage)!;

  function formatTime(d: Date): string {
    return d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ paddingBottom: dirty ? '4.5rem' : 0 }}>
      {sessionExpired && <SessionExpiredNotice />}

      {/* Page Tabs */}
      <div className="admin-tabs" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {CONTENT_SCHEMA.map((schema) => (
          <button
            key={schema.page}
            className={`admin-tab ${activePage === schema.page ? 'admin-tab--active' : ''}`}
            onClick={() => setActivePage(schema.page)}
          >
            {schema.page}
            {dirtyPageNames.has(schema.page) && (
              <span
                aria-label="(has unsaved changes)"
                style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#D97706', marginLeft: '0.4rem', verticalAlign: 'middle' }}
              />
            )}
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
          {dirty && (
            <span style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 500 }}>
              {dirtyKeys.length} unsaved change{dirtyKeys.length === 1 ? '' : 's'}
            </span>
          )}
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={isPending || !dirty}
            style={{ padding: '0.6rem 1.5rem' }}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeSchema.sections.map((section) => (
        <div key={section.section} className="admin-section" style={{ marginBottom: '1.5rem' }}>
          <div className="admin-section__header">
            <div>
              <h3>{section.section}</h3>
              <p style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.35)', marginTop: '0.15rem' }}>{section.hint}</p>
            </div>
          </div>
          <div className="admin-section__body">
            <div style={{ display: 'grid', gap: '1.5rem', opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
              {section.fields.map((field: ContentField) => {
                const value = content[field.key] ?? field.default;
                const isEdited = value !== baseline[field.key];
                const isCustomized = value !== field.default;
                // Multi-line copy (stacked display titles etc.) needs a textarea;
                // a single-line input can't enter the newline the page splits on.
                const multiline = field.type === 'textarea' || field.default.includes('\n');
                return (
                  <div key={field.key} style={{ position: 'relative' }}>
                    {/* Edited dot + reset, top-right on the label line */}
                    <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                      {isEdited && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#D97706' }}>
                          <span aria-hidden="true" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706' }} />
                          Edited
                        </span>
                      )}
                      {isCustomized && (
                        <button
                          type="button"
                          onClick={() => updateField(field.key, field.default)}
                          disabled={isPending}
                          title="Restore the built-in site copy"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.68rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0, lineHeight: 1 }}
                        >
                          Reset to default
                        </button>
                      )}
                    </div>
                    {multiline ? (
                      <TextAreaField
                        id={field.key}
                        label={field.label}
                        help={field.hint}
                        value={value}
                        onChange={(v) => updateField(field.key, v)}
                        disabled={isPending}
                        rows={2}
                      />
                    ) : (
                      <TextField
                        id={field.key}
                        label={field.label}
                        help={field.hint}
                        value={value}
                        onChange={(v) => updateField(field.key, v)}
                        disabled={isPending}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Sticky Save Bar */}
      {dirty && (
        <div ref={setSaveBar} style={{
          position: 'fixed',
          bottom: 0,
          left: 'var(--admin-sidebar-width, 240px)',
          right: 0,
          padding: '0.875rem 2rem',
          background: 'white',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 50,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#D97706' }}>
              {dirtyKeys.length} unsaved change{dirtyKeys.length === 1 ? '' : 's'}
            </span>
            {lastSavedAt && (
              <span style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.35)' }}>Last saved at {formatTime(lastSavedAt)}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              className="admin-btn"
              onClick={handleDiscard}
              disabled={isPending}
              style={{ fontSize: '0.78rem' }}
            >
              Discard
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSave}
              disabled={isPending}
              style={{ padding: '0.6rem 1.5rem' }}
            >
              {isPending ? 'Saving...' : 'Publish Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
