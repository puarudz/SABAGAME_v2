const inputs = document.querySelectorAll(".input");


function addcl() {
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl() {
	let parent = this.parentNode.parentNode;
	if (this.value == "") {
		parent.classList.remove("focus");
	}
}


inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});


// Login
$(document).ready(() => {
	$('#login_submit').click(() => {
		$("#login_submit").prop("disabled", true);
		$('#login_submit').val('Đăng thực hiện');
		$.ajax({
			url: "/auth",
			type: "post",
			dataType: "json",
			data: {
				type: 'signin',
				username: $('#username').val(),
				password: $('#password').val()
			},
			success: function (json) {
				if(json.status) {
					cuteToast({
						type: "success",
						message: json.msg,
						timer: 5000
					});
					setTimeout (() => {
						window.location = "/";
					}, 1000 );
				}else {
					$("#login_submit").prop("disabled", false);
					$('#login_submit').val('Đăng nhập');
					cuteToast({
						type: "error",
						message: json.msg,
						timer: 5000
					});
				}
			}
		});
	});
});



// Register
$(document).ready(() => {
	$('#register_submit').click(() => {
		$("#register_submit").prop("disabled", true);
		$('#register_submit').val('Đăng thực hiện');
		$.ajax({
			url: "/auth",
			type: "post",
			dataType: "json",
			data: {
				type: 'register',
				username: $('#username').val(),
				password: $('#password').val(),
				passwordcf: $('#passwordcf').val()
			},
			success: function (json) {
				if(json.status) {
					cuteToast({
						type: "success",
						message: json.msg,
						timer: 5000
					});
					setTimeout (() => {
						window.location = "/signin";
					}, 1000 );
				}else {
					$("#register_submit").prop("disabled", false);
					$('#register_submit').val('Đăng kí');
					cuteToast({
						type: "error",
						message: json.msg,
						timer: 5000
					});
				}
			}
		});
	});
});