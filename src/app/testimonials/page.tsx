export default function Testimonials() {
  const reviews = [
    { author: "Sarah & James", text: "Melting Moments transformed our wedding. The food was not just catering; it was an experience. Guests are still talking about the duck confit." },
    { author: "Victoria Tech Group", text: "Chef Paul handled our 300-person corporate gala flawlessly. The execution was punctual, the staff invisible yet attentive, and the flavor profiles were exceptional." },
    { author: "Elena M.", text: "The chocolate fountain was the centerpiece of our anniversary. Professional setup, premium ingredients, unparalleled service." }
  ];

  return (
    <div>
        <header className="container" style={{ paddingTop: "calc(70px + 3vw)", paddingBottom: "clamp(2rem, 4vw, 4rem)" }}>
            <div className="menu-index" style={{ marginBottom: "2rem" }}>Information</div>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Testimonials</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '6rem' }}>
               {reviews.map((rev, i) => (
                 <div key={i} className="haus-block-container" style={{ padding: '3rem' }}>
                   <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '2rem', fontStyle: 'italic' }}>"{rev.text}"</p>
                   <div className="menu-index" style={{ color: 'var(--clr-bone)', opacity: 0.6 }}>— {rev.author}</div>
                 </div>
               ))}
            </div>
        </header>
    </div>
  );
}
