let fn = {};

/*
* 입력받은 문자열에서 2개이상의 공백은 1개 공백으로 치환한다
* @param source 입력받은 문자열
* @param spaceOnly 단순 스페이스 문자열만 치환할지 여부
* @return 공백이 제거된 문자열
*/
fn.removeSpace2 = (source, spaceOnly=false)=>{
	if(spaceOnly){
		return source.replace(/ +/g, ' ');
	}
	return source.replace(/\s\s+/g, ' ');
}

/*
* 모든 공백 줄바꿈 문자 제거
* @param source 입력받은 문자열
* @return 공백이 제거된 문자열
*/
fn.removeSpace = (source)=>{
	return source.replace(/\s\s+/g, '');
}

/*
* 입력받은 URL 주소의 호스트명을 넘겨준다.
* @param url 주소
* @return 호스트명
*/
fn.getHostAddr = (url) => {
	let q = url.split('?');
	let p = q[0];
	let s = p.split('/');
	s = s.filter(x=>x!='');

	if(s[0].indexOf('http')>=0){
		return s[1];
	}else{
		return s[0];
	}
}

/*
* URL에서 KEY, VALUE를 추출하여 object로 만든다.
* @param url 주소
* @param isLast 주소 정보에서 / 나뉜것 중 마지막 값을 추출 ? 앞 이후 값은 포함되지 않음
* @return URL 정보
*/
fn.getUrlValues = (url, isLast=false) => {

	let q = url.split('?');
	if(isLast){
		let p = q[0];
		let s = p.split('/');
		s = s.filter(x=>x!='');
		return s[s.length-1].replace(/\%/gi,'');
	}

	if(!q || q.length!=2){
		console.error('not support');
		return null;
	}

	let kvs = q[1].split('&');
	let out = {};
	for(let kv of kvs){
		let p = kv.split('=');
		out[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
	}
	return out;
}

module.exports = fn;