import React from 'react'
import autobind from 'autobind-decorator'
import { Modal, Button, Input,Tabs,Tab,Label,Text } from 'react-bootstrap'
import JSONTree from 'react-json-tree'

import _ from 'lodash'
import $  from 'jquery'

const fromJson = (json) => JSON.parse(json);
const toJson = (val) => JSON.stringify(val, null, 4);


@autobind
class DataSourceConfig extends React.Component {
    constructor(props) {
        super(props)

        let exampleData =this.props.data.exampleData?this.props.data.exampleData:{}
       
        this.state = {
            show: false,
            dataType: this.props.data.dataType ? this.props.data.dataType : 'static',
            url: this.props.data.url ? this.props.data.url : "",
            staticData: this.props.data.staticData ? this.props.data.staticData : exampleData ,
            interval: this.props.data.interval ? this.props.data.interval : 2000,
            repeat: true,
            channel: this.props.data.channel ? this.props.data.channel : "",
            startDynamic: this.props.data.startDynamic ? this.props.data.startDynamic : false,
            debugdata: "",
            server:this.props.data.server?this.props.data.server:"",
            valid:true,
            servers: this.props.data.servers ? this.props.data.servers : [
                'mqtt://127.0.0.1:3883',
                'ws://127.0.0.1:8080',
                'socketio://127.0.0.1:10000',
            ]

        }

    }

    open() {
        this.setState({ show: true})
    }

    close() {
        this.setState({ show: false })
    }

    check(input,msg){
        if(input===""){
            alert(msg)
        }
    }

    componentDidMount() {

        $.get('/api/v1/servers', (result) => {
            this.setState({
                servers: result
            })
            console.log("远程调用server", result)
        });

        this.setState({show: true})
    }

    componentWillUnmount() {
        this.setState({show: false})
    }


    handleChange(e) {
        this.setState({
            dataType: this.refs.dataType.getValue()
        })
    }


    handleLog(msg) {

        if (this.props.onChange) {
            this.props.onChange(msg);
        }

        if (this.state.show && this.state.startDynamic) {
            this.setState({
                debugdata: msg
            })
        }

    }

    getDataSourceConfig(close) {

        this.setState({
            show: false
        })


        if (close && this.state.startDynamic) {

            if (this.state.dataType === "pull") {

                this.props.timerPool.stop(this.state.timerId);
                this.setState({
                    timerId: null,
                    show: false
                });

            } else if (this.state.dataType === "push") {
                var serverURL = this.refs.server.getValue();
                if(serverURL.indexOf("mqtt")>-1){
                var conn = this.props.mqttPool.get('ws://' + serverURL.split("mqtt://")[1]);
                this.props.mqttPool.unsub(conn, this.refs.channel.getValue(), this.handleLog)
                }
            }

        }

        return ({
            url: this.refs.url.getValue(),
            staticData: this.refs.staticData.getValue(),
            dataType: this.refs.dataType.getValue(),
            interval: this.refs.interval.getValue(),
            channel: this.refs.channel.getValue(),
            repeat: this.state.repeat,
            server: this.refs.server.getValue(),
            startDynamic: this.state.startDynamic
        })

    }


    handleRepet(e) {
        this.setState({
            repeat: this.state.repeat ? false : true
        })
    }



    handleDynamic(e) {


        var serverURL = this.refs.server.getValue();

        if (this.state.dataType === "pull") {

            if (this.refs.url.getValue() === "") {
                alert('需要填写API URL')
                return;
            }

            if (this.refs.interval.getValue() === "") {
                alert('需要填写间隔时间')
                return;
            }

        } else if (this.state.dataType === "push") {

            if (this.refs.channel.getValue() === "") {
                alert('需要填写通道名字')
                return;
            }
            if (serverURL.indexOf("mqtt") == -1&&serverURL.indexOf("socketio") == -1) {
                alert('暂不支持该协议:' + serverURL)
                return;
            }

        } else if (this.state.dataType = "staic") {

            try {
                JSON.parse(this.refs.staticData.getValue())
            } catch (ex) {

                console.log(ex, "chart data is wrong", this.refs.staticData.getValue());
                alert('静态数据错误!');
                return;
            }

        }



        var interval = 1000;
        try {
            interval = parseInt(this.refs.interval.getValue())
        } catch (e) {

        }


        this.setState({
            url: this.refs.url.getValue(),
            staticData: this.refs.staticData.getValue(),
            dataType: this.refs.dataType.getValue(),
            interval: interval,
            channel: this.refs.channel.getValue(),
            server: this.refs.server.getValue(),
            repeat: this.state.repeat,
           
        })
        
    }



    handleDynamicStatus(start) {

            this.setState({
                 startDynamic: start
            })
       
    }


    _checkValid(src, defaultValue) {

        try {
            JSON.parse(src)
            return src;
        } catch (ex) {
            console.log("error",ex)
            return defaultValue ? defaultValue : "{}"
        }

    }

    onCodeChange(code) {

        try {
            fromJson(this.refs.staticData.getValue());
            this.setState({
                valid: true,
                staticData: toJson(fromJson(this.refs.staticData.getValue())),
                error: ""
            });
        } catch (err) {
            console.log(err instanceof SyntaxError); // true
            console.log(err.stack);
            this.setState({
                valid: false,
                error: err.toString()
            });
        }

    }



    onServerChange() {

       this.setState({
                server: this.refs.server.getValue()
            });
       

    }

  render() {

    var staticDataShow=(this.state.dataType==='static')?true:false;
    var chartURLShow=(this.state.dataType==='pull')?true:false;
    var chartServerShow=(this.state.dataType==='push')?true:false;
    
    const icon = this.state.valid ? "ok" : "remove";
    const color = this.state.valid ? "green" : "red";
    const style={color:color}


    var jsonString= (this.state.debugdata&&this.state.debugdata!=="")?toJson(this.state.debugdata):"{}";

    const jsonStaticData = this.state.valid ? this._checkValid(this.state.staticData,"{}") : "{}";

    const _staticData = this.state.valid? this._checkValid(this.state.staticData,"{}"):this.state.staticData1;

  
    const server=[]
    
     if(this.state.server!=""){
        server.push(this.state.server)
     }
     _.forEach(this.state.servers, (item) =>{

        if(item!=server[0]){
            server.push(item);
        }

     })
    
    
    return (
      
        <div>

        <Input type='select' label='类型' ref='dataType' value={this.state.dataType} onChange={this.handleDynamic.bind(this)}>
                <option value='static'>静态</option>
                <option value='pull'>Pull</option>
                <option value='push'>Push</option>
        </Input>

            
            <div className={chartURLShow ?'': 'hidden'}>
               <span>API URL</span>
               <Input type='text'  ref="url" defaultValue="http://127.0.0.1:3000/chart/highchart/1?rows=1" value={this.state.url} onChange={this.handleDynamic.bind(this)}/>
               <span>时间间隔/ms(min: 100ms,max: 24hour) </span>
               <Input type='text' ref='interval' defaultValue="2000"/>
               <Input type="checkbox" ref="repeat" label="是否重复" checked={this.state.repeat} onChange={this.handleRepet.bind(this)}/>
               
            </div>

            <div className={staticDataShow ?'': 'hidden'}>
              <span>JSON数据</span>
              <Input type='textarea'  ref="staticData"  rows="10" value={_staticData} onChange={this.onCodeChange}/> 
             
               <span className={` glyphicon glyphicon-${icon}`}  style={style}/>
                <span show={!this.state.valid} style={style}>{this.state.error}</span>
               <JSONTree data={ fromJson(jsonStaticData) } /> 
           
            </div>


            <div className={chartServerShow ?'': 'hidden'}>
              <Input type='select' label='服务器列表' ref='server' value={this.state.dataType} onChange={this.onServerChange}>
                {
                _.map(server,(value, i) => {
               
                return (
                  <option key={i} value={value} >{value}</option>
                )
              })
             }
            </Input>
            <span>通道</span>
            <Input type='text'  ref="channel" defaultValue={this.state.channel} />    
            </div>

            <div className={staticDataShow?'hidden':'' }>
            <hr/>

            <Button  bsStyle="success" bsSize="small" disabled={this.state.startDynamic} onClick={this.handleDynamicStatus.bind(this,true)}>开始</Button>&nbsp;&nbsp;
            <Button  bsStyle="warning" bsSize="small" disabled={!this.state.startDynamic} onClick={this.handleDynamicStatus.bind(this,false)}>停止</Button>
            <Input type='textarea' label='测试数据' ref="debugdata"  rows="10" readOnly="true" value={jsonString}/>  
            </div>
         </div>
    )
  }
}

DataSourceConfig.propTypes = {
  actions: React.PropTypes.object,
  onChange: React.PropTypes.func.isRequired
}



DataSourceConfig.defaultProps = {

  

}

export default DataSourceConfig
