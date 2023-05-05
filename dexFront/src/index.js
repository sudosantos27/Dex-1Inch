import React from "react";

//This imports the ReactDOM library, which is used to render React components to the DOM.
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";

// This imports the BrowserRouter component from the React Router library, which provides client-side routing functionality to the application.
import { BrowserRouter } from "react-router-dom";

// This imports various modules from the "wagmi" library, which is a blockchain development toolkit. 
// Specifically, it imports the functions for configuring blockchain networks and creating clients to interact with them.
import { configureChains, mainnet, WagmiConfig, createClient } from "wagmi";

// This imports the publicProvider module from the "wagmi/providers/public" library, which is used to provide access to public blockchain networks.
import { publicProvider } from "wagmi/providers/public";

// Configure the chains to be used with the app
// mainnet is the Ethereum main network
// publicProvider is a pre-configured Ethereum public node
// This function returns an object with two properties: provider and webSocketProvider
const { provider, webSocketProvider } = configureChains(
  [mainnet], // An array of chains to configure. In this case, it's just the Ethereum mainnet
  [publicProvider()] // An array of providers to use for each chain. In this case, it's just a single publicProvider for the Ethereum mainnet
);

// The createClient function is used to create an instance of the wagmi client that will be used to interact with the blockchain. 
// It takes an object with three properties as an argument: autoConnect, provider, and webSocketProvider.
const client = createClient({
  autoConnect: true, // The autoConnect property is a boolean that determines whether the client should automatically connect to the provider. In this case, it is set to true.
  provider, // The provider property is set to the provider returned by the configureChains function. This provider is used to interact with the blockchain.
  webSocketProvider // The webSocketProvider property is also set to the websocket provider returned by the configureChains function. This provider is used for real-time updates and events.
});

// create a root React component for rendering
const root = ReactDOM.createRoot(document.getElementById("root"));

// render the app within the root component, wrapping it in a StrictMode component
// StrictMode is a tool for highlighting potential problems in an application
// it activates additional checks and warnings for the development environment
root.render(
  <React.StrictMode>
    {/* Set up the WagmiConfig component to provide client to the app */}
    <WagmiConfig client={client}>
      {/* Use the BrowserRouter component to enable routing in the app */}
      <BrowserRouter>
        {/* Render the App component */}
        <App />
      </BrowserRouter>
    </WagmiConfig>
  </React.StrictMode>
);

