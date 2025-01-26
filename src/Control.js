import React from 'react';
import OneWire from "./OneWire"

class Control extends React.Component {

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
      this.client.subscribe("slave/elements")
    }
  }

  // Fin de vie de l'objet
  componentWillUnmount() {
    this.client.off('message', this.onMessage)
    this.client.unsubscribe("slave/elements")
  }


  onMessage(topic, message) {

    if (topic === "slave/elements") {

      var newFermenters = []
      OneWire.getSlaveModules(message, newFermenters)
      this.setState({ slaveModule: newFermenters })
    }
  }


  clicCancel = e => {
    window.location.reload(false);
  }


  clicOk = e => {
    var id = e.target.id.toString().split("_")[1]

    var comment = document.getElementById("inputComment_" + id)
    var regulation = document.getElementById("checkRegulation_" + id)
    var setpoint = document.getElementById("sliderRegul_" + id)
    
    OneWire.setControl(this.client, id, comment.value, regulation.checked, setpoint.value)
    
    //window.location.reload(false);
  }

  clicRefreshTemp = e => {    
    OneWire.refreshTemp(this.client, e.target.value)
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


  handleOnChangeComment = e => {
    let slaves = this.state.slaveModule
    var id = e.target.id.toString().split('_')[1];
    for (var i = 0; i < this.state.slaveModule.length; i++) {

      if (slaves[i].id.toString() === id) {
        slaves[i].comment = e.target.value
      }
    }
    this.setState({ slaveModule: slaves })
  }


  handleSliderRegul = e => {
    let slaves = this.state.slaveModule
    var id = e.target.id.toString().split('_')[1];
    for (var i = 0; i < this.state.slaveModule.length; i++) {

      if (slaves[i].id.toString() === id) {
        slaves[i].setpoint = e.target.value
      }
    }

    this.setState({ slaveModule: slaves })
  }


  render() {
    return (
      <div className="w3-container w3-margin w3-center w3-margin " >
        <h2 >Gestion des Cuves</h2>
        {this.state.slaveModule.map(listitem => (

          <div key={`bloc_${listitem.id}`} className="w3-content">
            
            {/* Titre du bloc */}
            <img className="test" src="fermentation2.png" alt=""/>
            {(listitem.regulation)
              ? (listitem.active)
                  ? <img className="test2 w3-spin" src="froid2.png" alt=""/>
                  : <img className="test2" src="froid2.png" alt=""/>
                
              : ""}
            
            <button type="button" onClick={this.handleCollapsible} 
              className={(listitem.regulation)
                          ? "collapsible fermenterCold"
                          : "collapsible fermenter"
              }>{listitem.name}<br />{listitem.comment}</button>
            <div className="content">
              
              {/* Nom // Commentaire */}
              <div className="w3-row name w3-margin-top w3-margin-bottom">
                <div className="w3-col m2 s4 black border-left"><input type="text" value="Bi&egrave;re :" disabled /></div>
                <div className="w3-col m10 s8 border-right"><input type="text" id={"inputComment_"+listitem.id}
                  value={listitem.comment} onChange={this.handleOnChangeComment} /></div>
              </div>
              
              {/* Themomètre + bouton refresh */}
              <div className="w3-row name w3-margin-bottom ">
                <div className="w3-col m2 s4 black border-left"><input type="text" value="Température :" disabled /></div>
                <div className="w3-col m9 s5"><input type="text" value={listitem.thermometer.temp + " °C"} disabled /></div>
                <div className="w3-col m1 s3 border-right"><button id={"refreshTemp_"+listitem.thermometer.address}
                  onClick={this.clicRefreshTemp} value={listitem.thermometer.address}>Refresh</button></div>
              </div>

              {/* Régulation on/off et consigne */}
              <div className="w3-row name w3-margin-bottom">
                <div className="w3-col m2 s4 black border-left"><input type="text" value="Consigne :" disabled /></div>
                <div className="w3-col m1 s8 black toggle">
                  <label className="switch">
                    <input type="checkbox" id={"checkRegulation_"+listitem.id} defaultChecked={listitem.regulation}/>
                      <span className="sliderButt round"></span>
                  </label>
                </div>
                <div className="w3-col m7 s8 slider"><input type="range" id={"sliderRegul_"+listitem.id} min="0"
                  max="30" value={listitem.setpoint} step="0.5" onChange={this.handleSliderRegul}/></div>
                <div className="w3-col m1 s2 black"><input type="text" id={"sliderRegulText_"+listitem.id} value=
                  {listitem.setpoint} disabled /></div>
                <div className="w3-col m1 s2 border-right"><input type="text" value="&#8451;" disabled /></div>
              </div>

              {/* Boutons validation et annuler */}
              <div className="w3-row name w3-margin-bottom">
                <div className="w3-col m8 s6 no-border"><input type="text" defaultValue="" disabled /></div>
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

export default Control;