/**
 * Created by rezanazari on 9/19/17.
 */
var GREGORIAN_EPOCH = 1721425.5,
	PERSIAN_EPOCH = 1948320.5;
persian_to_gregorian_Date = function(year, month, day){
	month=month + 1;
	if(month>12){
		year +=Math.floor(month / 12);
		month=month%12 || 12;
	}else if(month<1 && month>-12){
		if(month===0){
			year-=1;
		}else{
			year +=Math.floor((month / 12));
		}
		month+=12;
	}
	var greg = jd_to_gregorian(persian_to_jd(year, month, day));
	return new Date(greg[0],greg[1] - 1,greg[2]);
};
var jd_to_gregorian=function(jd) {
	var wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad, yindex, year, month, day, yearday, leapadj;

	wjd = Math.floor(jd - 0.5) + 0.5;
	depoch = wjd - GREGORIAN_EPOCH;
	quadricent = Math.floor(depoch / 146097);
	dqc = mod(depoch, 146097);
	cent = Math.floor(dqc / 36524);
	dcent = mod(dqc, 36524);
	quad = Math.floor(dcent / 1461);
	dquad = mod(dcent, 1461);
	yindex = Math.floor(dquad / 365);
	year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
	if (!((cent == 4) || (yindex == 4))) {
		year++;
	}
	yearday = wjd - gregorian_to_jd(year, 1, 1);
	leapadj = (
		(wjd < gregorian_to_jd(year, 3, 1)) ? 0 : (leap_gregorian(year) ? 1 : 2));
	month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
	day = (wjd - gregorian_to_jd(year, month, 1)) + 1;

	return new Array(year, month, day);
};
var  persian_to_jd=function(year, month, day) {
	var epbase, epyear;

	epbase = year - ((year >= 0) ? 474 : 473);
	epyear = 474 + mod(epbase, 2820);

	return day + ((month <= 7) ? ((month - 1) * 31) : (((month - 1) * 30) + 6)) + Math.floor(((epyear * 682) - 110) / 2816) + (epyear - 1) * 365 + Math.floor(epbase / 2820) * 1029983 + (PERSIAN_EPOCH - 1);
};
var  gregorian_to_jd=function(year, month, day) {
	return (GREGORIAN_EPOCH - 1) + (365 * (year - 1)) + Math.floor((year - 1) / 4) + (-Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400) + Math.floor(
			(((367 * month) - 362) / 12) + (
				(month <= 2) ? 0 : (leap_gregorian(year) ? -1 : -2)) + day);
};
var  leap_gregorian=function(year) {
	return ((year % 4) == 0) && (!(((year % 100) == 0) && ((year % 400) != 0)));
};
var mod = function (a, b) {
	return a - (b * Math.floor(a / b));
};
