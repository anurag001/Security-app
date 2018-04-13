function check_mobile()
{
	var mobile = $('#mobile').val();
	mobile = $.trim(mobile);
	
	if(mobile == '') 
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Please provide mobile Number.</span>');
		return false;
	} 
	else if (/\s/g.test(mobile))
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Don\'t provide spaces in mobile Number.</span>');
		return false;
	}
	else if(/\W/g.test(mobile))
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">You can\'t use special characters in mobile Number.</span>');
		return false;
	}
	else if(/[0-9]{10}/g.test(mobile)==false)
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Mobile no should be 10 digit number only.</span>');
		return false;
	}
	else
	{
		return true;
	}
}


function check_name()
{
	var name = $('#fullname').val();
	name = $.trim(name);

	if(name == '')
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Please provide your Last Name.</span>');
		return false;
	}
	else
	{
		return true;
	}
}

function check_password()
{
	var pass = $('#password').val();
	pass = $.trim(pass);

	if(pass == '')
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Please provide alphanumeric password. Don\'t use spaces.</span>');
		return false;
	}
	else if(/\W/g.test(pass))
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Password should be alphanumeric only.</span>');
		return false;
	}
	else
	{
		return true;
	}
}
	
$('#reg-form').on('submit',function(e){
	e.preventDefault();
	
	var url = "/register";
	if(check_name())
	{
		if(check_mobile())
		{
			if(check_password())
			{
				
				var mobile = $('#mobile').val();
				mobile = $.trim(mobile);
				var name = $('#fullname').val();
				name = $.trim(name);
				var pass = $('#password').val();
				pass = $.trim(pass);
				
				var data = {
					mobile:mobile,
					name:name,
					pass:pass
				};

				$.ajax({
					type:"POST",
					url:url,
					data:data,
					beforeSend:function()
					{
						$("#reg-info").html('<span style="color:blue;font-weight:bold;">Loading...</span>');
						$("#register-btn").prop("disabled",true);
						$("#register-btn").html("Loading...");
					},
					success: function(data){
						$("#reg-info").html(data);
						setTimeout(function(){
					 		$("#reg-info").html(""); 
						}, 8000);
					},
					error: function(){
						console.log(data.responseText);
						$("#reg-info").html('<span style="color:black;font-weight:bold;">Connection is Lost! Check your internet connection</span>');
					},
					complete: function()
					{
						$("#register-btn").prop("disabled",false);
						$("#register-btn").html("Sign Up");
					}
				});	
			}
		}
	}
});


$('#login-form').on('submit',function(e){	
	e.preventDefault();
	var url = "/signin";

	var logmobile = $("#logmobile").val();
	var logpass = $("#logpass").val();
	if(logmobile != '' && logpass != '' && /\W/g.test(logpass)==false)
	{
		var data = {
			logmobile:logmobile,
			logpass:logpass
		};

		$.ajax({
			type:"POST",
			url:url,
			data:data,
			beforeSend:function()
			{
				$("#log-info").html('<span style="color:blue;font-weight:bold;">Logging in...</span>');
				$("#login-btn").html("Logging...");
				$("#login-btn").prop("disabled",true);
			},
			success: function(data){
				if(data=="true")
				{
					window.location.href="/home";
				}
				else
				{
					$("#log-info").html(data);
				}				
			},
			error: function(data){
				$("#log-info").html('<span style="color:black"><b>Check your internet connection</b></span>');
				console.log(data.responseText);
			},
			complete: function()
			{
				$("#login-btn").html("Sign In");
				$("#login-btn").prop("disabled",false);
			}
		});

	}
	else
	{
		$("#log-info").html('<span style="color:red"><b>Invalid Credientials Format</b></span>');

	}
			
});


