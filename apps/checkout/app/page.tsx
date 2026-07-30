export default function CheckoutHomePage() {
  return (
    <main className="checkout-shell">
      <header className="brand-bar">
        <a href="/" className="brand" aria-label="KiwifyClone">
          kiwi<span>/pay</span>
        </a>
        <p>Ambiente de checkout</p>
      </header>

      <section className="checkout-home">
        <p className="eyebrow">Checkout pronto</p>
        <h1>Abra uma oferta para testar a compra.</h1>
        <p>
          Informe o identificador de uma oferta ativa criada pela API. O checkout
          carregará o produto, o preço e as formas de pagamento disponíveis.
        </p>

        <form className="offer-launcher" action="/open-offer">
          <label htmlFor="offer-id">ID da oferta</label>
          <div>
            <input
              id="offer-id"
              name="offerId"
              placeholder="Ex.: offer_..."
              required
            />
            <button type="submit">
              Abrir checkout
            </button>
          </div>
        </form>

        <p className="home-hint">
          Você também pode acessar diretamente <code>localhost:3002/ID_DA_OFERTA</code>.
        </p>
      </section>

      <footer className="checkout-footer">
        <p>Pix e cartão de crédito disponíveis conforme a oferta.</p>
        <span>Ambiente local · BRL</span>
      </footer>
    </main>
  );
}
