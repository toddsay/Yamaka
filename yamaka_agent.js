var volIncrement = 20; // 20 = -2.0db

$(document).ready(function() {
    chrome.browserAction.onClicked.addListener(function(tab) {
        // called when the extension's icon is clicked
    });

    chrome.commands.onCommand.addListener(function(command) {
        if (command == "volume-up") {
            adjustVolume(volIncrement);
        }
        if (command == "volume-down") {
            adjustVolume(-volIncrement);
        }
        if (command == "toggle-mute") {
            getMuteEnabled(function(isMute) {
                setMute(!isMute);
            });
        }
    });

    setTimeout(function() {}, 10000);
});

function getStatus(findSetting, callback) {
    var getCommand = buildYamahaCommand('GET', 1, 'Basic_Status', 'GetParam');
    sendYamahaCommand(getCommand, function(response) {
        var val = response.find(findSetting).text();
        callback(val);
    });
}

function adjustVolume(increment) {
    getCurrentVolume(function(volume) {
        var newVolume = volume + increment;
        setVolume(newVolume);
    });
}

function getCurrentVolume(callback) {
    getStatus('Volume Lvl Val', function(val) {
        var valInt = parseInt(val);
        callback(valInt);
    });
}

function setVolume(vol) {
    var params = '<Lvl><Val>' + vol + '</Val><Exp>1</Exp><Unit>dB</Unit></Lvl>';
    var setCommand = buildYamahaCommand('PUT', 1, 'Volume', params);
    sendYamahaCommand(setCommand);
}

function getMuteEnabled(callback) {
    getStatus('Volume Mute', function(val) {
        var isMute = val === 'On';
        callback(isMute);
    });
}

function setMute(enable) {
    var params = '<Mute>' + (enable ? 'On' : 'Off') + '</Mute>';
    var setCommand = buildYamahaCommand('PUT', 1, 'Volume', params);
    sendYamahaCommand(setCommand);
}

// Examples:
// <YAMAHA_AV cmd="GET"><Main_Zone><Basic_Status>GetParam</Basic_Status></Main_Zone></YAMAHA_AV>
// <YAMAHA_AV cmd="GET"><NET_RADIO><Play_Info>GetParam</Play_Info></NET_RADIO></YAMAHA_AV>
// <YAMAHA_AV cmd="GET"><Main_Zone><Volume><Lvl>GetParam</Lvl></Volume></Main_Zone></YAMAHA_AV>
// <YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Lvl><Val>-380</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></Main_Zone></YAMAHA_AV>
// <YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Mute>On</Mute></Volume></Main_Zone></YAMAHA_AV>
function buildYamahaCommand(verb, zone, section, params) {
    var zoneNode = zone == 0 ? 'System' : zone == 2 ? 'Zone_2' : 'Main_Zone';
    var command = '<YAMAHA_AV cmd="' + verb + '"><' + zoneNode + '><' + section + '>' + params + '</' + section + '></' + zoneNode + '></YAMAHA_AV>';
    return command;
}

function sendYamahaCommand(command, callback) {
    var url = 'http://10.10.8.180/YamahaRemoteControl/ctrl';

    $.post({
        url: url,
        data: command,
        dataType: 'xml',
        success: function(res) {
            if (callback) {
                callback($(res));
            }
        },
        fail: function(res) {
            alert('fail');
        }
    });
}