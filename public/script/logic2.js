$(document).ready(function () {
    $('#connect_selector').hide();
    $('#stop').hide();

    // auto scroll game logs
    window.setInterval(function () {
        var elem = document.getElementById('logs');
        elem.scrollTop = elem.scrollHeight;
    }, 300);

    $('#number_of_bet_false').on('change', function () {
        // Explode Token
        var bet_money = Number($('#bet_start').val());
        var bet_multiply = Number($('#bet_multiply').val());
        var number_of_bet_false = Number($('#number_of_bet_false').val());
        var money_need_to_bet = 0;
        var is_first = 1;

        for (var i = 1; i <= number_of_bet_false; i++) {
            if (is_first == 1) {
                money_need_to_bet = bet_money * bet_multiply + i * 1000;
                is_first = 0;
            } else {
                money_need_to_bet = money_need_to_bet * bet_multiply + i * 1000;
            }
        }
        console.log(money_need_to_bet);
        cuteToast({
            type: "info",
            message: "Số tiền phải đủ " + number_format(money_need_to_bet),
            timer: 5000
        });
    });

});

var ws = new WebSocket("ws://" + server + ":" + port);

// KẾT NỐI ĐƯỢC TỚI SV
ws.onopen = function () {

    $(document).ready(function () {

        $('#excute').click(function () {
            $('#excute').prop("disabled", true);
            $('#excute').html('Đang thực hiện');

            var prod_mode = $('#prod_mode').prop('checked');
            var bet_choice = $('#bet_choice').val();
            var bet_start = $('#bet_start').val();
            var bet_loop = $('#bet_loop').val();
            var bet_multiply = $('#bet_multiply').val();
            var bet_rate = $('#bet_rate').val();

            var msg = JSON.stringify({
                type: 'excute',
                token: $('#token').val(),
                session_token: $('#session_token').val(),
                useragent: navigator.userAgent,
                prod_mode: prod_mode,
                bet_choice: bet_choice,
                bet_start: bet_start,
                bet_loop: bet_loop,
                bet_multiply: bet_multiply,
                bet_rate: bet_rate
            });
            ws.send(msg);

        });

        $('#stop').click(function () {
            var msg = JSON.stringify({
                type: 'stop'
            });
            ws.send(msg);
            play_audio('stop');
        });

    });
};


// SOCKET NHẬN TỪ SV VỀ
ws.onmessage = function (data) {
    //console.log(data); 

    var _data = JSON.parse(data.data);

    switch (_data.type) {



        case 'connect':
            if (_data.data.status == true) {
                $('#connect-status').html('<div class="loader--grid colord_bg_2 mb_30"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>');
                $('#connect-msg').addClass('bold green');
                $('#connect-msg').html('Đã Kết Nối');
                setTimeout(() => {
                    $('#connect_selector').fadeOut();
                }, 5000);
            }else {
                setTimeout(() => {
                        swal({
                                title: "Không kết nối được tới Go88?",
                                text: "Bạn vui lòng lấy lại Token và Session và thực hiện lại!",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: '#DD6B55',
                                allowEscapeKey: true,
                                cancelButtonText: 'Hủy',
                                confirmButtonText: 'Đồng ý!',
                                closeOnConfirm: false,
                                //closeOnCancel: false
                            },
                            function () {
                                window.location = "/";
                            });
                }, 5000);
            }
            break;



        case 'notify':
            // authen 
            if (_data.data.action == 'auth') {
                cuteToast({
                    type: _data.data.type,
                    message: _data.data.msg,
                    timer: 5000
                });

                if (_data.data.type == 'success') {
                    //$('#stop').show();
                    $('#excute').hide();
                    $('#connect_selector').fadeIn();
                    setTimeout(() => {
                        if ($('#curent_money').html() == '...') {
                            swal({
                                    title: "Không lấy được thông tin tài khoản?",
                                    text: "Bạn vui lòng lấy lại Token và Session và thực hiện lại!",
                                    type: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: '#DD6B55',
                                    allowEscapeKey: true,
                                    cancelButtonText: 'Hủy',
                                    confirmButtonText: 'Đồng ý!',
                                    closeOnConfirm: false,
                                    //closeOnCancel: false
                                },
                                function () {
                                    window.location = "/";
                                });
                        }
                    }, 5000);
                } else {
                    //$('#stop').hide();
                    $('#excute').html('<i class="fa fa-play" aria-hidden="true"></i> Run Bot');
                    $('#excute').prop("disabled", false);
                    $('#excute').show();
                    
                }

            }
            break;

        case 'userinfo':
            // get user info - money
            if (_data.data.action == 'userinfo') {
                //$('#userinfo').prepend('<div class="col-lg-4 col-md-4"><b>Name:</b></div><div class="col-lg-8 col-md-8"><input style="height: 22px;" type="text" readonly id="name" class="form-control" value="' + _data.data.msg.name + '"></div><br>');
                $('#curent_money').html(number_format(_data.data.msg.current_money));
                $('#now_money').html(number_format(_data.data.msg.current_money));
            }
            break;

        case 'logs':

            // bet game
            if (_data.data.action == 'bet_game') {
                if (_data.data.msg.bet_choice == 1) {
                    var choice = "Tài";
                } else {
                    var choice = "Xỉu";
                }

                $('#logs').append('===> Cược <b>' + choice + '</b>: <b>' + number_format(_data.data.msg.bet_game) + '</b><br>');
                $('#total_chi').html(number_format(_data.data.msg.total_chi));
            }

            break;

        case 'analytic':

            if (_data.data.action == 'remaintime') {
                if (_data.data.msg.secounds <= 5) {
                    $('#remaintime').addClass('red');
                    $('#remaintime').html(_data.data.msg.secounds);
                    play_audio('remaintime');
                } else {
                    $('#remaintime').removeClass('red');
                    $('#remaintime').html(_data.data.msg.secounds);
                }
            }

            // kết quả bet
            if (_data.data.action == 'result_bet') {
                if (_data.data.msg.status == 'Thắng') {
                    var text_result = '<b class="bold green">Thắng</b>';
                    play_audio('thang');
                } else {
                    var text_result = '<b class="bold red">Thua</b>';
                    play_audio('thua');
                }
                $('#result_bet').html(text_result);

                $('#total_thang').html(_data.data.msg.total_thang);
                $('#total_thua').html(_data.data.msg.total_thua);
                $('#logs').append('===> Kết Quả: ' + text_result + '<br>');
                show_result(Number(_data.data.msg.result_value));
                setTimeout(function () {
                    show_result('');
                }, 5000);
                $('#round_id').html('Đang lấy...');
            }

            // bet bạn đang chọn
            if (_data.data.action == 'bet_choice') {
                if (_data.data.msg.bet_choice == 1) {
                    var bet_dat = 'Tài';
                } else {
                    var bet_dat = 'Xỉu';
                }
                // show_result(_data.data.msg.bet_choice);
                play_audio('bet');
                $('#bet_choicing').html(bet_dat);
                $('#logs').append('===> Đang Đặt <b>' + bet_dat + '</b><br>');
            }

            // tiền đang bet
            if (_data.data.action == 'bet_false_money') {
                $('#bet_money').html(number_format(_data.data.msg.bet_money));
                play_audio('cuoc-bet');
            }

            // số lần đang thua so với lúc đầu
            if (_data.data.action == 'bet_false') {
                var text_bet_false = Number(_data.data.msg.bet_false) / 1000;
                $('#bet_false').html(text_bet_false);
                $('#logs').append('===> Đang thua <b>' + text_bet_false + '</b> lần <br>');

            }

            // total chan va lẻ
            if (_data.data.action == 'total_tai_xiu') {
                $('#total_tai').html(_data.data.msg.total_tai);
                $('#total_xiu').html(_data.data.msg.total_xiu);
            }

            // chuyển round mới
            if (_data.data.action == 'round_id') {
                $('#round_id').html('#' + _data.data.msg.round_id);
                $('#result_bet').html('Đang chờ ...');
                play_audio('finish');
                $('#round_id').addClass('red');
                setTimeout(function () {
                    $('#round_id').removeClass('red');
                }, 7000);
                $('#logs').append('#Round ID: <b>' + _data.data.msg.round_id + '</b><br>');
            }

            // cập nhật tiền hiện tại
            if (_data.data.action == 'update_now_money') {
                $('#now_money').html(number_format(_data.data.msg.now_money));
                $('#total_thu').html(number_format(_data.data.msg.total_thu));
            }


            break;


        case 'history':
            if (_data.data.action == 'history_bet') {

                $('#lichsu').html('');

                var array_history = _data.data.msg;
                array_history.sort().reverse();

                $.each(array_history, function (i, val) {

                    var arr = val['_source'];
                    //console.log(arr['id']);

                    var round_id = arr['id'];
                    var bet_result = arr['game_ticket_status'];
                    var bet_money = number_format(arr['game_stake']);
                    var bet_after_amount = number_format(arr['amount_after']);
                    var bet_time = arr['created_time'];
                    var bet_details = arr['game_your_bet'];

                    if (bet_result == 'Win') {
                        text_bet_result = '<b class="bold green">Thắng</b>';
                        bet_win = '<b class="bold green">+' + number_format(arr['game_winlost']) + '</b>';
                    } else if (bet_result == 'Lose') {
                        text_bet_result = '<b class="bold red">Thua</b>';
                        bet_win = '<b class="bold red">' + number_format(arr['game_winlost']) + '</b>';
                    } else {
                        text_bet_result = '<b class="bold update">Đang cập nhật...</b>';
                        bet_win = '<b class="bold update">Đang cập nhật...</b>';
                    }

                    if (round_id) {
                        var history_row = '<tr><th scope="row" class="text-center">#' + round_id + '</th><td class="text-center">' + text_bet_result + '</td><td class="text-center">' + bet_money + '</td><td class="text-center">' + bet_win + '</td><td class="text-center">' + bet_after_amount + '</td><td class="text-center">' + bet_details + '</td><td class="text-center">' + bet_time + '</td></tr>';
                        $('#lichsu').prepend(history_row);
                    }

                });

            }


            break;

        default:
            // code block
    }
}

ws.onclose = function () {
    // websocket is closed.
    console.log("Connection is closed...");
    cuteToast({
        type: "error",
        message: "Connection is closed...",
        timer: 5000
    });
};

function show_result(bet) {
    switch (bet) {
        case 1:
            $('#die-chan').removeClass('die-current');
            $('#die-le').removeClass('die-current');
            $('#die-chan').addClass('die-current');
            break;
        case 2:
            $('#die-chan').removeClass('die-current');
            $('#die-le').removeClass('die-current');
            $('#die-le').addClass('die-current');
            break;
        default:
            $('#die-chan').removeClass('die-current');
            $('#die-le').removeClass('die-current');
            break;
    }
}

function play_audio(type) {
    if ($($('#audio')).prop("checked")) {
        var audio = new Audio('media/' + type + '.mp3');
        audio.play();
    }

}

function getTime() {
    var now = new Date();
    return ((now.getMonth() + 1) + '/' + (now.getDate()) + '/' + now.getFullYear() + " " + now.getHours() + ':' +
        ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())));
}

function number_format(number) {
    number = new Intl.NumberFormat('vi-VN').format(number);
    return number;
}