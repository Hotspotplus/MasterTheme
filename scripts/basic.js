/**
 * Created by rezanazari on 9/17/17.
 */
window.hotspot = window.hotspot || {};
window.hotspot.data = {
	businessId: "597ab067dfd00b001f7959e0",
	nasId:      "59bcf176e81aeb001e440df6",
	routerType: "mikrotik"
};

var apiUrl = "http://pintime.io/api/"
window.hotspot.urls = {
	signIn:      apiUrl + "Members/signIn",
	signUp:      apiUrl + "Members/createHotSpotMember",
	recoverPass: apiUrl + "Members/recoverHotspotUser",
	verify:      apiUrl + "Members/verifyHotSpot"
};

window.hotspot.message = {
	"generalError":            "خطایی در برنامه رخ داده است",
	"invalidCode":             "کد صحیح نیست",
	"recoverySmsSent":         "رمز عبور به موبایل شما پیامک شد",
	"userNotFound":            "کاربری با این مشخصات پیدا نشد",
	"userAlreadyExist":        "این نام کاربری قبلا استفاده شده است",
	"alreadyMember":           "در حال حاضر شما عضو هستید. اگر رمز عبور خود را فراموش کرده‌اید از بازیابی رمز عبور استفاده کنید.",
	"signUpSuccess":           "عضویت شما با موفقیت انجام شد. ",
	"signUpVerificationError": "خطای ارسال بیش از حد کد تایید",
	"activateUsername":        "برای فعال سازی اینترنت خود با مدیر تماس بگیرید",
	"code500":                 "خطایی در سمت سرور رخ داده با مدیر شبکه تماس بگیرید",
	"code600":                 "خطایی در سمت سرور رخ داده با مدیر شبکه تماس بگیرید",
	"code604":                 "خطایی در سمت سرور رخ داده با مدیر شبکه تماس بگیرید",
	"code601":                 "شما هیچ بسته ی اینترنتی ندارید، ابتدا یک بسته انتخاب کنید",
	"code602":                 "زمان استفاده ی شما از اینترنت به اتمام رسیده است",
	"code603":                 "حجم مصرفی شما به اتمام رسیده است",
	"code605":                 "مدت بسته ی اینترنت شما به اتمام رسیده است",
	"code606":                 "یک نفر دیگر با این نام کاربری در حال استفاده از اینترنت است، دقایقی دیگر تلاش کنید"

};

//login to hotSpot
function signIn ( hostname ) {
	var form = getFormResults ( $ ( '#signIn' ).serializeArray () );
	var options = {};
	options.businessId = window.hotspot.data.businessId;
	options.nasId = window.hotspot.data.nasId;
	options.routerType = window.hotspot.data.routerType;
	options.username = englishNumber( form.username );
	options.password = englishNumber( form.password );
	// request for login to api
	$.ajax ( {
		type:        "POST",
		url:         window.hotspot.urls.signIn,
		data:        JSON.stringify ( options ),
		success:     function ( result ) {
			if ( result.ok === true ) {
				var loginUrl = "http://" + hostname + "/login";
				var statusUrl = "http://" + hostname + "/status";
				// request for login to mikrotik
				$.ajax ( {
					type:        "POST",
					url:         loginUrl,
					data:        {
						'username': options.username,
						'password': options.password
					},
					success:     function ( ) {
						location.href = statusUrl;
					},
					error:       function ( error ) {
						if ( error ) {
							alert ( window.hotspot.message.generalError );
						}
					},
					contentType: 'application/x-www-form-urlencoded'
				} );
			} else if ( result.ok === false ) {
				var code = result.errorCode;
				switch ( code ) {
					case 600:
						alert ( window.hotspot.message.code600 );
						break;
					case 601:
						alert ( window.hotspot.message.code601 );
						break;
					case 602:
						alert ( window.hotspot.message.code602 );
						break;
					case 603:
						alert ( window.hotspot.message.code603 );
						break;
					case 605:
						alert ( window.hotspot.message.code605 );
						break;
					case 604:
						alert ( window.hotspot.message.code604 );
						break;
					case 606:
						alert ( window.hotspot.message.code606 );
						break;
					default:
						var message = result.message['reply:Reply-Message'];
						alert ( message );
						break;
				}
			}
		},
		error:       function ( error ) {
			if ( error ) {
				alert ( window.hotspot.message.generalError );
			}
		},
		dataType:    "json",
		contentType: "application/json"
	} );
};

//signUp for hotSpot
function signUp ( hostname, mac ) {
	var options = getFormResults ( $ ( '#signUp' ).serializeArray () );
	options.age = Number ( options.age );
	if ( options.birthYear && options.birthMonth && options.birthDay ) {
		options.birthYear = Number ( options.birthYear );
		options.birthMonth = Number ( options.birthMonth );
		options.birthDay = Number ( options.birthDay );
		var date = persian_to_gregorian_Date ( options.birthYear, options.birthMonth - 1, options.birthDay );
		options.birthday = new Date ( date ).getTime ();
	}
	options.id = window.hotspot.data.businessId;
	options.nasId = window.hotspot.data.nasId;
	options.host = hostname;
	options.mac = mac;
	$.ajax ( {
		type:        "POST",
		url:         window.hotspot.urls.signUp,
		data:        JSON.stringify ( options ),
		success:     function ( result ) {
			if ( result.status === -1 ) {
				alert ( window.hotspot.message.alreadyMember );
			} else if ( result.status === 0 ) {
				var verifyUrl = "http://" + hostname + "/verify.html?id=" + result.memberId;
				location.href = verifyUrl;
			} else if ( result.status == 2 ) {
				alert ( window.hotspot.message.signUpVerificationError );
			}
		},
		error:       function ( error ) {
			if ( error ) {
				var err = error.responseJSON.error;
				if ( err.statusCode == 422 && err.detail.context == 'member' && err.name == 'ValidationError' ) {
					alert ( window.hotspot.message.userAlreadyExist );
				} else {
					alert ( window.hotspot.message.generalError );
				}
			}
		},
		dataType:    "json",
		contentType: "application/json"
	} );
};

//logout of hotSpot
function signOut( logoutUrl ){
	$.ajax({
		type:        "POST",
		url:         logoutUrl,
		success:     function ( ) {
			location.href = logoutUrl;
		},
		error:       function ( error ) {
			if ( error ) {
				alert ( window.hotspot.message.generalError );
			}
		},
		contentType: 'application/x-www-form-urlencoded'
	} );
};

//verification of user signUp
function verify ( hostname, mac ) {
	var code = $ ( '#code' ).val ();
	var memberId = window.location.href.slice(window.location.href.indexOf('?') + 1).split('=')[1];
	var options = {
		memberId: memberId,
		id:       window.hotspot.data.businessId,
		nasId:            window.hotspot.data.nasId,
		host:             hostname,
		mac:              mac,
		verificationCode: englishNumber( code )
	}
	$.ajax ( {
		type:        "POST",
		url:         window.hotspot.urls.verify,
		data:        JSON.stringify ( options ),
		success:     function ( result ) {
			alert ( window.hotspot.message.signUpSuccess );
			var loginUrl = "http://" + hostname + "/login.html";
			location.href = loginUrl;
		},
		error:       function ( error ) {
			var err = error.responseJSON.error;
			if (err.statusCode == 500 && err.message == 'invalid code'){
				alert ( window.hotspot.message.invalidCode );
			} else {
				alert ( window.hotspot.message.generalError );
			}
		},
		dataType:    "json",
		contentType: "application/json"
	} );
};

//recover password
function recoverPass ( hostname, mac ) {
	var userMobile = $ ( '#username' ).val ();
	var options = {
		usernameOrMobile: englishNumber( userMobile ),
		businessId:       window.hotspot.data.businessId,
		nasId:            window.hotspot.data.nasId,
		host:             hostname,
		mac:              mac
	}
	$.ajax ( {
		type:        "POST",
		url:         window.hotspot.urls.recoverPass,
		data:        JSON.stringify ( options ),
		success:     function () {
			alert ( window.hotspot.message.recoverySmsSent );
		},
		error:       function ( error ) {
			var errorMessage = window.hotspot.message.generalError;
			if ( error.responseJSON.error.message ) {
				var message = error.responseJSON.error.message;
				if ( message.trim() ==  'member not found' ) {
					errorMessage = window.hotspot.message.userNotFound;
				}
			}
			alert ( errorMessage );
		},
		dataType:    "json",
		contentType: "application/json"
	} );
};

function setOrPush ( target, val ) {
	var result = val;
	if ( target ) {
		result = [target];
		result.push ( val );
	}
	return result;
};

function getFormResults ( formElements ) {
	var formParams = {};
	var elem = null;
	for ( var i = 0; i < formElements.length; i++ ) {
		elem = formElements[i];
		if (elem.value != ""){
			formParams[elem.name] = setOrPush ( formParams[elem.name], englishNumber(elem.value) );
		}
	}
	return formParams;
};

function englishNumber ( value ) {
	value = String ( value );
	if ( !value ) return '';
	var s = value.toString();
	s = s.replace( /۱/g, "1" ).replace( /۲/g, "2" ).replace( /۳/g, "3" ).replace( /۴/g, "4" ).replace( /۵/g, "5" ).replace( /۶/g, "6" ).replace( /۷/g, "7" ).replace( /۸/g, "8" ).replace( /۹/g, "9" ).replace( /۰/g, "0" ).replace( /١/g, "1" ).replace( /٢/g, "2" ).replace( /٣/g, "3" ).replace( /٤/g, "4" ).replace( /٥/g, "5" ).replace( /٦/g, "6" ).replace( /٧/g, "7" ).replace( /٨/g, "8" ).replace( /٩/g, "9" ).replace( /٠/g, "0" );
	return s;
};