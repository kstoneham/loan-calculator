// src/components/Calculator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Calculator() {
  const [principal, setPrincipal] = useState(10000);
  const [collateralBTC, setCollateralBTC] = useState(5);
  const [btcPrice, setBtcPrice] = useState(0);
  const [paymentInput, setPaymentInput] = useState('');
  const [depositInput, setDepositInput] = useState('');
  const [sellInput, setSellInput] = useState('');

  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await axios.get('https://www.bitstamp.net/api/v2/ticker/btcusd/');
        setBtcPrice(parseFloat(response.data.last));
      } catch (error) {
        console.error('Error fetching BTC price:', error);
      }
    };

    fetchBtcPrice();
    const intervalId = setInterval(fetchBtcPrice, 60000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  const calculateRatio = () => {
    if (principal === 0) return 0;
    return ((collateralBTC * btcPrice) / principal) * 100;
  };

  const makePrincipalPayment = () => {
    const payment = parseFloat(paymentInput);
    if (!isNaN(payment) && payment > 0) {
      setPrincipal((prevPrincipal) => Math.max(0, prevPrincipal - payment));
      setPaymentInput('');
    }
  };

  const depositBTC = () => {
    const deposit = parseFloat(depositInput);
    if (!isNaN(deposit) && deposit > 0) {
      setCollateralBTC((prevCollateral) => prevCollateral + deposit);
      setDepositInput('');
    }
  };

  const sellBTC = () => {
    const sellAmount = parseFloat(sellInput);
    if (!isNaN(sellAmount) && sellAmount > 0 && sellAmount <= collateralBTC) {
      setCollateralBTC((prevCollateral) => prevCollateral - sellAmount);
      setPrincipal((prevPrincipal) =>
        Math.max(0, prevPrincipal - sellAmount * btcPrice)
      );
      setSellInput('');
    } else if (sellAmount > collateralBTC) {
      alert("Insufficient BTC collateral.");
    }
  };

  return (
    <div>
      <h2>Loan Calculator</h2>
      <div>
        <label>Principal (USD):</label>
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>Collateral (BTC):</label>
        <input
          type="number"
          value={collateralBTC}
          onChange={(e) => setCollateralBTC(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <p>BTC Price (USD): {btcPrice.toFixed(2)}</p>
        <p>Collateral Value (USD): {(collateralBTC * btcPrice).toFixed(2)}</p>
        <p>Collateral/Principal Ratio: {calculateRatio().toFixed(2)}%</p>
      </div>

      <div>
        <label>Principal Payment (USD):</label>
        <input
          type="number"
          value={paymentInput}
          onChange={(e) => setPaymentInput(e.target.value)}
        />
        <button onClick={makePrincipalPayment}>Make Payment</button>
      </div>

      <div>
        <label>Deposit BTC:</label>
        <input
          type="number"
          value={depositInput}
          onChange={(e) => setDepositInput(e.target.value)}
        />
        <button onClick={depositBTC}>Deposit</button>
      </div>

      <div>
        <label>Sell BTC:</label>
        <input
          type="number"
          value={sellInput}
          onChange={(e) => setSellInput(e.target.value)}
        />
        <button onClick={sellBTC}>Sell</button>
      </div>
    </div>
  );
}

export default Calculator;