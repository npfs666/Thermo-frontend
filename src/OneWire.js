
/**
 * GaOu - 2025
 */
export class OneWire {

    static TYPE_DS18B20 = "ds18b20"
    static TYPE_DS2413 = "ds2413"

    static getType(address) {

        const family = address.toString().substring(2, 0)

        var type
        if (family === "40") {
            type = this.TYPE_DS18B20
        }
        if (family === "58") {
            type = this.TYPE_DS2413
        }
        return type
    }

    static getList( message, OWelements) {

        const obj = JSON.parse(message);

        for (const element of obj) {

            var type = this.getType(element.address)
            
            if (type === this.TYPE_DS18B20) {

                const TEMPLATE_DS18B20 = {
                    "address": element.address,
                    "name": element.name,
                    "type": type,
                    "temp": element.temp,
                    "resolution": element.resolution,
                    "offset": element.offset
                }
                OWelements.push(TEMPLATE_DS18B20)

            } else if (type === this.TYPE_DS2413) {
                
                const TEMPLATE_DS2413 = {
                    "address": element.address,
                    "name": element.name,
                    "type": type,
                    "pioa": element.pioA,
                    "piob": element.pioB
                }
                OWelements.push(TEMPLATE_DS2413)
            }
        }
    }

    static getSlaveModules(message, slaveModules) {

        const obj = JSON.parse(message);

        for (const element of obj) {
            
            const TEMPLATE_SLAVE = {
                "id": element.id,
                "name": element.nomCommun,
                "comment": element.comment,
                "type": element.type,
                "thermometer": element.ds18b20,
                "valve": element.ds2413,
                "pump": element.circulateur,
                "regulation": element.regulation,
                "active": element.active,
                "setpoint": element.setpoint
            }

            slaveModules.push(TEMPLATE_SLAVE)
        }
    }

    static formatHexAddr(address) {
        var bytes = [];
    
        for (var i = 0; i < address.length; i++) {
          bytes.push((address[i] & 0x00FF).toString(16).toUpperCase())
          if (i < (address.length - 1)) bytes.push(".")
        }
        return bytes
      }

    //null pour pas changer
    static setPio(client, addr, pioa, piob) {
        const template = {
            "address": addr,
            "pioA": pioa,
            "pioB": piob
        }
        client.publish("onewire/setPio", JSON.stringify(template));
    }

    static setDS18B20(client, addr, name, resolution, offset) {
        const template = {
            "address": addr,
            "name": name,
            "resolution": resolution,
            "offset": offset
        }
        //console.log(template)
        client.publish("onewire/setOWElement", JSON.stringify(template));
    }

    static setDS2413(client, addr, name) {
        const template = {
            "address": addr,
            "name": name
        }
        //console.log(template)
        client.publish("onewire/setOWElement", JSON.stringify(template));
    }

    static refreshTemp(client, addr) {
        const template = {
            "address": addr
        }
        client.publish("onewire/refreshTemp", JSON.stringify(template));
    }

    static setSlave(client, id, name, thermometer, valve, pump) {

        const template = {
            "id": id,
            "name": name,
            "thermometer": "[" + thermometer + "]",
            "valve": "[" + valve + "]",
            "pump": "[" + pump + "]"
        }
        client.publish("slave/setSlave", JSON.stringify(template));
    }

    static setControl(client, id, comment, regulation, setpoint) {

        const template = {
            "id": id,
            "comment": comment,
            "regulation": regulation,
            "setpoint": setpoint
        }

        client.publish("slave/setControl", JSON.stringify(template));
    }

    static discoverOWNetwork(client) {
        client.publish("onewire/refreshList", "");
    }

    static addSlave(client) {

        client.publish("slave/add", "123");
    }
}

export default OneWire