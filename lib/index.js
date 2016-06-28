'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _reactBootstrap = require('react-bootstrap');

var _reactJsonTree = require('react-json-tree');

var _reactJsonTree2 = _interopRequireDefault(_reactJsonTree);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fromJson = function fromJson(json) {
    return JSON.parse(json);
};
var toJson = function toJson(val) {
    return JSON.stringify(val, null, 4);
};

var DataSourceConfig = (0, _autobindDecorator2.default)(_class = function (_React$Component) {
    _inherits(DataSourceConfig, _React$Component);

    function DataSourceConfig(props) {
        _classCallCheck(this, DataSourceConfig);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DataSourceConfig).call(this, props));

        var exampleData = _this.props.data.exampleData ? _this.props.data.exampleData : {};

        _this.state = {
            show: false,
            dataType: _this.props.data.dataType ? _this.props.data.dataType : 'static',
            url: _this.props.data.url ? _this.props.data.url : "",
            staticData: _this.props.data.staticData ? _this.props.data.staticData : exampleData,
            interval: _this.props.data.interval ? _this.props.data.interval : 2000,
            repeat: true,
            channel: _this.props.data.channel ? _this.props.data.channel : "",
            startDynamic: _this.props.data.startDynamic ? _this.props.data.startDynamic : false,
            debugdata: "",
            server: _this.props.data.server ? _this.props.data.server : "",
            valid: true,
            servers: _this.props.data.servers ? _this.props.data.servers : ['mqtt://127.0.0.1:3883', 'ws://127.0.0.1:8080', 'socketio://127.0.0.1:10000']

        };

        return _this;
    }

    _createClass(DataSourceConfig, [{
        key: 'open',
        value: function open() {
            this.setState({ show: true });
        }
    }, {
        key: 'close',
        value: function close() {
            this.setState({ show: false });
        }
    }, {
        key: 'check',
        value: function check(input, msg) {
            if (input === "") {
                alert(msg);
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            _jquery2.default.get('/api/v1/servers', function (result) {
                _this2.setState({
                    servers: result
                });
                console.log("远程调用server", result);
            });

            this.setState({ show: true });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.setState({ show: false });
        }
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.setState({
                dataType: this.refs.dataType.getValue()
            });
        }
    }, {
        key: 'handleLog',
        value: function handleLog(msg) {

            if (this.props.onChange) {
                this.props.onChange(msg);
            }

            if (this.state.show && this.state.startDynamic) {
                this.setState({
                    debugdata: msg
                });
            }
        }
    }, {
        key: 'getDataSourceConfig',
        value: function getDataSourceConfig(close) {

            this.setState({
                show: false
            });

            if (close && this.state.startDynamic) {

                if (this.state.dataType === "pull") {

                    this.props.timerPool.stop(this.state.timerId);
                    this.setState({
                        timerId: null,
                        show: false
                    });
                } else if (this.state.dataType === "push") {
                    var serverURL = this.refs.server.getValue();
                    if (serverURL.indexOf("mqtt") > -1) {
                        var conn = this.props.mqttPool.get('ws://' + serverURL.split("mqtt://")[1]);
                        this.props.mqttPool.unsub(conn, this.refs.channel.getValue(), this.handleLog);
                    }
                }
            }

            return {
                url: this.refs.url.getValue(),
                staticData: this.refs.staticData.getValue(),
                dataType: this.refs.dataType.getValue(),
                interval: this.refs.interval.getValue(),
                channel: this.refs.channel.getValue(),
                repeat: this.state.repeat,
                server: this.refs.server.getValue(),
                startDynamic: this.state.startDynamic
            };
        }
    }, {
        key: 'handleRepet',
        value: function handleRepet(e) {
            this.setState({
                repeat: this.state.repeat ? false : true
            });
        }
    }, {
        key: 'handleDynamic',
        value: function handleDynamic(e) {

            var serverURL = this.refs.server.getValue();

            if (this.state.dataType === "pull") {

                if (this.refs.url.getValue() === "") {
                    alert('需要填写API URL');
                    return;
                }

                if (this.refs.interval.getValue() === "") {
                    alert('需要填写间隔时间');
                    return;
                }
            } else if (this.state.dataType === "push") {

                if (this.refs.channel.getValue() === "") {
                    alert('需要填写通道名字');
                    return;
                }
                if (serverURL.indexOf("mqtt") == -1 && serverURL.indexOf("socketio") == -1) {
                    alert('暂不支持该协议:' + serverURL);
                    return;
                }
            } else if (this.state.dataType = "staic") {

                try {
                    JSON.parse(this.refs.staticData.getValue());
                } catch (ex) {

                    console.log(ex, "chart data is wrong", this.refs.staticData.getValue());
                    alert('静态数据错误!');
                    return;
                }
            }

            var interval = 1000;
            try {
                interval = parseInt(this.refs.interval.getValue());
            } catch (e) {}

            this.setState({
                url: this.refs.url.getValue(),
                staticData: this.refs.staticData.getValue(),
                dataType: this.refs.dataType.getValue(),
                interval: interval,
                channel: this.refs.channel.getValue(),
                server: this.refs.server.getValue(),
                repeat: this.state.repeat

            });
        }
    }, {
        key: 'handleDynamicStatus',
        value: function handleDynamicStatus(start) {

            this.setState({
                startDynamic: start
            });
        }
    }, {
        key: '_checkValid',
        value: function _checkValid(src, defaultValue) {

            try {
                JSON.parse(src);
                return src;
            } catch (ex) {
                console.log("error", ex);
                return defaultValue ? defaultValue : "{}";
            }
        }
    }, {
        key: 'onCodeChange',
        value: function onCodeChange(code) {

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
    }, {
        key: 'onServerChange',
        value: function onServerChange() {

            this.setState({
                server: this.refs.server.getValue()
            });
        }
    }, {
        key: 'render',
        value: function render() {

            var staticDataShow = this.state.dataType === 'static' ? true : false;
            var chartURLShow = this.state.dataType === 'pull' ? true : false;
            var chartServerShow = this.state.dataType === 'push' ? true : false;

            var icon = this.state.valid ? "ok" : "remove";
            var color = this.state.valid ? "green" : "red";
            var style = { color: color };

            var jsonString = this.state.debugdata && this.state.debugdata !== "" ? toJson(this.state.debugdata) : "{}";

            var jsonStaticData = this.state.valid ? this._checkValid(this.state.staticData, "{}") : "{}";

            var _staticData = this.state.valid ? this._checkValid(this.state.staticData, "{}") : this.state.staticData1;

            var server = [];

            if (this.state.server != "") {
                server.push(this.state.server);
            }
            _lodash2.default.forEach(this.state.servers, function (item) {

                if (item != server[0]) {
                    server.push(item);
                }
            });

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    _reactBootstrap.Input,
                    { type: 'select', label: '类型', ref: 'dataType', value: this.state.dataType, onChange: this.handleDynamic.bind(this) },
                    _react2.default.createElement(
                        'option',
                        { value: 'static' },
                        '静态'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'pull' },
                        'Pull'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'push' },
                        'Push'
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: chartURLShow ? '' : 'hidden' },
                    _react2.default.createElement(
                        'span',
                        null,
                        'API URL'
                    ),
                    _react2.default.createElement(_reactBootstrap.Input, { type: 'text', ref: 'url', defaultValue: 'http://127.0.0.1:3000/chart/highchart/1?rows=1', value: this.state.url, onChange: this.handleDynamic.bind(this) }),
                    _react2.default.createElement(
                        'span',
                        null,
                        '时间间隔/ms(min: 100ms,max: 24hour) '
                    ),
                    _react2.default.createElement(_reactBootstrap.Input, { type: 'text', ref: 'interval', defaultValue: '2000' }),
                    _react2.default.createElement(_reactBootstrap.Input, { type: 'checkbox', ref: 'repeat', label: '是否重复', checked: this.state.repeat, onChange: this.handleRepet.bind(this) })
                ),
                _react2.default.createElement(
                    'div',
                    { className: staticDataShow ? '' : 'hidden' },
                    _react2.default.createElement(
                        'span',
                        null,
                        'JSON数据'
                    ),
                    _react2.default.createElement(_reactBootstrap.Input, { type: 'textarea', ref: 'staticData', rows: '10', value: _staticData, onChange: this.onCodeChange }),
                    _react2.default.createElement('span', { className: ' glyphicon glyphicon-' + icon, style: style }),
                    _react2.default.createElement(
                        'span',
                        { show: !this.state.valid, style: style },
                        this.state.error
                    ),
                    _react2.default.createElement(_reactJsonTree2.default, { data: fromJson(jsonStaticData) })
                ),
                _react2.default.createElement(
                    'div',
                    { className: chartServerShow ? '' : 'hidden' },
                    _react2.default.createElement(
                        _reactBootstrap.Input,
                        { type: 'select', label: '服务器列表', ref: 'server', value: this.state.dataType, onChange: this.onServerChange },
                        _lodash2.default.map(server, function (value, i) {

                            return _react2.default.createElement(
                                'option',
                                { key: i, value: value },
                                value
                            );
                        })
                    ),
                    _react2.default.createElement(
                        'span',
                        null,
                        '通道'
                    ),
                    _react2.default.createElement(_reactBootstrap.Input, { type: 'text', ref: 'channel', defaultValue: this.state.channel })
                ),
                _react2.default.createElement(
                    'div',
                    { className: staticDataShow ? 'hidden' : '' },
                    _react2.default.createElement('hr', null),
                    _react2.default.createElement(
                        _reactBootstrap.Button,
                        { bsStyle: 'success', bsSize: 'small', disabled: this.state.startDynamic, onClick: this.handleDynamicStatus.bind(this, true) },
                        '开始'
                    ),
                    '  ',
                    _react2.default.createElement(
                        _reactBootstrap.Button,
                        { bsStyle: 'warning', bsSize: 'small', disabled: !this.state.startDynamic, onClick: this.handleDynamicStatus.bind(this, false) },
                        '停止'
                    ),
                    _react2.default.createElement(_reactBootstrap.Input, { type: 'textarea', label: '测试数据', ref: 'debugdata', rows: '10', readOnly: 'true', value: jsonString })
                )
            );
        }
    }]);

    return DataSourceConfig;
}(_react2.default.Component)) || _class;

DataSourceConfig.propTypes = {
    actions: _react2.default.PropTypes.object,
    onChange: _react2.default.PropTypes.func.isRequired
};

DataSourceConfig.defaultProps = {};

exports.default = DataSourceConfig;