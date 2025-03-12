import React from 'react';
import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { Route, Routes, BrowserRouter } from "react-router";
import OWElements from './listOneWireElts';
import Slaves from './listSlaves'
import Control from './Control'
import Menu from './menu';
import './w3.css';
import './thermo.css'

function App() {
	
	const [client, setClient] = useState();
    
    useEffect(() => {
    }, [client])

    // A enlever pour remettre le login
    if (client == null) {
        var options = {
            username: "username",
            password: "password"
        };
        
        // A refaire pour gérer un VPN
        //mqttServer = "ws://" + window.location.hostname + ":9001"

        console.log(window.location.hostname);
        var mqttServer = "ws://176.166.18.87:9001"
        if( (window.location.hostname === "localhost") || (window.location.hostname === "192.168.1.13") ) {
          mqttServer = "ws://192.168.1.13:9001";
        } 
        
        var con = mqtt.connect(mqttServer, options)
        con.on('connect', onConnectionSuccess)
        con.on("error", onConnectionFailure)
        con.on("disconnect", onDisconnect)
        setClient(con)
    }

    function onConnectionSuccess() {
        console.log("Connection success")
        setClient(con);
    }

    function onConnectionFailure(error) {
        console.log("Connection failure "+error)
        setClient(null);
    }

    function onDisconnect() {
        console.log("Connection disconnect")
        setClient(null);
    }

	
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Menu />}>
        <Route index element={<OWElements client={client}/>} />
        <Route path="slaves" element={<Slaves client={client}/>} />
        <Route path="control" element={<Control client={client}/>} />
      </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;