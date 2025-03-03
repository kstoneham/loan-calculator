// src/components/Calculator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Calculator() {
  const [principal, setPrincipal] = useState(150000);
  const [collateralBTC, setCollateralBTC] = useState(3);
  const [btcPrice, setBtcPrice] = useState(0);
  const [paymentInput, setPaymentInput] = useState('');
  const [depositInput, setDepositInput] = useState('');
  const [sellInput, setSellInput] = useState('');
  const [userPriceInput, setUserPriceInput] = useState(''); // New state for user price input

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
  },);

  const calculateRatio = () => {
    if (principal === 0) return 0;
    const price = userPriceInput ? parseFloat(userPriceInput) : btcPrice; // Use user input if available
    return ((collateralBTC * price) / principal) * 100;
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
      const price = userPriceInput ? parseFloat(userPriceInput) : btcPrice; // Use user input if available
      setPrincipal((prevPrincipal) =>
        Math.max(0, prevPrincipal - sellAmount * price)
      );
      setSellInput('');
    } else if (sellAmount > collateralBTC) {
      alert("Insufficient BTC collateral.");
    }
  };

  const resetCalculator = () => {
    setPrincipal(150000);
    setCollateralBTC(3);
    setBtcPrice(0);
    setPaymentInput('');
    setDepositInput('');
    setSellInput('');
    setUserPriceInput(''); // Reset user price input

    // Fetch the latest BTC price from the API
    const fetchBtcPrice = async () => {
      try {
        const response = await axios.get('https://www.bitstamp.net/api/v2/ticker/btcusd/');
        setBtcPrice(parseFloat(response.data.last));
      } catch (error) {
        console.error('Error fetching BTC price:', error);
      }
    };
    fetchBtcPrice();
  };

  return (
    <div>
      <h2>Loan Calculator</h2>

      {/* Rest of the form */}
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
        <p>BTC Price (USD): {userPriceInput ? parseFloat(userPriceInput).toFixed(2) : btcPrice.toFixed(2)}</p>
        <p>Collateral Value (USD): {(collateralBTC * (userPriceInput ? parseFloat(userPriceInput) : btcPrice)).toFixed(2)}</p>
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

    {/* User Price Input */}
      <div>
        <label>Custom BTC Price (USD):</label>
        <input
          type="number"
          value={userPriceInput}
          onChange={(e) => setUserPriceInput(e.target.value)}
        />
      </div>

      {/* Reset Button */}
      <button onClick={resetCalculator}>Reset Calculator</button>
    </div>
  );
}

export default Calculator;