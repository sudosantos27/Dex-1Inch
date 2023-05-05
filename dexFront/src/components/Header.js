import React from 'react';
import Eth from "../eth.svg";
import { Link } from "react-router-dom";

// This is a functional component that takes in props as its argument.
// The props object contains address, isConnected, and connect properties.
function Header(props) {

  // Destructure the properties from the props object.
  const { address, isConnected, connect } = props;

  // The return statement renders the following HTML code.
  return (
    <header>
      <div className='leftH'>
        {/* The Link component creates a clickable link to the specified path. */}
        <Link to="/" className='link'>
          <div className='headerItem'>Swap</div>
        </Link>
        <Link to="/tokens" className='link'>
          <div className='headerItem'>Tokens</div>
        </Link>
      </div>

      <div className='rightH'>
        <div className='headerItem'>
          {/* The Eth SVG icon is displayed */}
          <img src={Eth} alt="eth" className='eth' />
          Ethereum
        </div>
        <div className='connectButton' onClick={connect}>
          {/* If the user is connected, their address is displayed, otherwise display a "Connect" button. */}
          {isConnected ? (address.slice(0,4) + "..." + address.slice(38)) : "Connect"}
        </div>
      </div>
    </header>
  )
}

export default Header