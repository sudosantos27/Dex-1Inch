import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Tokens from "./components/Tokens";
import { Routes, Route } from "react-router-dom";

// The useConnect hook is used to connect to a wallet provider (such as MetaMask) and returns an object containing the 
// connect function, which is used to initiate the connection, and isConnected, a boolean that indicates whether the connection has been established or not.
// The useAccount hook is used to get the current user's account address and other related information such as their balance, and returns an object containing 
// the address of the connected account and isConnected, a boolean that indicates whether a connection has been established or not.
import { useConnect, useAccount } from "wagmi";

// The MetaMaskConnector is a connector object that allows the user to connect to the app through the MetaMask wallet.
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

function App() {
  // This hook is used to retrieve the user's account information
  const { address, isConnected } = useAccount();

  // This hook is used to connect to the Wagmi client using the MetaMaskConnector
  const { connect } = useConnect({
    connector: new MetaMaskConnector() // Use MetaMask as the connector
  });

  // The return statement of the App component, which renders the UI of the app
  return (
    <div className="App">
      {/* The Header component displays the header section of the app */}
      <Header connect={connect} isConnected={isConnected} address={address} />
      <div className="mainWindow">
        {/* The Routes component defines the routes of the app */}
        <Routes>
          {/* The Route component defines a specific route */}
          <Route path="/" element={<Swap isConnected={isConnected} address={address} />} />
          {/* This route renders the Tokens component */}
          <Route path="/tokens" element={<Tokens />} />
        </Routes>
      </div>
    </div>
  )
}


export default App;
