const {removeSpace2} = require('../../util/wstring');
const {getUrlValues} = require('../../util/wstring');

/*
* 파서 - medium.com / medium.freecodecamp.org
* @param $ cheerio
* @param _url 링크 주소
* @param tags 기본 태그
* @param bodyCut 본문내용 cut
* @param uniqueCut 고유주소 생성용 cut
* @return 파싱된 JSON 개체정보
*/
module.exports = ($, _url, tags, bodyCut, uniqueCut)=>{
  let all = $('script').contents();
  let temp = [];
  for(let i=0;i<all.length;i++){temp.push(all[i]);};
  let filtered = temp.filter(x=>x&&x.data&&x.data.indexOf('obvInit')>0&&x.data.indexOf('versionId')>0);
  let contents = filtered[0].data;

  // [replace] JSON 파싱에서 오류가 발생하여 미리 변경 처리 한다.(유니코드 파싱오류) \x3c <
  contents = contents.replace(/\\x3c/g, '<');
  contents = contents.replace(/\\x3e/g, '>');

  let txtStart = 'window["obvInit"]({';
  let txtEnd = '"}}}}';

  let idxStart = contents.indexOf(txtStart);
  let idxEnd = contents.indexOf(txtEnd);

  let cutStart = idxStart + txtStart.length - 1;
  let cutEnd = idxEnd - cutStart + txtEnd.length;

  let json = JSON.parse(contents.substr(cutStart, cutEnd));

  //- let title = json.value.title;
  //- let createdAt = json.value.createdAt;
  //- let subTitle = json.value.content.subtitle;
  //-
  //- let p1 = json.value.content.bodyModel.paragraphs[0];  // type, text, markup
  //- type : 1 => 일반글
  //- type : 3 => 제목
  //- type : 7 => 인용
  //- type : 8 => 프로그램 소스
  //- type : 9 => 목록
  //- type : 4 => 그림 주석
  //- type : 11 => 소스 주석
  //- type : 13 => 강조글

  //- markups
  //- type : 1 => 강조
  //- type : 2 => 이탤릭

  let items = [];
  let item = {};
  let idx = 1;
  for (let para of json.value.content.bodyModel.paragraphs) {
    if (para.type == 3 || para.type == 13) {
        if (item.title != undefined) {
            items.push(item);
        }
        item = {};
        item.title = para.text;
        item.idx = idx;
        item.type = para.type;
        item.paragraphs = [];
        idx++;
    }
    if (para.type == 1 || para.type == 7 || para.type == 8 || para.type == 9) {
        item.paragraphs.push({ text: para.text, type: para.type });
    }
  }
  items.push(item);

  let title = $(`meta[property='og:title']`).attr('content'); // open graph
  let body = [];
  for(let it of items){
    body.push( '<b>' + it.title + '</b>\n');
    for(let pa of it.paragraphs){
      body.push( pa.text + '\n' );
    }
  }
  let image = $(`meta[property='og:image']`).attr('content'); // open graph
  let url = $(`meta[property='og:url']`).attr('content'); // open graph
  let unique = getUrlValues(url, true).substr(0,uniqueCut);

  tags = removeSpace2(tags).split(',');   // string => array
  tags.push('medium');

  return {title:title, body:body.join('').substr(0, bodyCut), url:url, tags:tags, image:image, unique:unique};
}