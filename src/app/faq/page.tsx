export default function FAQ() {
  const faqs = [
    { q: "How far in advance should I book?", a: "For weddings, we recommend booking 9-12 months in advance. For corporate and private events, 2-3 months is preferred, though we can sometimes accommodate shorter notices." },
    { q: "Do you provide tastings?", a: "Yes. Once an initial proposal is approved, we schedule a private tasting with Chef Paul to finalize the menu." },
    { q: "Are staff and rentals included?", a: "Our proposals are comprehensive and customized. We can include professional waitstaff, bartenders, and coordinate all necessary rentals (linens, glassware, plates) based on your needs." },
    { q: "Do you accommodate dietary restrictions?", a: "Absolutely. We are highly experienced in creating exceptional vegan, gluten-free, and allergy-safe menus that meet our award-winning standards." }
  ];

  return (
    <div>
        <header className="container" style={{ paddingTop: "calc(70px + 3vw)", paddingBottom: "clamp(2rem, 4vw, 4rem)" }}>
            <div className="menu-index" style={{ marginBottom: "2rem" }}>Information</div>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>FAQ</h1>
            
            <div style={{ maxWidth: '800px', margin: '3rem auto 0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               {faqs.map((faq, i) => (
                 <div key={i} style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.1)' }}>
                   <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>{faq.q}</h3>
                   <p style={{ opacity: 0.8 }}>{faq.a}</p>
                 </div>
               ))}
            </div>
        </header>
    </div>
  );
}
