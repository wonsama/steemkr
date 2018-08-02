const {removeSpace2} = require('../../util/wstring');
const {getUrlValues} = require('../../util/wstring');

let fn = {};

/*
* 파서 - zdnet.co.kr/news
* @param $ cheerio
* @param _url 링크 주소
* @param tags 기본 태그
* @param bodyCut 본문내용 cut
* @param uniqueCut 고유주소 생성용 cut
* @return 파싱된 JSON 개체정보
*/
module.exports = ($, _url, tags, bodyCut, uniqueCut)=>{

  let title = $(`meta[property='og:title']`).attr('content'); // open graph
  let body = $("#content").text().substr(0,bodyCut).trim();
  let image = $(`meta[property='og:image']`).attr('content'); // open graph
  let url = $(`meta[property='og:url']`).attr('content'); // open graph  
  url = url?url:_url;

  let unique = getUrlValues(url).artice_id;

  // 이미지가 업로드 되지 않는 관계로 고정 
  image = `https://cdn.steemitimages.com/DQmSZKU7vhbixyTGFMFeLK73VkbRTrz7ASfShJ5tSddGdcX/logo.gif`;

  tags = removeSpace2(tags).split(',');		// string => array
  tags.push('zdnet');

  return {title:title, body:body, url:url, tags:tags, image:image, unique:unique?unique:'err'};
}