import React, { useState, useEffect } from 'react';
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined
} from "@ant-design/icons";
import tokenList from "../tokenList.json";

// default import of the axios library, which is a popular HTTP client for making API requests in JavaScript.
import axios from "axios";

// These are named imports from the wagmi library, which is a set of React hooks that provide functionality for 
// interacting with the Ethereum blockchain. Specifically, useSendTransaction is used to send transactions to the 
// Ethereum network, and useWaitForTransaction is used to wait for a transaction to be confirmed on the network.
import { useSendTransaction, useWaitForTransaction } from "wagmi";


function Swap(props) {

  // Destructure the 'address' and 'isConnected' props from the props object
  const { address, isConnected } = props;

  // Destructure the 'useMessage' function and contextHolder from the 'message' object provided by the antd library
  const [messageApi, contextHolder] = message.useMessage();
  
  // Initialize the state variables and their default values using the 'useState' hook
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null
  });

// Explanation of each state variable:
// - slippage: represents the allowed slippage percentage for a trade
// - tokenOneAmount: represents the amount of the first selected token to be traded
// - tokenTwoAmount: represents the amount of the second selected token to be received
// - tokenOne: represents the first selected token
// - tokenTwo: represents the second selected token
// - isOpen: represents the visibility of a modal window
// - changeToken: represents the selected token to be swapped with another token
// - prices: represents the current prices of the selected tokens
// - txDetails: represents the details of the transaction that will be executed later


  // This line uses a React hook named "useSendTransaction" from the "wagmi" library
  // and destructures the returned objects, "data" and "sendTransaction".
  const { data, sendTransaction } = useSendTransaction({
    // This object is the "request" object passed to the "useSendTransaction" hook.
    // It contains the details of the transaction to be sent.
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value)
    }
  });

  /**
    useWaitForTransaction is a custom hook provided by the wagmi package which waits for a transaction to be confirmed on the blockchain.
    The hook takes an object as an argument with a hash property representing the transaction hash to wait for.
    Here, we're using object destructuring to extract the isLoading and isSuccess properties returned by the hook.

    We're passing an object with a hash property to the useWaitForTransaction hook. The hash property is the hash property from 
    the data object with optional chaining ?. to avoid TypeError in case the data object is null or undefined.
    This means that the hook will wait for a transaction with the hash stored in data?.hash to be confirmed on the blockchain.

    The isLoading variable is a boolean that indicates whether the hook is currently waiting for the transaction to be confirmed.
    The isSuccess variable is a boolean that indicates whether the transaction has been successfully confirmed on the blockchain.
   */
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });

  // This function is used to handle changes to the slippage percentage value
  // It takes an event object as a parameter
  function handleSlippageChange(e){
    // Set the slippage value to the target value of the event
    setSlippage(e.target.value);
  }

  // This function is called when the user changes the amount of token one they want to swap
  function changeAmount(e) {
    // Update the state with the new token one amount
    setTokenOneAmount(e.target.value);

    // If the new token one amount and the prices are available
    if (e.target.value && prices) {
      // Calculate the equivalent token two amount using the token prices and update the state
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2));
    } else {
      // If either the new token one amount or prices are not available, set the token two amount state to null
      setTokenTwoAmount(null);
    }
  }

// This function is called when the user clicks the "Switch" button
// It swaps the two selected tokens and resets the prices and amounts to null
function switchTokens(){
  // Reset the prices, and amounts of tokens to null
  setPrices(null);
  setTokenOneAmount(null);
  setTokenTwoAmount(null);

  // Swap the two tokens
  const one = tokenOne;
  const two = tokenTwo;
  setTokenOne(two);
  setTokenTwo(one);

  // Fetch the new prices of the swapped tokens
  fetchPrices(two.address, one.address);
}
  // This function is called when the user clicks on an asset to change.
  // It takes the selected asset as an argument and sets it as the changeToken.
  // It also sets the isOpen state to true to open the modal.
  function openModal(asset){
    setChangeToken(asset);
    setIsOpen(true);
  }

  // This function takes an index i as its parameter, which corresponds to the selected token in the modal
  function modifyToken(i){
    // Reset prices and token amounts
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
  
    // Check if the user wants to modify tokenOne or tokenTwo
    if (changeToken === 1) {
      // Set the new tokenOne and fetch the new prices
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);
    } else {
      // Set the new tokenTwo and fetch the new prices
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);
    }
  
    // Close the modal
    setIsOpen(false);
  }  

  // This is an asynchronous function that fetches prices for two tokens using their addresses
  // It sends a GET request to a local server running on port 3002, which responds with the prices
  async function fetchPrices(one, two){
    const res = await axios.get("http://localhost:3002/tokenPrice", {
      params: {addressOne: one, addressTwo: two}
    })

    // The prices are set to the response data using setPrices function
    setPrices(res.data);
  }

  // This async function fetches the swap details from the 1inch API
  async function fetchDexSwap(){
    // First, fetch the allowance of tokenOne from the user's wallet using the 1inch API
    const allowance = await axios.get(`https://api.1inch.io/v5.0/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`);

    // If the allowance is zero, send an approval transaction to allow 1inch to spend the user's token
    if(allowance.data.allowance === "0"){
      const approve = await axios.get(`https://api.1inch.io/v5.0/1/approve/transaction?tokenAddress=${tokenOne.address}`);

      // Set the transaction details in txDetails state for later use
      setTxDetails(approve.data);
      console.log("not approved")
      return
    }

    // If the allowance is not zero, fetch the swap transaction details using the 1inch API
    const tx = await axios.get(
      `https://api.1inch.io/v5.0/1/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${tokenOneAmount.padEnd(tokenOne.decimals+tokenOneAmount.length, "0")}&fromAddress=${address}&slippage=${slippage}`
      );

    // Calculate the tokenTwoAmount using the received toTokenAmount and tokenTwo's decimals
    let decimals = Number(`1E${tokenTwo.decimals}`);
    setTokenTwoAmount((Number(tx.data.toTokenAmount)/decimals).toFixed(2));

    // Set the transaction details in txDetails state for later use
    setTxDetails(tx.data.tx);
  }

  // This is a React useEffect hook that gets triggered when the component is mounted. It calls the fetchPrices function with 
  // the addresses of the first two tokens in the tokenList array, and sets the prices state with the result. The [] argument 
  // at the end of the hook indicates that this effect should only run once when the component mounts, and not on every re-render.
  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address)
  }, [])

  useEffect(() => {
    // If the `txDetails.to` property exists and the user is connected,
    // then call the `sendTransaction` function to initiate the transaction.
    if(txDetails.to && isConnected){
      sendTransaction();
    }
  }, [txDetails]) // The `useEffect` hook will re-run whenever `txDetails` changes.  

  // The `messageApi` object is used to show notifications
  // on the UI. We need to destroy any existing notification
  // when the component is unmounted.
  useEffect(() => {
    messageApi.destroy();

    // If the `isLoading` state is `true`, it means that
    // a transaction is being processed. We show a "Loading"
    // notification on the UI.
    if(isLoading){
      messageApi.open({
        type: "loading",
        content: "Transaction is Pending",
        duration: 0
      });
    }
  }, [isLoading])

  useEffect(() => {
    messageApi.destroy(); // Clean up previous messages
  
    // If transaction is successful, show success message
    // If transaction failed, show error message
    if (isSuccess) {
      messageApi.open({
        type: "success",
        content: "Transaction Successful",
        duration: 1.5
      });
    } else if (txDetails.to) {
      messageApi.open({
        type: "error",
        content: "Transaction Failed",
        duration: 1.5
      });
    }
  }, [isSuccess]);  

  // This code defines a JSX element called settings which contains a div with the text "Slippage Tolerance" and 
  // a Radio.Group component with three Radio.Button components inside. The Radio.Group component controls the value 
  // of the slippage state by calling the handleSlippageChange function whenever a Radio.Button is selected. The selected 
  // Radio.Button value is then used to set the slippage state.
  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  )

  return (
    <>
      {/* Render the message provider */}
      {contextHolder}
      {/* Render the modal */}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
        >
          <div className='modalContent'>
            {/* Map through the token list and render each token */}
            {tokenList?.map((e,i) => {
              return (
                <div
                  className='tokenChoice'
                  key={i}
                  onClick={() => modifyToken(i)}
                >
                  <img src={e.img} alt={e.ticker} className="tokenLogo" />
                  <div className='tokenChoiceNames'>
                    <div className='tokenName'>{e.name}</div>
                    <div className='tokenTicker'>{e.ticker}</div>
                  </div>
                </div>
              );
            })}
          </div>
      </Modal>

      {/* Render the swap box */}
      <div className='tradeBox'>
        <div className='tradeBoxHeader'>
          <h4>Swap</h4>
          {/* Render the settings popover */}
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement='bottomRight'
          >
            <SettingOutlined className='cog' />
          </Popover>
        </div>
        {/* Render the token input fields */}
        <div className='inputs'>
          <Input placeholder='0' value={tokenOneAmount} onChange={changeAmount} disabled={!prices}/>
          <Input placeholder='0' value={tokenTwoAmount} disabled={true} />
          {/* Render the switch button */}
          <div className='switchButton' onClick={switchTokens}>
            <ArrowDownOutlined className='switchArrow' />
          </div>
          {/* Render the asset one dropdown */}
          <div className='assetOne' onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className='assetLogo' />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          {/* Render the asset two dropdown */}
          <div className='assetTwo' onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className='assetLogo' />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        {/* Render the swap button */}
        <div className='swapButton' disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</div>
      </div>
    </>
  )
}

export default Swap