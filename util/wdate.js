let fn = {};

// 시간을 연산한다 
// h : 시간 
Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

/*
* 현재 시간 기준 입력받은 시간을 기준으로 변경된 시간 정보를 반환한다
* @param h 입력 받은 시간
* @return 현재 시간 기준 입력받은 시간을 기준으로 변경된 시간
*/
fn.getNowCHour = (h) =>{
	return new Date().addHours(h);
}

// created 정보를 Date로 변환 => 한국 +9
// created : 생성시간 
fn.getLocalTime = (created)=>{

	if(!created){
		return new Date();
	}else{
		created = created.replace("T", " ")
	  var t = new Date(created).addHours(9);
	  return t;	
	}
}

// 이전 날짜를 반환한다
// day : 몇일전
// startWithZero : 00:00:00 일 부터 시작할지 여부
fn.getBeforeDate = (day, startWithZero=true)=>{
	var date = new Date();
	date.setDate(date.getDate() - day);
	if(startWithZero){
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
	}
	return date;
}

module.exports = fn;