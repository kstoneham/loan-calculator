import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Card from './components/Card';
import './App.css';

function App() {
  const [action, setAction] = useState(''); 
  const [actionInput, setActionInput] = useState(''); 
  const [btcPrice, setBtcPrice] = useState(0);
  const [userPriceInput, setUserPriceInput] = useState(''); 
  const [principal, setPrincipal] = useState(150000);
  const [collateralBTC, setCollateralBTC] = useState(3);
  const [simulatorPrincipal, setSimulatorPrincipal] = useState(principal); 
  const [simulatorCollateralBTC, setSimulatorCollateralBTC] = useState(collateralBTC);
  const [showSimulatorResults, setShowSimulatorResults] = useState(false); 
  const [showResetButton, setshowResetButton] = useState(false);
  const intervalId = useRef(null); 
  
  const handleActionChange = (event) => {
    setAction(event.target.value);
    setActionInput(''); 
  };

  const handleAction = () => {
    setShowSimulatorResults(true);
    setshowResetButton(true);
    const inputValue = parseFloat(actionInput);

    let newPrincipal;
    let newCollateral;

    switch (action) {
      case "makePayment":
        if (!isNaN(inputValue) && inputValue > 0) {
          newPrincipal = Math.max(0, simulatorPrincipal - inputValue);
          setSimulatorPrincipal(newPrincipal);
        }
        break;
      case "depositBTC":
        if (!isNaN(inputValue) && inputValue > 0) {
          newCollateral = simulatorCollateralBTC + inputValue;
          setSimulatorCollateralBTC(newCollateral);
        }
        break;
      case "sellBTC":
        if (!isNaN(inputValue) && inputValue > 0 && inputValue <= collateralBTC) {
          newCollateral = simulatorCollateralBTC - inputValue;
          const price = userPriceInput ? parseFloat(userPriceInput) : btcPrice;
          newPrincipal = Math.max(0, simulatorPrincipal - inputValue * price);
          setSimulatorPrincipal(newPrincipal);
          setSimulatorCollateralBTC(newCollateral);
        } else if (inputValue > collateralBTC) {
          alert("Insufficient BTC collateral.");
        }
        break;
      default:
      break;
    }

    setActionInput("");
  };

  async function fetchBtcPrice() {
    try {
      const response = await axios.get('https://www.bitstamp.net/api/v2/ticker/btcusd/');
      setBtcPrice(parseFloat(response.data.last));
    } catch (error) {
      console.error('Error fetching BTC price: ', error);
    }
  };

  useEffect(() => {
    fetchBtcPrice();
    clearInterval(intervalId.current);
    intervalId.current = setInterval(fetchBtcPrice, 60000);

    return () => clearInterval(intervalId.current);
  }, []);

  const calculateRatio = () => {
    if (principal === 0) return 0;
    const price = userPriceInput ? parseFloat(userPriceInput) : btcPrice; 
    return ((collateralBTC * price) / principal) * 100;
  };

  const calculateSimRatio = () => {
    if (simulatorPrincipal === 0) return 0;
    const price = userPriceInput ? parseFloat(userPriceInput) : btcPrice; 
    return ((simulatorCollateralBTC * price) / simulatorPrincipal) * 100;
  };

  const resetCalculator = () => {
    setPrincipal(150000);
    setCollateralBTC(3);
    setAction(''); 
    setActionInput(''); 
    setUserPriceInput('');
    setShowSimulatorResults(false);
    setshowResetButton(false);
    setSimulatorPrincipal(principal);
    setSimulatorCollateralBTC(collateralBTC);
    fetchBtcPrice();
   };
  
  return (
    <div className="App">
      <h2 className='title'>Loan collateral health calculator</h2>
      <div className='main-container'>
      <Card title="Step 1: Enter current loan values">
        <label>Principal (USD):        
          <input
            type="number"
            value={principal}
            onChange={(e) => {
              setPrincipal(parseFloat(e.target.value))
              setSimulatorPrincipal(parseFloat(e.target.value))
            }}
          />
        </label>
        <label>Collateral (BTC):
          <input
            type="number"
            value={collateralBTC}
            onChange={(e) => {
              setCollateralBTC(parseFloat(e.target.value))
              setSimulatorCollateralBTC(parseFloat(e.target.value))
            }}
          />
        </label>
        <hr></hr>
        <label>Custom BTC Price (USD):
          <input
            placeholder='Optional--leave empty to use Bitstamp price'
            type="number"
            value={userPriceInput}
            onChange={(e) => setUserPriceInput(e.target.value)}
          />
        </label>
      </Card>
      <Card title="Current loan value calculation">
        <div>
          <p>Principal: {(principal).toLocaleString()}</p>
          <p>BTC Price (USD): {(userPriceInput ? parseFloat(userPriceInput) : btcPrice).toLocaleString()}</p>
          <p>Collateral Value (USD): {(collateralBTC * (userPriceInput ? parseFloat(userPriceInput) : btcPrice)).toLocaleString()}</p>
          <p>Collateral to Principal Ratio: {calculateRatio(principal, collateralBTC).toFixed(2)}%</p>
        </div>
      </Card>
      <Card title="Step 2: Simulate loan actions">
        <select value={action} onChange={handleActionChange}>
          <option value="">Select an action</option>
          <option value="makePayment">Make Principal Payment</option>
          <option value="depositBTC">Deposit BTC</option>
          <option value="sellBTC">Sell BTC</option>
        </select>
        {action && (
          <div>
            <label htmlFor="actionInput">Amount:
              <input
                type="number"
                id="actionInput"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
              />
            </label>
            <button onClick={handleAction}>Perform Action</button>
          </div>
        )}
      </Card>
      {showSimulatorResults && (
        <Card title="Simulator results">
          <div>
            <p>Principal: {(simulatorPrincipal).toLocaleString()}</p>
            <p>BTC Price (USD): {(userPriceInput ? parseFloat(userPriceInput).toFixed(2): btcPrice).toLocaleString()}</p>
            <p>Collateral Value (USD): {(simulatorCollateralBTC * (userPriceInput ? parseFloat(userPriceInput) : btcPrice)).toLocaleString()}</p>
            <p>Collateral to Principal Ratio: {calculateSimRatio(simulatorPrincipal, simulatorCollateralBTC).toFixed(2)}%</p>
          </div>
        </Card>
      )}

      {showResetButton && (<button onClick={resetCalculator}>Reset Calculator</button>)}
      
      </div>
    </div>
  );
}

export default App;
