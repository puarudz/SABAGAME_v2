require('dotenv').config();
const fs = require('fs');
const path = require('path');
var helper = require('../app/Helpers');
var db = require('../app/database');
var User = require('../models/users');
var histories = require('../models/history');
let request = require('request');
var WebSocket = require('ws');


// so sánh 2 mảng có giống nhau hay không ? true là có fasle ngược lại
function arraysIdentical(arrA, arrB) {
    //check if lengths are different
    if (arrA.length !== arrB.length) return false;
    //slice so we do not effect the original
    //sort makes sure they are in order
    //join makes it a string so we can do a string compare
    var cA = arrA.slice().sort().join(",");
    var cB = arrB.slice().sort().join(",");
    return cA === cB;
}

var _data_path = 'data';
var _logs_path = 'logs.txt';

var is_stop = 0; // stop process
var is_connected = 0;
var is_autowork = 0;

const wsServer = new WebSocket.Server({
    port: process.env.PORT1,
});

wsServer.on('connection', socket => {
    socket.send(JSON.stringify({
        type: 'socket',
        data: {
            action: 'connect',
            status: true
        }
    })); // send list compare    
    //console.log('Connected!');

    socket.on('message', (data) => {

        console.log('From Client: %s', data);

        _data_web = JSON.parse(data);

        switch (_data_web.type) {
            case 'excute':

                is_stop = 0;
                if(_data_web.autowork) {
                    is_autowork = 1;
                }

                if (_data_web.token && _data_web.session_token && _data_web.authtoken) {
                    var authtoken = _data_web.authtoken;

                    User.findOne({
                        'token': authtoken
                    }).exec(function (err, check) {
                        if (!check) {
                            console.log('Error Auth Token!');
                            socket.send(JSON.stringify({
                                type: 'notify',
                                data: {
                                    action: 'auth',
                                    type: 'error',
                                    msg: 'Lỗi xác minh tài khoản! Vui lòng tải lại trang'
                                }
                            })); // send auth status
                        } else {
                            var username = check.username;
                            console.log('Username: ' + username.toLowerCase());

                            var prod_mode = _data_web.prod_mode; // chế độ product, không mất tiền nếu = false
                            var bet_choice = _data_web.bet_choice; // 1 là tài, 2 là xỉu
                            var bet_start = _data_web.bet_start; // số tiền bet lần đầu tiên
                            var bet_change = _data_web.bet_loop; // số lần đổi đảo bet tài xỉu, xỉu tài
                            var bet_false = 0; // số lần bet thua
                            var bet_false_money = 0; // tiền do bet thua cửa lần bet trước
                            var bet_multiply = _data_web.bet_multiply; // x2 nếu thua bet
                            var bet_rate = _data_web.bet_rate; // hệ số rate
                            var bet_first = 1;
                            var round_id = '';
                            var total_thang = 0;
                            var total_thua = 0;
                            var total_chi = 0;
                            var total_thu = 0;
                            var current_money = 0;
                            var now_money = 0;
                            var total_tai = 0;
                            var total_xiu = 0;
                            var bridge = []; // mảng chứa 6 kết quả cuối cùng
                            var array_compare = _data_web.bet_logic; // thuật toán
                            var _is_betting = 0;
                            var mask_round_id = '';

                            socket.send(JSON.stringify({
                                type: 'analytic',
                                data: {
                                    action: 'list_compare',
                                    msg: array_compare
                                }
                            })); // send list compare


                            // Options header cho socket Go88
                            const ws_options = {
                                headers: {
                                    "accept-language": "vi,vi-VN;q=0.9,en-US;q=0.8,en;q=0.7",
                                    "cache-control": "no-cache",
                                    "pragma": "no-cache",
                                    "Origin": "https://play.go88.inf",
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
                                    "Upgrade": "websocket",
                                    "Connection": "Upgrade",
                                    "sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
                                    "sec-websocket-version": "13"
                                }
                            }

                            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                            var verify_token = new WebSocket('wss://socket.wsmt8g.com/socket.io/?token=' + _data_web.token + '&sv=v3&env=portal&games=all&EIO=3&transport=websocket&t=NYhG3oI', ws_options);


                            if (is_stop != 1) {

                                verify_token.on('message', function (data, flags) {
                                    //console.log(data);
                                    var user = data.split("421");
                                    if (typeof user[1] !== 'undefined' && user[1].length > 0) {
                                        if (helper.isJson(user[1])) {

                                            var user_data = JSON.parse(user[1]);
                                            if (typeof user_data[1] !== 'undefined') {
                                                var dulieu = user_data[1];

                                                /*********
                                                 * Đoạn này socket sẽ trả về tùy theo tài khoản
                                                 * Nếu tài khoản = 0 nghĩa là không có tiền
                                                 * thì sẽ socket trả về sẽ không tồn tại key chứa giá trị tiền còn lại
                                                 * nếu > 0 thì mới có keey chứa giá trị tiền
                                                 *  **********/

                                                current_money = dulieu.data.data.amount; // lấy ra tiền lúc đầu 
                                                now_money = dulieu.data.data.amount; // lấy ra tiền lúc đầu 

                                                fs.appendFileSync(_data_path + '/' + _logs_path, "Start at: " + helper.getTime() + "\n"); // log start
                                                fs.appendFileSync(_data_path + '/' + _logs_path, "Tiền hiện tại: " + current_money + "\n"); // log start

                                                socket.send(JSON.stringify({
                                                    type: 'notify',
                                                    data: {
                                                        action: 'auth',
                                                        type: 'success',
                                                        msg: 'STARTED EXCUTE...'
                                                    }
                                                })); // send auth status    

                                                socket.send(JSON.stringify({
                                                    type: 'userinfo',
                                                    data: {
                                                        action: 'userinfo',
                                                        msg: {
                                                            current_money: current_money
                                                        }
                                                    }
                                                })); // send auth status
                                                console.log('Tiền hiện tại: ' + current_money);
                                            }
                                        } else {
                                            current_money = 0; // lấy ra tiền lúc đầu 
                                            now_money = 0; // lấy ra tiền lúc đầu 

                                            socket.send(JSON.stringify({
                                                type: 'notify',
                                                data: {
                                                    action: 'auth',
                                                    type: 'error',
                                                    msg: 'Đăng nhập thất bại, vui lòng thử token khác!'
                                                }
                                            })); // send auth status
                                            console.log('Không lấy được số tiền hiện tại của user');
                                        }
                                    }
                                });

                                verify_token.on('error', (err) => {
                                    socket.send(JSON.stringify({
                                        type: 'notify',
                                        data: {
                                            action: 'auth',
                                            type: 'error',
                                            msg: 'Đăng nhập thất bại, vui lòng thử token khác!'
                                        }
                                    })); // send auth status      
                                    console.log('Tiền hiện tại: ' + current_money);
                                    console.log('Lỗi Socket: ', err)
                                })

                                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                                var socket_taixiu = new WebSocket('wss://api-mini.gowsazhjo.tv/websocket', ws_options);
                                socket_taixiu.on('open', function () {

                                    socket_taixiu.send('[1,"MiniGame","","",{"agentId":"1","accessToken":"' + _data_web.token + '","reconnect":false}]');

                                    setTimeout(function () { // đoạn này bắt buộc chờ 2s rồi mới gửi tiếp
                                        socket_taixiu.send('["6", "MiniGame", "taixiuPlugin", {"cmd": 1005}]'); // tai xiu chat
                                        socket_taixiu.send('["6","MiniGame","taixiuKCBPlugin",{"cmd":2000}]');
                                        socket_taixiu.send('[6,"MiniGame","lobbyPlugin",{"cmd":10001}]');

                                    }, 2000);

                                    var run_socket = 1;
                                    setInterval(function () {
                                        socket_taixiu.send('["7", "MiniGame", "1", ' + run_socket + ']');
                                        run_socket = run_socket + 1;
                                    }, 5000);

                                });


                                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



                                socket_taixiu.on('message', function (data, flags) {

                                    if (is_stop != 1) {

                                        var taixiu_pasre = JSON.parse(data);
                                        //console.log(data);         

                                        if (taixiu_pasre[0] == 5) { // lọc socket trả về dữ liệu của tài xỉu
                                            var data_taixiu = taixiu_pasre[1];
                                            //console.log(data_taixiu);
                                            ///////*************************************************************************************** */

                                            // thông báo với client là đã kết nối được tới Go88
                                            if (is_connected == 0) {
                                                is_connected = 1;
                                                socket.send(JSON.stringify({ // socket new round id
                                                    type: 'connect',
                                                    data: {
                                                        status: true,
                                                        msg: 'Đã Kết Nối!'
                                                    }
                                                })); // send connect status   

                                            }

                                            /*********************************************************************************************** */

                                            if (data_taixiu['cmd'] == 1002) {
                                                mask_round_id = '';
                                                round_id = data_taixiu['sid'];
                                                console.log('Bắt đầu phiên mới: #' + data_taixiu['sid']);
                                                /*** CODE XỬ LÝ KHI PHIÊN MỚI  ***/

                                                socket.send(JSON.stringify({ // socket new round id
                                                    type: 'analytic',
                                                    data: {
                                                        action: 'round_id',
                                                        msg: {
                                                            round_id: data_taixiu['sid']
                                                        }
                                                    }
                                                })); // send auth status      
                                            }



                                            if (data_taixiu['cmd'] == 1004) { // trả kết quả phiên

                                                var tong_die = data_taixiu['d1'] + data_taixiu['d2'] + data_taixiu['d3'];

                                                if (tong_die > 10) {
                                                    var _result_value = 1;
                                                } else {
                                                    var _result_value = 2;
                                                }

                                                if (_is_betting != 1) {
                                                    if (bridge.length < array_compare.length) { // kiểm tra mảng so sánh với mảng kết quả xem có giống nhau hay không
                                                        bridge.push(_result_value); // push vào cuối mảng kết quả
                                                    } else {
                                                        bridge.shift(); // xóa kết quả đầu trong mảng 
                                                        bridge.push(_result_value); // push vào cuối mảng kết quả
                                                    }
                                                }

                                                // xóa giá trị đầu và thêm vào giá trị cuối của mảng
                                                if (arraysIdentical(bridge, array_compare) == false) {
                                                    _is_betting = 0;
                                                    console.log("waiting...");
                                                } else {
                                                    _is_betting = 1;
                                                    console.log("Betting...");
                                                }

                                                socket.send(JSON.stringify({
                                                    type: 'analytic',
                                                    data: {
                                                        action: 'list_result',
                                                        msg: bridge
                                                    }
                                                })); // send list result

                                                console.log('Lịch Sử Game: ' + bridge); // in ra giá trị cầu đang nạp
                                                console.log('Mảng So Sánh: ' + array_compare); // in ra giá trị cầu cửa thuật toán
                                                console.log('=======================================');


                                                if (bet_first != 1) {
                                                    /*** GET LỊCH SỬ ĐẶT  ***/
                                                    request({
                                                        method: 'post',
                                                        url: 'https://api-gateway.gzbtdzprof.net/gwms/v1/lsc.aspx',
                                                        body: {
                                                            "sort": [{
                                                                "created_time": {
                                                                    "order": "desc"
                                                                }
                                                            }],
                                                            "from": 0,
                                                            "size": 20,
                                                            "query": {
                                                                "bool": {
                                                                    "must": [{
                                                                        "match": {
                                                                            "uid": "1_21157722"
                                                                        }
                                                                    }, {
                                                                        "match": {
                                                                            "game_id": "vgmn_100"
                                                                        }
                                                                    }]
                                                                }
                                                            }
                                                        },
                                                        headers: {
                                                            "content-type": "application/json",
                                                            "x-token": _data_web.session_token,
                                                        },
                                                        json: true,
                                                    }, function (error, response, body) {
                                                        //Print the Response
                                                        //console.log(body);  
                                                        var data_responsive = body;
                                                        //console.log(data_responsive['data'][0]['_source']);
                                                        if (data_responsive['code'] == 200) {
                                                            var msg = JSON.stringify({ // socket to client
                                                                type: 'history',
                                                                data: {
                                                                    action: 'history_bet',
                                                                    msg: data_responsive['data']
                                                                }
                                                            });
                                                            socket.send(msg); // send auth status              

                                                        } else {
                                                            console.log('Không lấy được lịch sử đặt cược!');
                                                        }

                                                    });

                                                }

                                            }

                                            ////////////////////////////////////////////////////////////////////////////////////////////////////
                                            // Update lại tiền
                                            if (data_taixiu['cmd'] == 1004) {

                                                // nếu tiền hiện tại < 1000(không đủ đặt) thì đừng chương trình
                                                if (now_money < 1000) {
                                                    is_stop = 1;
                                                    console.log('Tài khoản không đủ, chương trình stoped!');
                                                    socket.send(JSON.stringify({
                                                        type: 'notify',
                                                        data: {
                                                            action: 'auth',
                                                            type: 'error',
                                                            msg: 'Tài khoản của bạn không đủ để chạy!'
                                                        }
                                                    })); // send account status    
                                                }

                                                if (prod_mode) {
                                                    if (data_taixiu.hasOwnProperty("GX")) {
                                                        var biendong = data_taixiu['GX'];
                                                        total_thu = total_thu + biendong;
                                                        if (biendong > 0) {
                                                            now_money = now_money + biendong;

                                                            fs.appendFileSync(_data_path + '/' + _logs_path, "Biến động số dư: " + now_money + "\n"); // log start

                                                            socket.send(JSON.stringify({
                                                                type: 'analytic',
                                                                data: {
                                                                    action: 'update_now_money',
                                                                    msg: {
                                                                        now_money: now_money
                                                                    }
                                                                }
                                                            })); // send auth status  
                                                        }
                                                    }
                                                }

                                            }


                                            // Xử lý kết quả thắng hay thua, số tiền cần đặt ntn
                                            if (data_taixiu['cmd'] == 1004) { // trả kết quả phiên

                                                if (_is_betting == 1) {

                                                    if (bet_first != 1) {

                                                        var tong_dice = data_taixiu['d1'] + data_taixiu['d2'] + data_taixiu['d3']; // tính tổng 3 xúc xắc

                                                        // > 10 tài, <= 10 xỉu
                                                        if (tong_dice > 10) {
                                                            var _result = 'TÀI';
                                                            var _result_value = 1;
                                                        } else {
                                                            var _result = 'XỈU';
                                                            var _result_value = 2;
                                                        }

                                                        // + total tài và xỉu
                                                        if (_result_value == 1) {
                                                            total_tai = total_tai + 1;
                                                        } else {
                                                            total_xiu = total_xiu + 1;
                                                        }

                                                        socket.send(JSON.stringify({
                                                            type: 'analytic',
                                                            data: {
                                                                action: 'total_tai_xiu',
                                                                msg: {
                                                                    total_tai: total_tai,
                                                                    total_xiu: total_xiu
                                                                }
                                                            }
                                                        })); // send total chan le    

                                                        // tính tiền để chuẩn bị cho lần đặt tiếp theo 
                                                        if (_result_value == bet_choice) {
                                                            bet_change = _data_web.bet_loop;
                                                            bet_choice = _data_web.bet_choice;
                                                            bet_false = 0;
                                                            bet_false_money = bet_start;
                                                            var status = 'Thắng';
                                                            total_thang = total_thang + 1;
                                                            _is_betting = 0;
                                                            bridge = []; // xóa hết giá trị trong mảng đang chứa các kết quả
                                                            bet_first = 1;
                                                        } else {
                                                            bet_false = bet_false + 1000; // +1 lần thua
                                                            var status = 'Thua';
                                                            total_thua = total_thua + 1;
                                                            if (bet_false_money == 0) { // ván trước thắng, nhưng ván này thua mà tiền bet hòa vốn
                                                                bet_false_money = bet_start * bet_multiply + bet_false * bet_rate; // đặt lại số tiền  thua
                                                            } else {
                                                                bet_false_money = bet_false_money * bet_multiply + bet_false * bet_rate; // đặt lại biến cho bằng số tiền cần gỡ
                                                            }
                                                        }

                                                        // nếu tiền cần đặt > tiền hiện tại thì đặt hết 
                                                        if (bet_false_money > now_money) {
                                                            bet_false_money = now_money;
                                                        }

                                                        //console.log('Cần Đặt:------------> '+bet_false_money);
                                                        console.log('| Trạng thái       =====> Bạn ' + status);

                                                        socket.send(JSON.stringify({ // send kết quả round
                                                            type: 'analytic',
                                                            data: {
                                                                action: 'result_bet',
                                                                msg: {
                                                                    status: status,
                                                                    total_thang: total_thang,
                                                                    total_thua: total_thua,
                                                                    result: _result,
                                                                    result_value: _result_value
                                                                }
                                                            }
                                                        })); // send auth status    

                                                        fs.appendFileSync(_data_path + '/' + _logs_path, "|Kết Quả: " + _result + "| " + status + "\n"); // log start

                                                        console.log('Kết quả: ' + _result);
                                                        histories.updateOne({
                                                            id_game: mask_round_id
                                                        }, {
                                                            $set: {
                                                                status_game: status,
                                                                details: 'Bạn ' + status
                                                            }
                                                        }).exec();
                                                    } else { // end fisrt round
                                                        bet_false_money = bet_start;
                                                    }

                                                }
                                            }



                                            // Đặt Bet với số tiền và kết quả tính ở bên trên
                                            if (data_taixiu['cmd'] == 1002) {
                                                //console.log('Status Bet: '+_is_betting); //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                if (_is_betting == 1) {

                                                    if (is_stop != 1) { // check xem có lệnh dừng chưa, nếu chưa thì tiếp tục đat


                                                        round_id = data_taixiu['sid'];
                                                        console.log('Bắt đầu phiên mới: #' + data_taixiu['sid']);
                                                        /*** CODE XỬ LÝ KHI PHIÊN MỚI  ***/

                                                        fs.appendFileSync(_data_path + '/' + _logs_path, "Round: #" + data_taixiu['sid'] + "|"); // log start


                                                        // send remaintime về client
                                                        var i = 49;
                                                        var remaintime = setInterval(function () {

                                                            socket.send(JSON.stringify({ // socket new round id
                                                                type: 'analytic',
                                                                data: {
                                                                    action: 'remaintime',
                                                                    msg: {
                                                                        secounds: i
                                                                    }
                                                                }
                                                            })); // send auth status     

                                                            if (i === 0) {
                                                                clearInterval(remaintime);
                                                            } else {
                                                                i--;
                                                            }
                                                        }, 1000);


                                                        //console.log('Cần Đặtxxx:------------> ' + bet_false_money);
                                                        // ĐỔI KIỂU BET
                                                        if (bet_change == 0) { // nếu hết số lần đổi cửa thì đảo ngược giá trị của biến
                                                            if (bet_choice == 1) {
                                                                bet_choice = 2;
                                                            } else {
                                                                bet_choice = 1;
                                                            }
                                                            bet_change = _data_web.bet_loop;
                                                        }


                                                        // xuất text từ value của tài hoặc xỉu 
                                                        if (bet_choice == 1) var text_bet_choice = 'Tài';
                                                        else var text_bet_choice = 'Xỉu';


                                                        console.log('-------NEXT------');
                                                        console.log('| Bạn vừa đặt bet =====> ' + text_bet_choice);

                                                        socket.send(JSON.stringify({
                                                            type: 'analytic',
                                                            data: {
                                                                action: 'bet_choice',
                                                                msg: {
                                                                    bet_choice: bet_choice
                                                                }
                                                            }
                                                        })); // send auth status    





                                                        if (bet_first != 1) { // kiểm tra xem có phải round đầu hay không
                                                            socket.send(JSON.stringify({
                                                                type: 'analytic',
                                                                data: {
                                                                    action: 'bet_false_money',
                                                                    msg: {
                                                                        bet_money: bet_false_money
                                                                    }
                                                                }
                                                            })); // send auth status    
                                                            console.log('| Bạn Cược         =====> ' + bet_false_money);
                                                        } else {
                                                            socket.send(JSON.stringify({
                                                                type: 'analytic',
                                                                data: {
                                                                    action: 'bet_false_money',
                                                                    msg: {
                                                                        bet_money: bet_start
                                                                    }
                                                                }
                                                            })); // send auth status    

                                                            console.log('| Bạn Cược         =====> ' + bet_start);
                                                        }



                                                        console.log('| Số lần thua      =====> ' + bet_false + ' lần');

                                                        socket.send(JSON.stringify({
                                                            type: 'analytic',
                                                            data: {
                                                                action: 'bet_false',
                                                                msg: {
                                                                    bet_false: bet_false
                                                                }
                                                            }
                                                        })); // send auth status    

                                                        // console.log('Cần Đặtxxx:------------> ' + bet_false_money);

                                                        // đặt 
                                                        if (prod_mode) {
                                                            socket_taixiu.send('["6","MiniGame","taixiuPlugin",{"cmd": 1000,"b": ' + bet_false_money + ',"sid": ' + round_id + ',"aid": 1,"eid": ' + bet_choice + ',"sqe": false}]');
                                                        }

                                                        histories.create({
                                                            username: username,
                                                            game: 'go88',
                                                            game_func: 'logic-1',
                                                            id_game: round_id,
                                                            bet_money: bet_false_money,
                                                            status_game: '',
                                                            bet_win: '',
                                                            money_after_bet: '',
                                                            details: '',
                                                            time: helper.timestamp()
                                                        });
                                                        mask_round_id = round_id;

                                                        fs.appendFileSync(_data_path + '/' + _logs_path, text_bet_choice + "|" + bet_false_money); // log start

                                                        total_chi = Number(total_chi) + Number(bet_false_money);

                                                        if (prod_mode) {
                                                            now_money = Number(now_money) - Number(bet_false_money);
                                                            histories.updateOne({
                                                                id_game: mask_round_id
                                                            }, {
                                                                $set: {
                                                                    money_after_bet: 0
                                                                }
                                                            }).exec();
                                                            socket.send(JSON.stringify({
                                                                type: 'analytic',
                                                                data: {
                                                                    action: 'update_now_money',
                                                                    msg: {
                                                                        now_money: now_money,
                                                                        total_thu: total_thu
                                                                    }
                                                                }
                                                            })); // send auth status    
                                                        }


                                                        console.log('=> Đặt ' + text_bet_choice + ': ' + bet_false_money);

                                                        socket.send(JSON.stringify({
                                                            type: 'logs',
                                                            data: {
                                                                action: 'bet_game',
                                                                msg: {
                                                                    bet_choice: bet_choice,
                                                                    bet_game: bet_false_money,
                                                                    total_chi: total_chi
                                                                }
                                                            }
                                                        })); // send auth status    


                                                        // giảm số lần để thay bet
                                                        bet_change = bet_change - 1;

                                                        console.log('| BET chuyển kèo   =====> còn ' + bet_change + ' lần nữa');

                                                        bet_chip_pre = []; // làm trống mảng chứa các phỉnh

                                                        console.log("=================================\n");

                                                        //////////////////
                                                        bet_first = 0; // set không còn là round đầu nữa


                                                    }
                                                } // end check _is_betting
                                            }


                                        }

                                    } else {
                                        verify_token.close();
                                        socket_taixiu.close();
                                    }
                                });

                            }

                            ////////////////////////////////////////////////////////////////////////////////////
                            socket_taixiu.on('error', (err) => {
                                console.log('Loi => ', err);
                                socket.send(JSON.stringify({ // socket new round id
                                    type: 'connect',
                                    data: {
                                        status: false,
                                        msg: 'Không kết nối được!'
                                    }
                                })); // send connect status   
                            });
                        }
                    });
                } else {
                    var msg = JSON.stringify({
                        type: 'notify',
                        data: {
                            action: 'auth',
                            type: 'error',
                            msg: 'Vui lòng điền đầy đủ thông tin !'
                        }
                    });
                    socket.send(msg);
                }

                break;
            case 'stop':
                setTimeout(function () {
                    process.exit();
                }, 500);
                break;
            default:
                // code block
        }

    });
    socket.on('close', () => {
        if(is_autowork != 1) {
            is_stop = 1;
        }
        is_connected = 0;
        console.log('User Is Disconnected!');
    });
})
console.log(`Socket 1 at port: ${process.env.PORT1}`);