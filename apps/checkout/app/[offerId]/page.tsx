import { CheckoutForm } from "../../components/checkout-form";

export default async function CheckoutPage({
  params
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;

  return (
    <main className="checkout-shell">
      <header className="brand-bar">
        <a href="/" className="brand" aria-label="KiwifyClone">
          kiwi<span>/pay</span>
        </a>
        <p>Pagamento protegido</p>
      </header>

      <CheckoutForm offerId={offerId} />

      <footer className="checkout-footer">
        <p>Seus dados de cartão são enviados somente ao provedor de pagamento.</p>
        <span>Ambiente seguro · BRL</span>
      </footer>
    </main>
  );
}
