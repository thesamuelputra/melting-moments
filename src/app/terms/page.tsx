export default function Terms() {
  return (
    <div>
        <header className="container" style={{ paddingTop: "clamp(8rem, 15vw, 12rem)", paddingBottom: "clamp(4rem, 10vw, 8rem)" }}>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Terms of Service</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ maxWidth: '800px', margin: '4rem auto 0 auto' }}>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   By requesting a quote or booking an event with Melting Moments, you agree to our standard catering terms. A deposit is required to secure your date, with full payment expected prior to the event unless formal corporate billing arrangements have been made.
               </p>
               <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
                   Menu subject to change based on seasonal availability. Final guest counts must be provided 14 days before the event. Cancellations must be made in writing; deposits are non-refundable within 30 days of the event date.
               </p>
            </div>
        </header>
    </div>
  );
}
