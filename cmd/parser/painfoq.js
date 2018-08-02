const {removeSpace2} = require('../../util/wstring');
const {getUrlValues} = require('../../util/wstring');

let fn = {};

/*
* 파서 - infoq.com/news, /minibooks, /presentations
* @param $ cheerio
* @param _url 링크 주소
* @param tags 기본 태그
* @param bodyCut 본문내용 cut
* @param uniqueCut 고유주소 생성용 cut
* @return 파싱된 JSON 개체정보
*/
module.exports = ($, _url, tags, bodyCut, uniqueCut)=>{
	
	let image = $(`meta[property='og:image']`).attr('content'); // open graph
  let url = _url.split('?')[0];
  let unique = getUrlValues(url, true).substr(0,uniqueCut);

  let title;
  let body;

  // 앞에서 필터링된 경로 정보만 사용할 수 있음 
  if(url.indexOf('/news')>0){
  	title = `[NEWS] `+$(`meta[property='og:title']`).attr('content'); // open graph
  	body = $("div.text_info").text().substr(0,bodyCut).trim();
  }else if(url.indexOf('/minibooks')>0){
  	title = `[EBOOK] `+removeSpace2($('#content').find('h1.general').text()).trim(); // open graph
  	body = $("div.ebook").find('div.txt').text().substr(0,bodyCut).trim();
  }else if(url.indexOf('/presentations')>0){
  	title = `[PT] `+$(`meta[property='og:title']`).attr('content'); // open graph
  	body = $(`meta[property='og:description']`).attr('content'); // open graph
  }

  tags = removeSpace2(tags).split(',');		// string => array
  tags.push('infoq');

  return {title:title, body:body, url:url, tags:tags, image:image, unique:unique?unique:'err'};
}