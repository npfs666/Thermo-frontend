import React from 'react';
import OneWire from "./OneWire"

class listOneWireElts extends React.Component {

  //connection mqtt
  static client

  constructor(props) {
    super(props);
    this.client = this.props.client
    this.state = { devices: [] , logConsole: []}
  }

  // initalisation à la première création
  componentDidMount() {

    if (!this._Mounted) {
      this.onMessage = this.onMessage.bind(this)
      this.client.on('message', this.onMessage)
      this.client.subscribe("onewire/elements")
	    this.client.subscribe("onewire/console")
    }
  }

  // Fin de vie de l'objet
  componentWillUnmount() {
    this.client.off('message', this.onMessage)
    this.client.unsubscribe("onewire/elements")
    this.client.unsubscribe("onewire/console")
  }

  onMessage(topic, message) {

    if (topic === "onewire/elements") {
      var devices = []
      OneWire.getList(message, devices)
      this.setState({ devices: devices })
    }
    if (topic === "onewire/console") {

      var logConsole = []
      logConsole.push(JSON.parse(message) + "\n" + document.getElementById("console").value)
      this.setState({ logConsole: logConsole })
    }

  }

  clicRefreshTemp = e => {
    OneWire.refreshTemp(this.client, e.target.value)
  }

  clicPioA = e => {
    var address = e.target.id.toString().split("_")[1]
    var pioB = document.getElementById("pioB_" + address)

    OneWire.setPio(this.client, address, e.target.checked, pioB.checked)
  }

  clicPioB = e => {
    var address = e.target.id.toString().split("_")[1]
    var pioA = document.getElementById("pioA_" + address)

    OneWire.setPio(this.client, address, pioA.checked, e.target.checked)
  }

  clicCancel = e => {
    window.location.reload(false);
  }

  clicOk = e => {
    var address = e.target.id.toString().split("_")[1]
    var type = OneWire.getType(address)

    var name = document.getElementById("inputName_" + address)

    if (type === OneWire.TYPE_DS18B20) {

      var resolution = document.getElementById("sliderResol_" + address)
      var offset = document.getElementById("sliderOffset_" + address)
      OneWire.setDS18B20(this.client, address, name.value, resolution.value, offset.value)
    }

    else if (type === OneWire.TYPE_DS2413) {

      OneWire.setDS2413(this.client, address, name.value)
    }

    //window.location.reload(false);
  }


  handleSliderResol = e => {
    var addr = e.target.id.toString().split('_')[1];

    let devices = this.state.devices
    for (var i = 0; i < this.state.devices.length; i++) {

      if (devices[i].address.toString() === addr) {
        devices[i].resolution = e.target.value
      }
    }
    this.setState({ devices: devices })
  }


  handleSliderOffset = e => {

    var addr = e.target.id.toString().split('_')[1];
    let devices = this.state.devices
    for (var i = 0; i < this.state.devices.length; i++) {

      if (devices[i].address.toString() === addr) {
        devices[i].offset = e.target.value
      }
    }
    this.setState({ devices: devices })
  }


  handleCollapsible(e) {
    e.target.classList.toggle("active");
    var content = e.target.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }


  handleOnChange = e => {
    let devices = this.state.devices
    var addr = e.target.id.toString().split('_')[1];
    for (var i = 0; i < this.state.devices.length; i++) {

      if (devices[i].address.toString() === addr) {
        devices[i].name = e.target.value
      }
    }
    this.setState({ devices: devices })
  }

  handleSearch = e => {
    OneWire.discoverOWNetwork(this.client);
  }

  handleDelete = e => {
    var addr = e.target.id.toString().split('_')[1];
    OneWire.setDS2413(this.client, addr, "delete")
  }


  render() {
    return (
      <div className="w3-container w3-margin w3-center w3-margin " >
        <h2 >Liste des éléments 1-Wire <button className="w3-button w3-indigo w3-border w3-round-large" onClick={this.handleSearch}>Search</button></h2>
        {this.state.devices.map(listitem => (

          <div key={`bloc_${listitem.address}`} className="w3-content">
            {/* Titre du bloc */}
            <button type="button" onClick={this.handleCollapsible} className={`collapsible 
              ${(listitem.type === "ds18b20") ? "thermometer" : ""}
              ${(listitem.type === "ds2413") ? "relay" : ""}`}>{listitem.name} <br />{OneWire.formatHexAddr(listitem.address)}</button>
            <div className="content">
              <div className="w3-row name w3-margin-top w3-margin-bottom">
                <div className="w3-col m2 s4 black border-left"><input type="text" defaultValue="Nom :" disabled /></div>
                <div className="w3-col m10 s8 border-right"><input type="text" id={`inputName_${listitem.address}`}
                  value={listitem.name} onChange={this.handleOnChange} /></div>
              </div>

              {/* Affichage d'un bloc config sonde ds18b20 */}
              {(listitem.type === "ds18b20")
                ? <div>
                  <div className="w3-row name w3-margin-bottom ">
                    <div className="w3-col m2 s4 black border-left"><input type="text" defaultValue="Température :" disabled readOnly /></div>
                    <div className="w3-col m8 s5"><input type="text" value={listitem.temp} disabled /></div>
                    <div className="w3-col m2 s3 border-right"><button id={`refreshTemp_${listitem.address}`}
                      onClick={this.clicRefreshTemp} value={listitem.address}>Refresh</button></div>
                  </div>
                  <div className="w3-row name w3-margin-bottom">
                    <div className="w3-col m2 s4 black border-left"><input type="text" defaultValue="Résolution :" disabled readOnly /></div>
                    <div className="w3-col m6 s4 slider"><input type="range" id={`sliderResol_${listitem.address}`} min="9"
                      max="12" value={listitem.resolution} onChange={this.handleSliderResol} /></div>
                    <div className="w3-col m2 s2 black"><input type="text" id={`sliderResolText_${listitem.address}`} value={listitem.resolution}
                      disabled readOnly /></div>
                    <div className="w3-col m2 s2 border-right"><input type="text" defaultValue="bits" disabled readOnly /></div>
                  </div>
                  <div className="w3-row name w3-margin-bottom">
                    <div className="w3-col m2 s4 black border-left"><input type="text" defaultValue="Offset :" disabled /></div>
                    <div className="w3-col m6 s4 slider"><input type="range" id={`sliderOffset_${listitem.address}`} min="-2"
                      max="2" value={listitem.offset} step="0.1" onChange={this.handleSliderOffset} /></div>
                    <div className="w3-col m2 s2 black"><input id={`sliderOffsetText_${listitem.address}`} type="text" value={listitem.offset}
                      disabled readOnly /></div>
                    <div className="w3-col m2 s2 border-right"><input type="text" defaultValue="&#8451;" disabled readOnly /></div>
                  </div>
                </div>
                : null
              }

              {/* Affichage d'un bloc config relais ds2413 */}
              {(listitem.type === "ds2413")
                ? <div className="w3-row name w3-margin-bottom border-left">
                  <div className="w3-col m8 s4 relay black"><input type="text" defaultValue="Relais :" disabled readOnly /></div>
                  <div className="w3-col m2 s4 check ">
                    <label><input type="checkbox" id={`pioA_${listitem.address}`} onChange={this.clicPioA}
                      checked={listitem.pioa} /> PioA</label>
                  </div>
                  <div className="w3-col m2 s4 check border-right">
                    <label><input type="checkbox" id={`pioB_${listitem.address}`} onChange={this.clicPioB}
                      checked={listitem.piob} /> PioB</label>
                  </div>
                </div>
                : null
              }

              {/* Boutons validation et annuler */}
              <div className="w3-row name w3-margin-bottom">
                <div className="w3-col m2 s3">
                  <button className="w3-button w3-red w3-border w3-round-large"
                    id={`buttonDelete_${listitem.address}`}
                    onClick={this.handleDelete}>Supprimer
                  </button>
                </div>
                <div className="w3-col m6 s3 no-border"><input type="text" defaultValue="" disabled /></div>
                <div className="w3-col m2 s3"><button className="w3-button w3-green w3-border w3-round-large"
                  onClick={this.clicOk} id={`buttonOk_${listitem.address}`}>Valider</button></div>
                <div className="w3-col m2 s3"><button className="w3-button w3-orange w3-border w3-round-large"
                  onClick={this.clicCancel}>Annuler</button></div>
              </div>
            </div>
          </div>
        ))}
		<div className="w3-panel">
			<textarea id="console" name="console" rows="4" cols="50" value={this.state.logConsole} readOnly />
		</div> 
      </div >
    );
  }
}

export default listOneWireElts;