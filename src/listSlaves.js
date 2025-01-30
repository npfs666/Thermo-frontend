import React from 'react';
import OneWire from "./OneWire"

class listSlaves extends React.Component {

  //connection mqtt
  static client

  constructor(props) {
    super(props);
    this.client = this.props.client
    this.state = { devices: [], slaveModule: [], logConsole: [] }
  }

  // initalisation à la première création
  componentDidMount() {

    if (!this._Mounted) {
      this.onMessage = this.onMessage.bind(this)
      this.client.on('message', this.onMessage)
      this.client.subscribe("onewire/elements")
      this.client.subscribe("onewire/console")
      this.client.subscribe("slave/elements")
    }
  }

  // Fin de vie de l'objet
  componentWillUnmount() {
    this.client.off('message', this.onMessage)
    this.client.unsubscribe("onewire/elements")
    this.client.unsubscribe("onewire/console")
    this.client.unsubscribe("slave/elements")
    
  }


  onMessage(topic, message) {

    if (topic === "onewire/elements") {
      var newDevices = []
      OneWire.getList(message, newDevices)
      this.setState({ devices: newDevices })
    }

    if (topic === "slave/elements") {

      var newFermenters = []
      OneWire.getSlaveModules(message, newFermenters)


      this.setState({ slaveModule: newFermenters })
    }

    /*if (topic === "onewire/console") {
  
        var logConsole = []
      logConsole.push(JSON.parse(message) + "\n" + document.getElementById("console").value)
        this.setState({ logConsole: logConsole })
      }*/
  }


  clicCancel = e => {
    window.location.reload(false);
  }


  clicOk = e => {

    var id = e.target.id.toString().split("_")[1]

    var name = document.getElementById("inputName_" + id)
    var thermometer = document.getElementById("inputThermometer_" + id)
    var valve = document.getElementById("inputValve_" + id)
    var pump = document.getElementById("inputPump_" + id)

    //console.log(id + "  | " + name.value + "  | " + thermometer.value + "  | " + valve.value + "  | " + pump.value)
    OneWire.setSlave(this.client, id, name.value, thermometer.value, valve.value, pump.value)
    window.location.reload(false);
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


  handleOnChangeName = e => {
    let slaves = this.state.slaveModule
    var id = e.target.id.toString().split('_')[1];
    for (var i = 0; i < this.state.slaveModule.length; i++) {

      if (slaves[i].id.toString() === id) {
        slaves[i].name = e.target.value
      }
    }
    this.setState({ slaveModule: slaves })
  }

  handleAdd = e => {
    OneWire.addSlave(this.client);
  }

  handleDelete = e => {
    var id = e.target.id.toString().split("_")[1]

    OneWire.setSlave(this.client, id, "delete", "", "", "")
  }


  render() {
    return (
      <div className="w3-container w3-margin w3-center w3-margin " >
        <h2 >Gestion des Cuves<button className="w3-button w3-indigo w3-border w3-round-large" onClick={this.handleAdd}>Ajouter</button></h2>
        {this.state.slaveModule.map(listitem => (

          <div key={`bloc_${listitem.id}`} className="w3-content">

            {/* Titre du bloc */}
            <button type="button" onClick={this.handleCollapsible} className="collapsible">[{listitem.id}]<br />{listitem.name}</button>
            <div className="content">

              {/* Nom */}
              <div className="w3-row name w3-margin-top w3-margin-bottom">
                <div className="w3-col m2 s4 black border-left"><input type="text" defaultValue="Nom :" disabled /></div>
                <div className="w3-col m10 s8 border-right"><input type="text" id={`inputName_${listitem.id}`}
                  defaultValue={listitem.name} onChange={this.handleOnChangeName} /></div>
              </div>

              {/* Liste des capteurs de température */}
              <div className="w3-row name w3-margin-bottom ">
                <div className="w3-col m2 s4 black border-left"><input type="text" value="Thermom&egrave;tre :" disabled /></div>
                <div className="w3-col m10 s8 select">

                  <select id={`inputThermometer_${listitem.id}`} className="w3-select border-right" defaultValue={listitem.thermometer.address.toString()}>
                    {this.state.devices.map(oneWireList => (
                      (oneWireList.type === "ds18b20")
                        ? <option key={oneWireList.address} value={oneWireList.address}>{oneWireList.name} [{oneWireList.address}]</option>
                        : null
                    ))};
                  </select>
                </div>
              </div>

              {/* Liste des vannes */}
              <div className="w3-row name w3-margin-bottom border-left">
                <div className="w3-col m2 s4 black border-left"><input type="text" value="Vanne :" disabled /></div>
                <div className="w3-col m10 s8 select">
                  <select id={`inputValve_${listitem.id}`} className="w3-select border-right" defaultValue={listitem.valve.address.toString()}>
                    {this.state.devices.map(oneWireList => (
                      (oneWireList.type === "ds2413")
                        ? <option key={oneWireList.address} value={oneWireList.address}>{oneWireList.name} [{oneWireList.address}]</option>
                        : null
                    ))};
                  </select>
                </div>
              </div>

              {/* Liste des circulateurs */}
              <div className="w3-row name w3-margin-bottom border-left">
                <div className="w3-col m2 s4 black border-left"><input type="text" value="Circulateur :" disabled /></div>
                <div className="w3-col m10 s8 select">
                  <select id={`inputPump_${listitem.id}`} className="w3-select border-right" defaultValue={listitem.pump.address.toString()}>
                    {this.state.devices.map(oneWireList => (
                      (oneWireList.type === "ds2413")
                        ? <option key={oneWireList.address} value={oneWireList.address}>{oneWireList.name} [{oneWireList.address}]</option>
                        : null
                    ))};
                  </select>
                </div>
              </div>

              {/* Boutons validation et annuler */}
              <div className="w3-row name w3-margin-bottom">
                <div className="w3-col m2 s3">
                  <button className="w3-button w3-red w3-border w3-round-large"
                    id={`buttonDelete_${listitem.id}`}
                    onClick={this.handleDelete}>Supprimer
                  </button>
                </div>
                <div className="w3-col m6 s3 no-border"><input type="text" defaultValue="" disabled /></div>
                <div className="w3-col m2 s3"><button className="w3-button w3-green w3-border w3-round-large"
                  onClick={this.clicOk} id={`buttonOk_${listitem.id}`}>Valider</button></div>
                <div className="w3-col m2 s3"><button className="w3-button w3-orange w3-border w3-round-large"
                  onClick={this.clicCancel}>Annuler</button></div>
              </div>
            </div>
          </div>
        ))}
      </div >
    );
  }
}

export default listSlaves;